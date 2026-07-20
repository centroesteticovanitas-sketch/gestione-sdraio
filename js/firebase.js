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

function ruoloFirebaseCorrente() {

    const email = autenticazioneFirebase.currentUser?.email?.toLowerCase();

    return email === EMAIL_AMMINISTRATORE ? "amministratore" : "collaboratore";

}

function utenteFirebaseAmministratore() {

    return ruoloFirebaseCorrente() === "amministratore";

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

    DOM.header.btnEsci.onclick = () => autenticazioneFirebase.signOut();

    autenticazioneFirebase.onAuthStateChanged(utente => {

        if (!utente) {

            sincronizzazioneFirebaseAttiva = false;

            if (interrompiAscoltoPrenotazioni) {

                interrompiAscoltoPrenotazioni();
                interrompiAscoltoPrenotazioni = null;

            }

            document.body.classList.remove("collaboratore");

            mostra(DOM.modal.accesso);

            return;

        }

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

            ridisegnaSdraie();

            if (gestioneIncassiAperta) aggiornaListaIncassi();

        }, errore => {

            console.error("Errore sincronizzazione Firebase.", errore);
            avviso("Impossibile sincronizzare le prenotazioni. Controlla le regole Firebase.");

        });

}

async function salvaArchivioFirebase(prenotazioni) {

    if (!sincronizzazioneFirebaseAttiva) return;

    try {

        const esistenti = await archivioFirebase.collection("prenotazioni").get();
        const identificativi = new Set(prenotazioni.map(prenotazione => prenotazione.id));
        const batch = archivioFirebase.batch();

        prenotazioni.forEach(prenotazione => {

            batch.set(
                archivioFirebase.collection("prenotazioni").doc(prenotazione.id),
                JSON.parse(JSON.stringify(prenotazione))
            );

        });

        if (utenteFirebaseAmministratore()) {

            esistenti.docs.forEach(documento => {

                if (!identificativi.has(documento.id)) batch.delete(documento.ref);

            });

        }

        await batch.commit();

    }
    catch (errore) {

        console.error("Salvataggio Firebase non riuscito.", errore);
        avviso("Il salvataggio online non è riuscito.");

    }

}
