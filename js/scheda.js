/* ============================================================
 * scheda.js
 * Gestione scheda prenotazione
 * ============================================================ */

"use strict";

/* ============================================================
 * APERTURA
 * ============================================================ */

function mostraScheda(id) {

    if (Stato.schedaAperta === id) {

        chiudiScheda();
        return;

    }

    Stato.schedaAperta = id;

    const sdraia = trovaSdraia(id);

    if (!sdraia) {

        chiudiScheda();

        return;

    }

    if (sdraia.stato === "libera") {

        DOM.mappa.scheda.innerHTML = `

            <strong>🏖 Sdraia ${id}</strong><br>

            🟢 Libera

        `;

        return;

    }

    const prenotazione = trovaPrenotazioneDaSdraia(id);

    if (!prenotazione) {

        chiudiScheda();

        return;

    }

    flashSdraie(prenotazione.sdraie);

    DOM.mappa.scheda.innerHTML = creaHtmlScheda(prenotazione, id);

    collegaEventiScheda(prenotazione);

}

/* ============================================================
 * CHIUSURA
 * ============================================================ */

function chiudiScheda() {

    Stato.schedaAperta = null;

    rimuoviEvidenziazione();

    DOM.mappa.scheda.innerHTML = "Tocca una sdraia...";

}

/* ============================================================
 * HTML
 * ============================================================ */

function creaHtmlScheda(p, id) {

    return `

<div class="scheda-cliente">

    <div class="scheda-titolo">

        🏖 <strong>Sdraia ${id}</strong>

        <button id="btnChiudiScheda" type="button" class="btn-chiudi-scheda" aria-label="Chiudi scheda">&times;</button>

    </div>

    <div class="scheda-dati">

        <div><strong>Cliente</strong></div>
        <div>${p.cognome}</div>

        <div><strong>Telefono</strong></div>
        <div>${p.telefono || "-"}</div>

        ${p.note ? `<div><strong>Note</strong></div><div>${p.note}</div>` : ""}

        <div><strong>Postazioni</strong></div>
        <div>${p.numero}</div>

        <div><strong>Totale</strong></div>
        <div>${euro(p.totale)} €</div>

        <div><strong>Acconto</strong></div>
        <div>${euro(p.acconto)} €</div>

        <div><strong>Saldo</strong></div>
        <div>${euro(p.saldo)} €</div>

    </div>

    ${creaHtmlContatti(p)}

    <div class="scheda-sdraie">

        <strong>Sdraie</strong><br>

        ${p.sdraie.join(" • ")}

    </div>

    <div class="scheda-pagamenti">

        <strong>Pagamenti</strong>

        ${creaHtmlPagamenti(p)}

    </div>

    <div class="scheda-azioni">

        <button id="btnPagamento">

            💶 Pagamento

        </button>

        <button id="btnModifica">

            ✏️ Modifica

        </button>

        <button id="btnPostazioni">

            🏖 Postazioni

        </button>

        <button id="btnElimina">

            🗑 Elimina

        </button>

    </div>

</div>

`;

}

/* ============================================================
 * STORICO PAGAMENTI
 * ============================================================ */

function creaHtmlPagamenti(p) {

    if (!p.pagamenti.length) {

        return "<br><em>Nessun pagamento.</em>";

    }

    return p.pagamenti.map(pg => `

<div class="riga-pagamento">

    <span>${formattaData(pg.data)}</span>

    <span>${pg.descrizione}</span>

    <span>${euro(pg.importo)} €</span>

</div>

`).join("");

}

/* ============================================================
 * EVENTI
 * ============================================================ */

function collegaEventiScheda(prenotazione) {

    aggiornaDOMScheda();

    DOM.scheda.btnChiudi.onclick = chiudiScheda;

    DOM.scheda.btnPagamento.onclick = () => {

        registraPagamento(prenotazione);

    };

    DOM.scheda.btnModifica.onclick = () => {

        Stato.prenotazioneInModifica = prenotazione;

        resetModal();

        caricaPrenotazioneNelModal(prenotazione);

        apriModalPrenotazione();

    };

    DOM.scheda.btnPostazioni.onclick = () => {

        entraModificaPostazioni(prenotazione);

    };

    DOM.scheda.btnElimina.onclick = () => {

        if (!conferma("Eliminare la prenotazione?")) {

            return;

        }

        eliminaPrenotazione(prenotazione);

        chiudiScheda();

        ridisegnaSdraie();

    };

}

function creaHtmlContatti(prenotazione) {

    const numero = String(prenotazione.telefono ?? "").trim();

    if (!numero) return "";

    const numeroTelefono = numero.replace(/[^\d+]/g, "");
    let numeroWhatsApp = numero.replace(/\D/g, "");

    if (!numeroTelefono || !numeroWhatsApp) return "";

    if (numeroWhatsApp.startsWith("00")) {
        numeroWhatsApp = numeroWhatsApp.substring(2);
    }
    else if (numeroWhatsApp.length <= 10) {
        numeroWhatsApp = "39" + numeroWhatsApp;
    }

    const messaggio = [
        `Ciao ${prenotazione.cognome},`,
        "ecco il riepilogo della tua prenotazione:",
        `Data: ${formattaData(prenotazione.data)}`,
        `Numero postazioni: ${prenotazione.numero}`,
        `Totale: ${euro(prenotazione.totale)} €`,
        `Acconto: ${euro(prenotazione.acconto)} €`,
        `Saldo: ${euro(prenotazione.saldo)} €`
    ].join("\n");

    return `

        <div class="scheda-contatti">
            <a class="btn-contatto btn-chiama" href="tel:${numeroTelefono}">📞 Chiama</a>
            <a class="btn-contatto btn-whatsapp" href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(messaggio)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>

    `;

}
