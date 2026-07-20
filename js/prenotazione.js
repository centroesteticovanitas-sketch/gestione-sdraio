/* ============================================================
 * AMURUSU RESIDENCE
 * prenotazione.js
 * Gestione di una singola prenotazione
 * ============================================================
 */

"use strict";

/* ============================================================
 * CREAZIONE
 * ============================================================
 */

function creaPrenotazione(dati = {}) {

    const prenotazione = {

        id: dati.id ?? nuovoId(),

        cognome: dati.cognome ?? "",

        telefono: dati.telefono ?? "",

        note: dati.note ?? "",

        data: dati.data ?? oggiISO(),

        numero: dati.numero ?? 0,

        prezzo: dati.prezzo ?? 0,

        totale: dati.totale ?? 0,

        acconto: dati.acconto ?? 0,

        saldo: 0,

        sdraie: dati.sdraie ? [...dati.sdraie] : [],

        pagamenti: dati.pagamenti ? [...dati.pagamenti] : [],

        colore: dati.colore ?? prossimoColore(dati.data)

    };

    aggiornaPrenotazione(prenotazione);

    if (prenotazione.acconto > 0 && prenotazione.pagamenti.length === 0) {

        prenotazione.pagamenti.push({
            data: prenotazione.data,
            descrizione: "Acconto",
            importo: prenotazione.acconto
        });

    }

    return prenotazione;

}

/* ============================================================
 * TOTALI
 * ============================================================
 */

function calcolaTotale(prenotazione) {

    return prenotazione.numero * prenotazione.prezzo;

}

function calcolaSaldo(prenotazione) {

    return Math.max(

        prenotazione.totale -

        prenotazione.acconto,

        0

    );

}

function aggiornaPrenotazione(prenotazione) {

    prenotazione.totale = calcolaTotale(prenotazione);

    prenotazione.saldo = calcolaSaldo(prenotazione);

}

/* ============================================================
 * PAGAMENTI
 * ============================================================
 */

function aggiungiPagamento(

    prenotazione,

    importo,

    metodo = "Non specificato",

    operatore = "Non specificato"

) {

    importo = numero(importo);

    if (importo <= 0) {

        return false;

    }

    prenotazione.pagamenti.push({

        data: oggiISO(),

        descrizione: `Pagamento ${metodo} · ${operatore}`,

        metodo,

        operatore,

        importo

    });

    prenotazione.acconto += importo;

    aggiornaPrenotazione(prenotazione);

    return true;

}

function eliminaPagamento(prenotazione, indice) {

    if (

        indice < 0 ||

        indice >= prenotazione.pagamenti.length

    ) {

        return false;

    }

    prenotazione.acconto -=

        prenotazione.pagamenti[indice].importo;

    prenotazione.pagamenti.splice(indice, 1);

    aggiornaPrenotazione(prenotazione);

    return true;

}

function azzeraPagamenti(prenotazione) {

    prenotazione.acconto = 0;

    prenotazione.pagamenti.length = 0;

    aggiornaPrenotazione(prenotazione);

}

/* ============================================================
 * SDRAIE
 * ============================================================
 */

function assegnaSdraie(prenotazione, lista) {

    prenotazione.sdraie = [...lista];

    prenotazione.numero = lista.length;

    aggiornaPrenotazione(prenotazione);

}

function aggiungiSdraia(prenotazione, id) {

    if (prenotazione.sdraie.includes(id)) {

        return;

    }

    prenotazione.sdraie.push(id);

    prenotazione.numero = prenotazione.sdraie.length;

    aggiornaPrenotazione(prenotazione);

}

function rimuoviSdraia(prenotazione, id) {

    prenotazione.sdraie =

        prenotazione.sdraie.filter(

            s => s !== id

        );

    prenotazione.numero = prenotazione.sdraie.length;

    aggiornaPrenotazione(prenotazione);

}

/* ============================================================
 * STATO
 * ============================================================
 */

function prenotazioneSaldata(prenotazione) {

    return prenotazione.saldo === 0;

}

function totalePagato(prenotazione) {

    return prenotazione.pagamenti.reduce(

        (totale, pagamento) =>

            totale + pagamento.importo,

        0

    );

}
