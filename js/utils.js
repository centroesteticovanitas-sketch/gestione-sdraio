/* ============================================================
 * utils.js
 * Funzioni di utilità
 * ============================================================ */

"use strict";

/* ============================================================
 * FORMATTAZIONE
 * ============================================================ */

function euro(valore) {

    return Number(valore || 0).toLocaleString(
        "it-IT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}

function numero(valore) {

    return Number(valore || 0);

}

function intero(valore) {

    return parseInt(valore, 10) || 0;

}

/* ============================================================
 * DATE
 * ============================================================ */

function oggiISO() {

    const oggi = new Date();

    return [
        oggi.getFullYear(),
        String(oggi.getMonth() + 1).padStart(2, "0"),
        String(oggi.getDate()).padStart(2, "0")
    ].join("-");

}

function formattaData(data) {

    if (!data) return "";

    const [anno, mese, giorno] = data.split("-");

    return `${giorno}/${mese}/${anno}`;

}

/* ============================================================
 * ARRAY
 * ============================================================ */

function copiaArray(array) {

    return [...array];

}

function ordinaNumeri(array) {

    return array.sort((a, b) => a - b);

}

/* ============================================================
 * COLORI
 * ============================================================ */

const COLORI = [

    "#E53935",
    "#1E88E5",
    "#8E24AA",
    "#F4511E",
    "#3949AB",
    "#D81B60",
    "#EF6C00",
    "#5E35B1",
    "#00838F",
    "#C2185B",
    "#1565C0",
    "#AD1457"

];

function prossimoColore(data) {

    const coloriUsati = typeof prenotazioniDelGiorno === "function"
        ? new Set(prenotazioniDelGiorno(data).map(p => p.colore))
        : new Set();

    const colore = COLORI.find(c => !coloriUsati.has(c)) ??
        COLORI[Stato.indiceColore];

    Stato.indiceColore++;

    if (Stato.indiceColore >= COLORI.length) {

        Stato.indiceColore = 0;

    }

    return colore;

}

/* ============================================================
 * ID
 * ============================================================ */

function nuovoId() {

    return Date.now().toString(36) +

        Math.random().toString(36).substring(2, 7);

}

/* ============================================================
 * DOM
 * ============================================================ */

function mostra(elemento) {

    elemento.classList.remove("hidden");

}

function nascondi(elemento) {

    elemento.classList.add("hidden");

}

function abilita(elemento) {

    elemento.disabled = false;

}

function disabilita(elemento) {

    elemento.disabled = true;

}

/* ============================================================
 * MODAL
 * ============================================================ */

function apriModalPrenotazione() {

    mostra(DOM.modal.prenotazione);

}

function chiudiModalPrenotazione() {

    nascondi(DOM.modal.prenotazione);

}

function apriModalPagamento() {

    mostra(DOM.modal.pagamento);

}

function chiudiModalPagamento() {

    nascondi(DOM.modal.pagamento);

}

/* ============================================================
 * MESSAGGI
 * ============================================================ */

function conferma(messaggio) {

    return window.confirm(messaggio);

}

function avviso(messaggio) {

    window.alert(messaggio);

}

function prezzoAutomaticoPerData(data) {

    if (!data) return 10;

    const [anno, mese, giorno] = data.split("-").map(Number);

    return new Date(anno, mese - 1, giorno).getDay() === 0 ? 12 : 10;

}
