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
const URL_ARCHIVIO_PRENOTAZIONI =
    "https://archivioprenotazioni-55fdafzm6a-ew.a.run.app";

let sincronizzazioneFirebaseAttiva = false;
let interrompiAscoltoPrenotazioni = null;
let primoCaricamentoFirebase = true;
let ultimoSalvataggioFirebase = Promise.resolve();
let dataAllineataAlPrimoCaricamento = false;

function allineaDataAllaProssimaPrenotazione() {

    if (dataAllineataAlPrimoCaricamento || !Stato.prenotazioni.length) return;

    const oggi = oggiISO();
    const future = Stato.prenotazioni
        .filter(prenotazione => prenotazione.data >= oggi)
        .sort((a, b) => a.data.localeCompare(b.data));
    const daMostrare = future[0] || Stato.prenotazioni
        .slice()
        .sort((a, b) => b.data.localeCompare(a.data))[0];

    if (daMostrare?.data && !prenotazioniDelGiorno().length) {

        DOM.header.data.value = daMostrare.data;

    }

    dataAllineataAlPrimoCaricamento = true;

}

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

async function richiestaArchivio(operazione, dati = null) {

    const mostraStato = testo => {

        if (Stato.modalita === Modalita.NUOVA_PRENOTAZIONE) {

            DOM.mappa.scheda.textContent = testo;

        }

    };

    mostraStato("Verifica accesso Firebase...");

    const token = await Promise.race([
        autenticazioneFirebase.currentUser?.getIdToken(),
        new Promise((_, rifiuta) => setTimeout(() => rifiuta(new Error("Timeout accesso Firebase.")), 12000))
    ]);

    if (!token) throw new Error("Accesso non valido.");

    mostraStato("Invio prenotazione al server centrale...");

    const corpo = new URLSearchParams({
        token,
        dati: JSON.stringify({ operazione, ...(dati || {}) })
    });

    const risposta = await Promise.race([
        fetch(URL_ARCHIVIO_PRENOTAZIONI, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: corpo
        }),
        new Promise((_, rifiuta) => setTimeout(() => rifiuta(new Error("Timeout server centrale.")), 20000))
    ]);

    const risultato = await risposta.json().catch(() => ({}));

    if (!risposta.ok) throw new Error(risultato.errore || "Errore archivio centrale.");

    mostraStato("Prenotazione salvata sul server centrale.");

    return risultato;

}

async function caricaArchivioCentrale() {

    try {

        const risultato = await richiestaArchivio("leggi");
        Stato.prenotazioni = (risultato.prenotazioni || []).map(dati => creaPrenotazione(dati));
        allineaDataAllaProssimaPrenotazione();
        ridisegnaSdraie();

        if (gestioneIncassiAperta) aggiornaListaIncassi();

    }
    catch (errore) {

        console.error("Lettura archivio centrale non riuscita.", errore);
        avviso(`Impossibile leggere l'archivio centrale: ${errore.message}`);

    }

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
    dataAllineataAlPrimoCaricamento = false;
    // La fonte unica Ã¨ Firestore: non manteniamo dati di browser precedenti.
    Stato.prenotazioni = [];

    // Firestore e' il database centrale dell'app. Usiamo direttamente il suo
    // ascolto in tempo reale, cosi' tutti i telefoni ricevono subito gli
    // stessi dati senza dover passare da un servizio intermedio.

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

            allineaDataAllaProssimaPrenotazione();

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

            allineaDataAllaProssimaPrenotazione();

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

    const operazione = (async () => {

        const archivioOnline = await archivioFirebase
            .collection("prenotazioni")
            .get({ source: "server" });
        const batch = archivioFirebase.batch();
        const idDaConservare = new Set(prenotazioni.map(prenotazione => prenotazione.id));

        prenotazioni.forEach(prenotazione => {

            const { id, ...dati } = prenotazione;

            batch.set(
                archivioFirebase.collection("prenotazioni").doc(id),
                dati
            );

        });

        // Solo l'amministratore puo' rimuovere documenti: i collaboratori
        // aggiornano esclusivamente i dati di pagamento gia' esistenti.
        if (utenteFirebaseAmministratore()) {

            archivioOnline.docs.forEach(documento => {

                if (!idDaConservare.has(documento.id)) batch.delete(documento.ref);

            });

        }

        await batch.commit();

    })();

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

        await richiestaArchivio("elimina", { id });

    }
    catch (errore) {

        console.error("Eliminazione Firebase non riuscita.", errore);
        avviso("L'eliminazione online non è riuscita.");

    }

}
