/* ============================================================
 * app.js
 * Controller applicazione
 * ============================================================
 */

"use strict";

/* ============================================================
 * AVVIO
 * ============================================================
 */

window.addEventListener(

    "DOMContentLoaded",

    inizializzaApplicazione

);

/* ============================================================
 * INIZIALIZZAZIONE
 * ============================================================
 */

function inizializzaApplicazione() {

    DOM.form.data.value = oggiISO();

    DOM.header.data.value = oggiISO();

    creaSdraie();

    caricaPrenotazioni();

    collegaEventi();

    aggiornaBarraStato();

    chiudiScheda();

}

/* ============================================================
 * COLLEGA EVENTI
 * ============================================================
 */

function collegaEventi() {

    /* ---------------- HEADER ---------------- */

    DOM.header.btnPrenota.addEventListener(

        "click",

        nuovaPrenotazione

    );

    DOM.header.data.addEventListener(

        "change",

        cambiaDataVisualizzata

    );

    /* ---------------- MODAL PRENOTAZIONE ---------------- */

    DOM.modal.pulsanti.chiudiPrenotazione.addEventListener(

        "click",

        annullaPrenotazione

    );

    DOM.modal.pulsanti.annullaPrenotazione.addEventListener(

        "click",

        annullaPrenotazione

    );

    DOM.modal.pulsanti.salvaPrenotazione.addEventListener(

        "click",

        gestisciPulsantePrenotazione

    );

    /* ---------------- MODAL PAGAMENTO ---------------- */

    DOM.modal.pulsanti.chiudiPagamento.addEventListener(

        "click",

        chiudiModalPagamento

    );

    DOM.modal.pulsanti.annullaPagamento.addEventListener(

        "click",

        chiudiModalPagamento

    );

    DOM.modal.pulsanti.salvaPagamento.addEventListener(

        "click",

        salvaPagamento

    );

    /* ---------------- FORM ---------------- */

    DOM.form.numero.addEventListener(

        "input",

        aggiornaTotale

    );

    DOM.form.prezzo.addEventListener(

        "input",

        aggiornaTotale

    );

    DOM.form.data.addEventListener(

        "change",

        aggiornaTariffaAutomatica

    );

    DOM.form.acconto.addEventListener(

        "input",

        aggiornaSaldo

    );

    DOM.form.chkTariffaAuto.addEventListener(

        "change",

        aggiornaTariffaAutomatica

    );

    DOM.header.chkTariffaAuto.addEventListener("change", () => {

        DOM.form.chkTariffaAuto.checked = DOM.header.chkTariffaAuto.checked;
        aggiornaTariffaAutomatica();

    });

    /* ---------------- MODAL BACKDROP ---------------- */

    DOM.modal.prenotazione.addEventListener(

        "click",

        chiudiPrenotazioneBackdrop

    );

    DOM.modal.pagamento.addEventListener(

        "click",

        chiudiPagamentoBackdrop

    );

    /* ---------------- MAPPA ---------------- */

    DOM.mappa.contenitore.addEventListener(

        "click",

        clickMappa

    );

    /* ---------------- TASTIERA ---------------- */

    document.addEventListener(

        "keydown",

        gestisciTastiera

    );

}

/* ============================================================
 * NUOVA PRENOTAZIONE
 * ============================================================
 */

function nuovaPrenotazione() {

    if (Stato.modalita === Modalita.NUOVA_PRENOTAZIONE) {

        annullaPrenotazione();

        return;

    }

    resetModal();

    DOM.modal.pulsanti.salvaPrenotazione.textContent = "Scegli sdraie";

    apriModalPrenotazione();

}

function gestisciPulsantePrenotazione() {

    if (Stato.prenotazioneInModifica) {

        salvaPrenotazione();

        return;

    }

    iniziaSceltaSdraie();

}

/* ============================================================
 * CLICK MAPPA
 * ============================================================
 */

function clickMappa(e) {

    if (e.target.classList.contains("sdraia")) {

        return;

    }

    if (Stato.modalita === Modalita.NUOVA_PRENOTAZIONE) {

        return;

    }

    chiudiScheda();

}

/* ============================================================
 * BACKDROP PRENOTAZIONE
 * ============================================================
 */

function chiudiPrenotazioneBackdrop(e) {

    if (e.target === DOM.modal.prenotazione) {

        annullaPrenotazione();

    }

}

/* ============================================================
 * BACKDROP PAGAMENTO
 * ============================================================
 */

function chiudiPagamentoBackdrop(e) {

    if (e.target === DOM.modal.pagamento) {

        chiudiModalPagamento();

    }

}

/* ============================================================
 * TASTIERA
 * ============================================================
 */

function gestisciTastiera(e) {

    if (e.key !== "Escape") {

        return;

    }

    if (!DOM.modal.pagamento.classList.contains("hidden")) {

        chiudiModalPagamento();

        return;

    }

    if (!DOM.modal.prenotazione.classList.contains("hidden")) {

        annullaPrenotazione();

    }

}
