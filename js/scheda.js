/* ============================================================
 * scheda.js
 * Gestione scheda prenotazione
 * ============================================================ */

"use strict";

/* ============================================================
 * APERTURA
 * ============================================================ */

function mostraScheda(id) {

    DOM.mappa.scheda.classList.remove("selezione-attiva");

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

    DOM.mappa.scheda.classList.remove("selezione-attiva");

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

    if (DOM.scheda.btnLinkSumup) {

        DOM.scheda.btnLinkSumup.onclick = () => {

            creaEInviaLinkSumup(prenotazione);

        };

    }

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

    let messaggio = [
        `Ciao ${prenotazione.cognome},`,
        "ecco il riepilogo della tua prenotazione:",
        `Data: ${formattaData(prenotazione.data)}`,
        `Postazioni prenotate: ${prenotazione.numero} sdraie`,
        `Totale: ${euro(prenotazione.totale)} €`,
        `Acconto: ${euro(prenotazione.acconto)} €`,
        `Saldo: ${euro(prenotazione.saldo)} €`
    ].join("\n");

    messaggio = [
        `Ciao ${prenotazione.cognome},`,
        "ecco il riepilogo della tua prenotazione:",
        `Data: ${formattaData(prenotazione.data)}`,
        `Postazioni prenotate: ${prenotazione.numero} sdraie`,
        `Totale: ${euro(prenotazione.totale)} €`,
        "",
        "🌊 REGOLAMENTO PRENOTAZIONE PISCINA - AMURUSU 🌞",
        "🕘 Orari di apertura: 9:00 - 18:30",
        "❗️Non si effettuano tariffe per mezza giornata.",
        "",
        "📌 Regole da rispettare:",
        "- Non è consentito introdurre bevande: all’interno è presente un bar attrezzato.",
        "- È possibile utilizzare il barbecue messo a disposizione per i clienti.",
        "- Vietato fare tuffi.",
        "- Doccia obbligatoria prima di entrare in piscina.",
        "- I bambini devono essere sempre sorvegliati da un adulto, non sono ammessi bambini di età inferiore a 5 anni.",
        "",
        "✅ Con il pagamento anticipato confermi di accettare il regolamento.",
        "",
        "Grazie e buona giornata! ☀️"
    ].join("\n");

    // Il WhatsApp normale è soltanto un promemoria: regolamento e pagamento
    // vengono inviati insieme dal pulsante SumUp.
    messaggio = [
        `Ciao ${prenotazione.cognome},`,
        "ecco un promemoria della tua prenotazione:",
        `Data: ${formattaData(prenotazione.data)}`,
        `Postazioni prenotate: ${prenotazione.numero} sdraie`,
        `Totale: ${euro(prenotazione.totale)} €`,
        "Grazie e buona giornata! ☀️"
    ].join("\n");

    const azioneSumup = utenteFirebaseAmministratore() ? `
        <button id="btnLinkSumup" type="button" class="btn-contatto btn-sumup">
            Prenotazione + SumUp
        </button>
    ` : "";

    return `

        <div class="scheda-contatti">
            <a class="btn-contatto btn-chiama" href="tel:${numeroTelefono}">📞 Chiama</a>
            <a class="btn-contatto btn-whatsapp" href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(messaggio)}" target="_blank" rel="noopener">Promemoria WhatsApp</a>
            ${azioneSumup}
        </div>

    `;

}

async function creaEInviaLinkSumup(prenotazione) {

    const pulsante = DOM.scheda.btnLinkSumup;
    pulsante.disabled = true;
    pulsante.textContent = "Creo il link SumUp...";

    try {

        const token = await autenticazioneFirebase.currentUser.getIdToken();
        const risposta = await fetch(
            "https://europe-west1-gestione-sdraio.cloudfunctions.net/creaLinkSumup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    prenotazioneId: prenotazione.id,
                    prenotazione
                })
            }
        );
        const testoRisposta = await risposta.text();
        let risultato = {};

        try {
            risultato = JSON.parse(testoRisposta);
        }
        catch {
            throw new Error("Il servizio SumUp ha restituito un errore inatteso.");
        }

        if (!risposta.ok) throw new Error(risultato.errore || "Errore SumUp.");

        const link = risultato.url;

        if (!link) throw new Error("Link SumUp non ricevuto.");

        const numeroWhatsApp = String(prenotazione.telefono ?? "")
            .replace(/\D/g, "")
            .replace(/^00/, "");

        if (!numeroWhatsApp) throw new Error("Numero WhatsApp non valido.");

        let messaggio = [
            `Ciao ${prenotazione.cognome},`,
            `per la prenotazione del ${formattaData(prenotazione.data)} puoi effettuare il pagamento di ${euro(prenotazione.totale)} € tramite SumUp:`,
            link,
            "Grazie!"
        ].join("\n");

        messaggio = [
            `Ciao ${prenotazione.cognome},`,
            "ecco il riepilogo della tua prenotazione:",
            `Data: ${formattaData(prenotazione.data)}`,
        `Postazioni prenotate: ${prenotazione.numero} sdraie`,
            `Totale: ${euro(prenotazione.totale)} €`,
            "",
            "🌊 REGOLAMENTO PRENOTAZIONE PISCINA - AMURUSU 🌞",
            "🕘 Orari di apertura: 9:00 - 18:30",
            "❗️Non si effettuano tariffe per mezza giornata.",
            "",
            "📌 Regole da rispettare:",
            "- Non è consentito introdurre bevande: all’interno è presente un bar attrezzato.",
            "- È possibile utilizzare il barbecue messo a disposizione per i clienti.",
            "- Vietato fare tuffi.",
            "- Doccia obbligatoria prima di entrare in piscina.",
            "- I bambini devono essere sempre sorvegliati da un adulto, non sono ammessi bambini di età inferiore a 5 anni.",
            "",
            `💳 Per confermare la prenotazione effettua il pagamento di ${euro(prenotazione.totale)} € tramite SumUp:`,
            link,
            "",
            "✅ Con il pagamento anticipato confermi di accettare il regolamento.",
            "",
            "Grazie e buona giornata! ☀️"
        ].join("\n");

        window.location.href =
            `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(messaggio)}`;

    }
    catch (errore) {

        console.error("Creazione link SumUp non riuscita.", errore);
        avviso(
            errore.message ||
            "Non è stato possibile creare il link SumUp. Controlla la configurazione SumUp."
        );

    }
    finally {

        pulsante.disabled = false;
        pulsante.textContent = "Invia link SumUp";

    }

}
