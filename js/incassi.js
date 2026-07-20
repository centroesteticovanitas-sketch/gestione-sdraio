/* ============================================================
 * incassi.js
 * Gestione rapida pagamenti da smartphone
 * ============================================================
 */

"use strict";

let gestioneIncassiAperta = false;

function apriGestioneIncassi() {

    gestioneIncassiAperta = true;

    const ricerca = document.getElementById("txtCercaIncassi");
    const filtro = document.getElementById("cmbFiltroIncassi");

    ricerca.oninput = aggiornaListaIncassi;
    filtro.onchange = aggiornaListaIncassi;
    document.getElementById("btnChiudiIncassi").onclick = chiudiGestioneIncassi;

    mostra(DOM.modal.incassi);
    aggiornaListaIncassi();

}

function chiudiGestioneIncassi() {

    gestioneIncassiAperta = false;
    nascondi(DOM.modal.incassi);

}

function aggiornaListaIncassi() {

    const testo = document.getElementById("txtCercaIncassi").value.trim().toLowerCase();
    const filtro = document.getElementById("cmbFiltroIncassi").value;

    const prenotazioni = Stato.prenotazioni.filter(prenotazione => {

        const corrisponde = !testo || [
            prenotazione.cognome,
            prenotazione.telefono,
            prenotazione.sdraie.join(" ")
        ].join(" ").toLowerCase().includes(testo);

        if (!corrisponde) return false;

        if (filtro === "da_saldare") return prenotazione.saldo > 0;

        if (filtro === "saldate") return prenotazione.saldo === 0;

        return true;

    }).sort((a, b) => a.data.localeCompare(b.data) || a.cognome.localeCompare(b.cognome));

    const lista = document.getElementById("listaIncassi");

    if (!prenotazioni.length) {

        lista.innerHTML = "<p class=\"lista-vuota\">Nessuna prenotazione trovata.</p>";

        return;

    }

    lista.innerHTML = prenotazioni.map(prenotazione => `

        <article class="scheda-incasso">
            <div>
                <strong>${prenotazione.cognome}</strong>
                <span>${formattaData(prenotazione.data)} · Sdraie ${prenotazione.sdraie.join(", ")}</span>
            </div>
            <div class="importi-incasso">
                <span>Saldo</span>
                <strong>${euro(prenotazione.saldo)} €</strong>
            </div>
            <button type="button" class="${prenotazione.saldo === 0 ? "incasso-saldato" : "incasso-da-saldare"}" data-pagamento-id="${prenotazione.id}" ${prenotazione.saldo === 0 ? "disabled" : ""}>
                ${prenotazione.saldo === 0 ? "Saldato" : "Registra"}
            </button>
        </article>

    `).join("");

    lista.querySelectorAll("[data-pagamento-id]").forEach(pulsante => {

        pulsante.onclick = () => {

            const prenotazione = trovaPrenotazione(pulsante.dataset.pagamentoId);

            if (!prenotazione) return;

            nascondi(DOM.modal.incassi);
            registraPagamento(prenotazione);

        };

    });

}
