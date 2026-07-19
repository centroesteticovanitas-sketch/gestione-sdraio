/* ============================================================
 * AMURUSU RESIDENCE
 * sdraie.js
 * ============================================================
 */

"use strict";

/* ============================================================
 * COSTANTI
 * ============================================================
 */

const VIEWBOX_WIDTH = 480;
const VIEWBOX_HEIGHT = 750;

/* ============================================================
 * CREAZIONE SINGOLA SDRAIA
 * ============================================================
 */

function creaSdraia(id, x, y, rotazione) {

    const elemento = document.createElement("div");

    elemento.className = "sdraia libera";

    if (rotazione === "H") {

        elemento.classList.add("orizzontale");

    }

    elemento.dataset.id = id;

    elemento.textContent = id;

    elemento.style.left = `${x / VIEWBOX_WIDTH * 100}%`;

    elemento.style.top = `${y / VIEWBOX_HEIGHT * 100}%`;

    elemento.addEventListener("click", () => clickSdraia(id));

    DOM.mappa.layer.appendChild(elemento);

    Stato.mappaSdraie.set(id, {

        id,

        stato: "libera",

        colore: "#ffffff",

        elemento

    });

}

/* ============================================================
 * CREAZIONE MAPPA
 * ============================================================
 */

function creaSdraie() {

    DOM.mappa.layer.innerHTML = "";

    Stato.mappaSdraie.clear();

    layout.forEach(posizione => {

        creaSdraia(

            posizione.id,

            posizione.x,

            posizione.y,

            posizione.rot

        );

    });

    aggiornaBarraStato();

}

/* ============================================================
 * CLICK
 * ============================================================
 */

function clickSdraia(id) {

    switch (Stato.modalita) {

        case Modalita.NUOVA_PRENOTAZIONE:

        case Modalita.MODIFICA_PRENOTAZIONE:

            selezionaSdraia(id);

            break;

        case Modalita.MODIFICA_POSTAZIONI:

            clickModificaSdraia(id);

            break;

        default:

            mostraScheda(id);

    }

}

/* ============================================================
 * CERCA SDRAIA
 * ============================================================
 */

function trovaSdraia(id) {

    return Stato.mappaSdraie.get(id);

}

/* ============================================================
 * OCCUPA
 * ============================================================
 */

function occupaSdraia(id, colore) {

    const s = trovaSdraia(id);

    if (!s) return;

    s.stato = "occupata";

    s.colore = colore;

    s.elemento.classList.remove("highlight");

    s.elemento.style.backgroundColor = colore;

    s.elemento.style.color = "#ffffff";

}

/* ============================================================
 * LIBERA
 * ============================================================
 */

function liberaSdraia(id) {

    const s = trovaSdraia(id);

    if (!s) return;

    s.stato = "libera";

    s.prenotazione = null;

    s.colore = "#ffffff";

    s.elemento.classList.remove("highlight");

    s.elemento.style.backgroundColor = "#ffffff";

    s.elemento.style.color = "#000000";

}

/* ============================================================
 * EVIDENZIA
 * ============================================================
 */

function evidenziaSdraie(lista) {

    lista.forEach(id => {

        const s = trovaSdraia(id);

        if (s) {

            s.elemento.classList.add("highlight");

        }

    });

}

/* ============================================================
 * RIMUOVE EVIDENZIAZIONE
 * ============================================================
 */

function rimuoviEvidenziazione(lista = null) {

    if (lista) {

        lista.forEach(id => {

            const s = trovaSdraia(id);

            if (s) {

                s.elemento.classList.remove("highlight");

            }

        });

        return;

    }

    Stato.mappaSdraie.forEach(s => {

        s.elemento.classList.remove("highlight");

    });

}

/* ============================================================
 * FLASH
 * ============================================================
 */

function flashSdraie(lista, durata = 2000) {

    evidenziaSdraie(lista);

    setTimeout(() => {

        rimuoviEvidenziazione(lista);

    }, durata);

}

/* ============================================================
 * BARRA STATO
 * ============================================================
 */

function aggiornaBarraStato() {

    let libere = 0;

    Stato.mappaSdraie.forEach(s => {

        if (s.stato === "libera") {

            libere++;

        }

    });

    const occupate = Stato.mappaSdraie.size - libere;

    DOM.header.lblLibere.textContent =
        `🟢 Libere: ${libere}`;

    DOM.header.lblOccupate.textContent =
        `🔴 Occupate: ${occupate}`;

}

/* ============================================================
 * RIDISEGNA
 * ============================================================
 */

function ridisegnaSdraie() {

    Stato.mappaSdraie.forEach(s => {

        liberaSdraia(s.id);

    });

    prenotazioniDelGiorno().forEach(prenotazione => {

        prenotazione.sdraie.forEach(id => {

            occupaSdraia(

                id,

                prenotazione.colore

            );

            const sdraia = trovaSdraia(id);

            if (sdraia) {

                sdraia.prenotazione = prenotazione;

            }

        });

    });

    aggiornaBarraStato();

}
