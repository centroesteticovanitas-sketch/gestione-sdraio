/* ============================================================
 * AMURUSU RESIDENCE
 * pagamenti.js
 * ============================================================
 */

"use strict";

/* ============================================================
 * APRE IL MODAL PAGAMENTO
 * ============================================================
 */

function registraPagamento(prenotazione) {

    Stato.prenotazionePagamento = prenotazione;

    DOM.pagamento.importo.value = "";

    DOM.pagamento.metodo.value = "SumUp";

    DOM.pagamento.operatore.value = "";

    apriModalPagamento();

}

/* ============================================================
 * SALVA PAGAMENTO
 * ============================================================
 */

function salvaPagamento() {

    const prenotazione = Stato.prenotazionePagamento;

    if (!prenotazione) return;

    const importo = numero(

        DOM.pagamento.importo.value

    );

    const metodo = DOM.pagamento.metodo.value;

    const operatore = DOM.pagamento.operatore.value;

    if (importo <= 0) {

        avviso("Inserisci un importo valido.");

        return;

    }

    if (!operatore) {

        avviso("Seleziona l'operatore che ha ricevuto il pagamento.");

        return;

    }

    const nuovoAcconto = prenotazione.acconto + importo;

    if (nuovoAcconto > prenotazione.totale) {

        avviso("Il pagamento supera il totale della prenotazione.");

        return;

    }

    aggiungiPagamento(prenotazione, importo, metodo, operatore);

    salvaArchivio();

    chiudiModalPagamento();

    Stato.prenotazionePagamento = null;

    if (gestioneIncassiAperta) {

        apriGestioneIncassi();

        return;

    }

    Stato.schedaAperta = null;

    mostraScheda(

        prenotazione.sdraie[0]

    );

}

function annullaRegistrazionePagamento() {

    Stato.prenotazionePagamento = null;

    chiudiModalPagamento();

    if (gestioneIncassiAperta) {

        apriGestioneIncassi();

    }

}

/* ============================================================
 * AGGIORNA TOTALI
 * ============================================================
 */

function aggiornaTotaliPrenotazione(prenotazione) {

    prenotazione.saldo = calcolaSaldo(prenotazione);

}

/* ============================================================
 * AZZERA PAGAMENTI
 * ============================================================
 */

function azzeraPagamenti(prenotazione) {

    prenotazione.acconto = 0;

    prenotazione.pagamenti.length = 0;

    aggiornaTotaliPrenotazione(prenotazione);

}

/* ============================================================
 * AGGIUNGI MOVIMENTO
 * ============================================================
 */

function aggiungiMovimento(

    prenotazione,

    descrizione,

    importo

) {

    prenotazione.pagamenti.push({

        data: oggiISO(),

        descrizione,

        importo: numero(importo)

    });

}
