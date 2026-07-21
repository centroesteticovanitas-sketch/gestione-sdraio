/* ============================================================
 * firebase.js
 * Accesso e sincronizzazione prenotazioni
 * ============================================================
 */

"use strict";

firebase.initializeApp(FIREBASE_CONFIG);

const autenticazioneFirebase = firebase.auth();
const archivioFirebase = firebase.firestore();
const funzioniFirebase = firebase.functions("europe-west1");

let sincronizzazioneFirebaseAttiva = false;
let interrompiAscoltoPrenotazioni = null;
let primoCaricamentoFirebase = true;
let ultimoSalvataggioFirebase = Promise.resolve();

// Il link Esci attende l'ultimo salvataggio: evita che una prenotazione
// appena creata venga interrotta passando subito alla pagina di logout.
window.esciDopoSalvataggio = evento => {

    evento.preventDefault();

    const destinazione = evento.currentTarget.href;

    Promise.race([
        ultimoSalvataggioFirebase,
        new Promise(resolve => setTimeout(resolve, 8000))
    ]).finally(() => {

        window.location.href = destinazione;

    });

    return false;

};

function ruoloFirebaseCorrente() {

    const email = autenticazioneFirebase.currentUser?.email?.toLowerCase();

    return email === EMAIL_AMMINISTRATORE ? "amministratore" : "collaboratore";

}

function utenteFirebaseAmministratore() {

    return ruoloFirebaseCorrente() === "amministratore";

}

function utenteFirebaseAutenticato() {

    return Boolean(autenticazioneFirebase.currentUser);

}

function richiediAccessoFirebase() {

    if (utenteFirebaseAutenticato()) return true;

    mostra(DOM.modal.accesso);

    return false;

}

function inizializzaAccessoFirebase() {

    const email = document.getElementById("txtEmailAccesso");
    const password = document.getElementById("txtPasswordAccesso");
    const errore = document.getElementById("erroreAccesso");

    document.getElementById("btnAccedi").onclick = async () => {

        errore.textContent = "";

        try {

            await autenticazioneFirebase.signInWithEmailAndPassword(
                email.value.trim(),
                password.value
            );

        }
        catch (erroreAccesso) {

            errore.textContent = "Email o password non validi.";

        }

    };

    document.getElementById("btnUsaAccessoPiscina").onclick = () => {

        email.value = EMAIL_PISCINA;
        password.focus();

    };

    autenticazioneFirebase.onAuthStateChanged(utente => {

        if (!utente) {

            sincronizzazioneFirebaseAttiva = false;

            if (interrompiAscoltoPrenotazioni) {

                interrompiAscoltoPrenotazioni();
                interrompiAscoltoPrenotazioni = null;

            }

            document.body.classList.remove("collaboratore");
            document.body.classList.add("non-autenticato");

            nascondi(DOM.header.menuMobile);

            mostra(DOM.modal.accesso);

            return;

        }

        document.body.classList.remove("non-autenticato");
        nascondi(DOM.modal.accesso);
        applicaPermessiFirebase();
        avviaSincronizzazioneFirebase();

    });

}

function applicaPermessiFirebase() {

    document.body.classList.toggle(
        "collaboratore",
        !utenteFirebaseAmministratore()
    );

    DOM.header.btnEsci.classList.remove("hidden");

}

function avviaSincronizzazioneFirebase() {

    if (interrompiAscoltoPrenotazioni) {

        interrompiAscoltoPrenotazioni();

    }

    sincronizzazioneFirebaseAttiva = true;
    primoCaricamentoFirebase = true;
    // La fonte unica Ã¨ Firestore: non manteniamo dati di browser precedenti.
    Stato.prenotazioni = [];

    interrompiAscoltoPrenotazioni = archivioFirebase
        .collection("prenotazioni")
        .onSnapshot(snapshot => {

            // Firebase puÃ² fornire per prima una cache locale ancora vuota.
            // In quel caso manteniamo i dati visibili finchÃ© non arriva la
            // risposta effettiva dal server.
            if (
                primoCaricamentoFirebase &&
                snapshot.empty &&
                snapshot.metadata.fromCache &&
                Stato.prenotazioni.length
            ) {

                return;

            }

            if (
                primoCaricamentoFirebase &&
                snapshot.empty &&
                Stato.prenotazioni.length &&
                utenteFirebaseAmministratore()
            ) {

                primoCaricamentoFirebase = false;
                salvaArchivioFirebase(Stato.prenotazioni);

                return;

            }

            primoCaricamentoFirebase = false;

            Stato.prenotazioni = snapshot.docs.map(documento =>
                creaPrenotazione({ ...documento.data(), id: documento.id })
            );

            const coloriCorretti = normalizzaColoriPrenotazioni(Stato.prenotazioni);

            if (coloriCorretti && utenteFirebaseAmministratore()) {

                salvaArchivioFirebase(Stato.prenotazioni);

            }

            ridisegnaSdraie();

            if (gestioneIncassiAperta) aggiornaListaIncassi();

        }, errore => {

            console.error("Errore sincronizzazione Firebase.", errore);
            avviso("Impossibile sincronizzare le prenotazioni. Controlla le regole Firebase.");

        });

    // Il primo caricamento deve arrivare dal server centrale e non dalla
    // cache del singolo telefono/browser.
    archivioFirebase.collection("prenotazioni")
        .get({ source: "server" })
        .then(snapshot => {

            Stato.prenotazioni = snapshot.docs.map(documento =>
                creaPrenotazione({ ...documento.data(), id: documento.id })
            );

            ridisegnaSdraie();

            if (gestioneIncassiAperta) aggiornaListaIncassi();

        })
        .catch(errore => {

            console.error("Lettura diretta Firebase non riuscita.", errore);
            avviso(`Impossibile leggere le prenotazioni online: ${errore?.code || "errore sconosciuto"}`);

        });

}

async function salvaArchivioFirebase(prenotazioni) {

    if (!utenteFirebaseAutenticato()) {

        avviso("Prenotazione non salvata: esegui prima l'accesso.");
        return;

    }

    const operazione = Promise.all(
        prenotazioni.map(prenotazione =>
            archivioFirebase.collection("prenotazioni")
                .doc(prenotazione.id)
                .set(JSON.parse(JSON.stringify(prenotazione)))
        )
    );

    // Il logout attende questa promessa: cosÃ¬ una prenotazione appena
    // confermata non puÃ² andare persa uscendo subito dall'app.
    ultimoSalvataggioFirebase = operazione.catch(() => undefined);

    try {

        await operazione;

    }
    catch (errore) {

        console.error("Salvataggio Firebase non riuscito.", errore);
        avviso(`Dettaglio salvataggio Firebase: ${errore?.code || errore?.message || "errore sconosciuto"}`);
        avviso("Il salvataggio online non è riuscito.");

    }

}

async function eliminaPrenotazioneFirebase(id) {

    if (!utenteFirebaseAutenticato() || !utenteFirebaseAmministratore()) return;

    try {

        await archivioFirebase.collection("prenotazioni").doc(id).delete();

    }
    catch (errore) {

        console.error("Eliminazione Firebase non riuscita.", errore);
        avviso("L'eliminazione online non è riuscita.");

    }

}
