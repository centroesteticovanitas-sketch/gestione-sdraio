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

    const mostraAccessoSubito = () => {

        document.body.classList.remove("collaboratore");
        document.body.classList.add("non-autenticato");
        nascondi(DOM.header.menuMobile);
        mostra(DOM.modal.accesso);

    };

    const esciDaFirebase = evento => {

        evento?.preventDefault();
        mostraAccessoSubito();

        autenticazioneFirebase.signOut().catch(erroreUscita => {

            console.error("Impossibile effettuare il logout:", erroreUscita);

        });

    };

    DOM.header.btnEsci.onclick = esciDaFirebase;
    DOM.header.btnEsciMobile.onclick = esciDaFirebase;

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

}

async function salvaArchivioFirebase(prenotazioni) {

    if (!utenteFirebaseAutenticato()) return;

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
