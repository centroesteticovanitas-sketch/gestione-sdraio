/* ============================================================
 * AMURUSU RESIDENCE
 * modifica.js
 * Gestione modifica prenotazioni e postazioni
 * ============================================================
 */

"use strict";

/* ============================================================
 * MODIFICA PRENOTAZIONE
 * ============================================================
 */

function entraModificaPrenotazione(prenotazione) {

    Stato.modalita = Modalita.MODIFICA_PRENOTAZIONE;

    Stato.prenotazioneInModifica = prenotazione;

    Stato.sdraieSelezionate = [...prenotazione.sdraie];

    chiudiScheda();

    rimuoviEvidenziazione();

    evidenziaSdraie(Stato.sdraieSelezionate);

    aggiornaBarraStato();

}

/* ============================================================
 * MODIFICA POSTAZIONI
 * ============================================================
 */

function entraModificaPostazioni(prenotazione) {

    Stato.modalita = Modalita.MODIFICA_POSTAZIONI;

    Stato.prenotazionePostazioni = prenotazione;

    Stato.sdraieModificate = [...prenotazione.sdraie];

    chiudiScheda();

    rimuoviEvidenziazione();

    mostraComandiPostazioni();

    aggiornaBarraStato();

}

/* ============================================================
 * CLICK SU SDRAIA
 * ============================================================
 */

function clickModificaSdraia(id) {

    const prenotazione = Stato.prenotazionePostazioni;

    if (!prenotazione) return;

    const indice = Stato.sdraieModificate.indexOf(id);

    if (indice >= 0) {

        Stato.sdraieModificate.splice(indice, 1);

        liberaSdraia(id);

    }
    else {

        if (Stato.sdraieModificate.length >= prenotazione.numero) {

            avviso("Per spostare una postazione, deselezionane prima una della prenotazione.");

            return;

        }

        const occupata = trovaPrenotazioneDaSdraia(id);

        if (occupata && occupata !== prenotazione) {

            flashSdraie([id]);

            return;

        }

        Stato.sdraieModificate.push(id);

        occupaSdraia(id, prenotazione.colore);

        Stato.sdraieModificate.sort((a, b) => a - b);

    }

    if (Stato.sdraieModificate.length === prenotazione.numero) {

        confermaModificaPostazioni();

        return;

    }

    mostraComandiPostazioni();

}

/* ============================================================
 * CONFERMA MODIFICA POSTAZIONI
 * ============================================================
 */

function confermaModificaPostazioni() {

    const prenotazione = Stato.prenotazionePostazioni;

    if (!prenotazione) return;

    if (Stato.sdraieModificate.length !== prenotazione.numero) {

        avviso(`Seleziona esattamente ${prenotazione.numero} postazioni.`);

        return;

    }

    aggiornaSdraiePrenotazione(

        prenotazione,

        Stato.sdraieModificate

    );

    esciModalitaModifica();

    chiudiScheda();

}

/* ============================================================
 * ANNULLA MODIFICA POSTAZIONI
 * ============================================================
 */

function annullaModificaPostazioni() {

    const prenotazione = Stato.prenotazionePostazioni;
    const originale = Stato.prenotazionePostazioniOriginale;

    if (prenotazione && originale) {

        Object.assign(prenotazione, originale);
        aggiornaPrenotazione(prenotazione);

    }

    esciModalitaModifica();

}

/* ============================================================
 * ANNULLA MODIFICA PRENOTAZIONE
 * ============================================================
 */

function annullaModificaPrenotazione() {

    esciModalitaModifica();

}

/* ============================================================
 * USCITA GENERICA
 * ============================================================
 */

function esciModalitaModifica() {

    Stato.modalita = Modalita.NORMALE;

    Stato.prenotazioneInModifica = null;

    Stato.prenotazionePostazioni = null;

    Stato.prenotazionePostazioniOriginale = null;

    Stato.sdraieSelezionate = [];

    Stato.sdraieModificate = [];

    rimuoviEvidenziazione();

    ridisegnaSdraie();

    aggiornaBarraStato();

}

function mostraComandiPostazioni() {

    const selezionate = Stato.sdraieModificate.length;
    const richieste = Stato.prenotazionePostazioni?.numero ?? 0;

    DOM.mappa.scheda.innerHTML = `

        <div class="scheda-azioni-postazioni">
            <strong>Scegli le postazioni</strong><br>
            Selezionate: ${selezionate} di ${richieste}. Il salvataggio avviene automaticamente.
            <div class="scheda-azioni">
                <button id="btnAnnullaPostazioni" type="button">Annulla</button>
            </div>
        </div>

    `;

    document.getElementById("btnAnnullaPostazioni").onclick = annullaModificaPostazioni;

}
