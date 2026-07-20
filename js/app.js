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

    inizializzaAccessoFirebase();

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

    DOM.header.btnStatistiche.addEventListener(

        "click",

        mostraStatistiche

    );

    DOM.header.btnTariffe.addEventListener(

        "click",

        apriGestioneTariffe

    );

    DOM.header.btnIncassi.addEventListener(

        "click",

        apriGestioneIncassi

    );

    DOM.header.btnPrenotaMobile.addEventListener("click", () => {

        DOM.header.btnPrenota.click();

    });

    DOM.header.btnIncassiMobile.addEventListener("click", () => {

        DOM.header.btnIncassi.click();

    });

    DOM.header.btnMenuMobile.addEventListener("click", () => {

        const aperto = DOM.header.menuMobile.classList.toggle("hidden");

        DOM.header.btnMenuMobile.setAttribute("aria-expanded", String(!aperto));

    });

    DOM.header.btnStatisticheMobile.addEventListener("click", () => {

        nascondi(DOM.header.menuMobile);
        mostraStatistiche();

    });

    DOM.header.btnTariffeMobile.addEventListener("click", () => {

        nascondi(DOM.header.menuMobile);
        apriGestioneTariffe();

    });

    DOM.header.btnEsciMobile.addEventListener("click", () => {

        nascondi(DOM.header.menuMobile);

    });

    DOM.header.btnDataPrecedente.addEventListener(

        "click",

        () => cambiaDataRapidamente(-1)

    );

    DOM.header.btnOggi.addEventListener(

        "click",

        () => {

            DOM.header.data.value = oggiISO();
            cambiaDataVisualizzata();

        }

    );

    DOM.header.btnDataSuccessiva.addEventListener(

        "click",

        () => cambiaDataRapidamente(1)

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

        annullaRegistrazionePagamento

    );

    DOM.modal.pulsanti.annullaPagamento.addEventListener(

        "click",

        annullaRegistrazionePagamento

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

    DOM.form.telefono.addEventListener("keydown", evento => {

        if (evento.key === "Enter") {

            evento.preventDefault();
            DOM.form.telefono.blur();

        }

    });

    DOM.form.btnConfermaTelefono.addEventListener("click", () => {

        DOM.form.telefono.blur();

    });

    const cambiaNumeroSdraie = variazione => {

        const minimo = Number(DOM.form.numero.min) || 1;
        const massimo = Number(DOM.form.numero.max) || 25;
        const attuale = intero(DOM.form.numero.value) || minimo;

        DOM.form.numero.value = Math.min(massimo, Math.max(minimo, attuale + variazione));
        aggiornaTotale();

    };

    DOM.form.btnNumeroMeno.addEventListener("click", () => cambiaNumeroSdraie(-1));
    DOM.form.btnNumeroPiu.addEventListener("click", () => cambiaNumeroSdraie(1));

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

    DOM.modal.pulsanti.chiudiTariffe.addEventListener("click", chiudiGestioneTariffe);

    DOM.modal.pulsanti.annullaTariffe.addEventListener("click", chiudiGestioneTariffe);

    DOM.modal.pulsanti.salvaTariffe.addEventListener("click", salvaGestioneTariffe);

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

    DOM.mappa.zoomMeno.addEventListener("click", () => cambiaZoomMappa(-0.25));

    DOM.mappa.zoomReset.addEventListener("click", reimpostaZoomMappa);

    DOM.mappa.zoomPiu.addEventListener("click", () => cambiaZoomMappa(0.25));

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

function cambiaDataRapidamente(giorni) {

    const data = new Date(`${DOM.header.data.value || oggiISO()}T00:00:00`);

    data.setDate(data.getDate() + giorni);

    DOM.header.data.value = [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");

    cambiaDataVisualizzata();

}

function nuovaPrenotazione() {

    if (!richiediAccessoFirebase()) return;

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

        annullaRegistrazionePagamento();

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

        annullaRegistrazionePagamento();

        return;

    }

    if (!DOM.modal.prenotazione.classList.contains("hidden")) {

        annullaPrenotazione();

    }

}
