/* ============================================================
 * stato.js
 * Stato globale dell'applicazione
 * ============================================================ */

"use strict";

const Modalita = Object.freeze({

    NORMALE: "normale",

    NUOVA_PRENOTAZIONE: "nuova_prenotazione",

    MODIFICA_PRENOTAZIONE: "modifica_prenotazione",

    MODIFICA_POSTAZIONI: "modifica_postazioni"

});

const Stato = {

    /* ========================================================
     * Modalità corrente
     * ====================================================== */

    modalita: Modalita.NORMALE,

    /* ========================================================
     * Prenotazioni
     * ====================================================== */

    prenotazioni: [],

    mappaSdraie: new Map(),

    prenotazioneCorrente: null,

    prenotazioneInModifica: null,

    prenotazionePagamento: null,

    prenotazionePostazioni: null,

    prenotazionePostazioniOriginale: null,

    /* ========================================================
     * Selezione sdraie
     * ====================================================== */

    sdraieSelezionate: [],

    numeroSdraieRichiesto: 0,

    salvataggioSelezioneInCorso: false,

    coloreSelezione: null,

    sdraieModificate: [],

    /* ========================================================
     * Interfaccia
     * ====================================================== */

    schedaAperta: null,

    /* ========================================================
     * Colori
     * ====================================================== */

    indiceColore: 0,

    /* ========================================================
     * Ripristino stato
     * ====================================================== */

    reset() {

        this.modalita = Modalita.NORMALE;

        this.prenotazioni = [];

        this.mappaSdraie.clear();

        this.prenotazioneCorrente = null;

        this.prenotazioneInModifica = null;

        this.prenotazionePagamento = null;

        this.prenotazionePostazioni = null;

        this.prenotazionePostazioniOriginale = null;

        this.sdraieSelezionate = [];

        this.numeroSdraieRichiesto = 0;

        this.salvataggioSelezioneInCorso = false;

        this.coloreSelezione = null;

        this.sdraieModificate = [];

        this.schedaAperta = null;

        this.indiceColore = 0;

    }

};
