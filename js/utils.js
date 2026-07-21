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

    "#FFB74D",
    "#81D4FA",
    "#A5D6A7",
    "#B0BEC5",
    "#EF5350",
    "#5C6BC0",
    "#AB47BC",
    "#EC407A",
    "#26A69A",
    "#FF7043",
    "#42A5F5",
    "#FDD835"

];

function prossimoColore(data) {

    const coloriUsati = typeof prenotazioniDelGiorno === "function"
        ? new Set(
            prenotazioniDelGiorno(data)
                .map(p => String(p.colore || "").trim().toUpperCase())
                .filter(Boolean)
        )
        : new Set();

    const colore = COLORI.find(c => !coloriUsati.has(c.toUpperCase())) ??
        COLORI[Stato.indiceColore % COLORI.length];

    Stato.indiceColore++;

    if (Stato.indiceColore >= COLORI.length) {

        Stato.indiceColore = 0;

    }

    return colore;

}

// Corregge eventuali colori ripetuti nelle prenotazioni dello stesso giorno.
// Restituisce true solo se ha apportato una modifica.
function normalizzaColoriPrenotazioni(prenotazioni) {

    const coloriPerData = new Map();
    let modificato = false;

    for (const prenotazione of prenotazioni) {

        const data = prenotazione.data || "";
        const usati = coloriPerData.get(data) || new Set();
        const colore = String(prenotazione.colore || "").trim().toUpperCase();

        if (!colore || usati.has(colore)) {

            const nuovoColore = COLORI.find(c => !usati.has(c.toUpperCase()));

            if (nuovoColore) {

                prenotazione.colore = nuovoColore;
                usati.add(nuovoColore.toUpperCase());
                modificato = true;
                coloriPerData.set(data, usati);
                continue;

            }

        }

        usati.add(colore);
        coloriPerData.set(data, usati);

    }

    return modificato;

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

const CHIAVE_TARIFFE = "amurusu-tariffe-v1";

let tariffeInModifica = null;

function leggiTariffe() {

    try {

        const salvate = JSON.parse(localStorage.getItem(CHIAVE_TARIFFE) || "null");

        return {
            prezzoStandard: numero(salvate?.prezzoStandard) || 10,
            prezzoSabato: salvate?.prezzoSabato ?? (numero(salvate?.prezzoStandard) || 10),
            prezzoDomenica: salvate?.prezzoDomenica ?? (numero(salvate?.prezzoStandard) || 10),
            dateSpeciali: salvate?.dateSpeciali ?? {}
        };

    }
    catch (errore) {

        console.warn("Tariffe non leggibili.", errore);

        return {
            prezzoStandard: 10,
            prezzoSabato: 10,
            prezzoDomenica: 10,
            dateSpeciali: {}
        };

    }

}

function prezzoAutomaticoPerData(data) {

    const tariffe = leggiTariffe();

    if (tariffe.dateSpeciali[data] !== undefined) {

        return numero(tariffe.dateSpeciali[data]);

    }

    const giorno = new Date(`${data}T00:00:00`).getDay();

    if (giorno === 6) return numero(tariffe.prezzoSabato);

    if (giorno === 0) return numero(tariffe.prezzoDomenica);

    return tariffe.prezzoStandard;

}

function apriGestioneTariffe() {

    tariffeInModifica = leggiTariffe();

    document.getElementById("txtTariffaStandard").value = tariffeInModifica.prezzoStandard;
    document.getElementById("txtTariffaSabato").value = tariffeInModifica.prezzoSabato;
    document.getElementById("txtTariffaDomenica").value = tariffeInModifica.prezzoDomenica;
    document.getElementById("txtDataSpeciale").value = "";
    document.getElementById("txtPrezzoSpeciale").value = "";

    document.getElementById("btnAggiungiTariffaSpeciale").onclick = aggiungiDataSpeciale;

    mostraListaDateSpeciali();
    mostra(DOM.modal.tariffe);

}

function chiudiGestioneTariffe() {

    tariffeInModifica = null;
    nascondi(DOM.modal.tariffe);

}

function aggiungiDataSpeciale() {

    const data = document.getElementById("txtDataSpeciale").value;
    const prezzo = numero(document.getElementById("txtPrezzoSpeciale").value);

    if (!data || prezzo <= 0) {

        avviso("Inserisci una data e un prezzo validi.");

        return;

    }

    tariffeInModifica.dateSpeciali[data] = prezzo;

    document.getElementById("txtDataSpeciale").value = "";
    document.getElementById("txtPrezzoSpeciale").value = "";

    mostraListaDateSpeciali();

}

function mostraListaDateSpeciali() {

    const contenitore = document.getElementById("listaDateSpeciali");
    const date = Object.keys(tariffeInModifica.dateSpeciali).sort();

    if (!date.length) {

        contenitore.innerHTML = "<em>Nessuna data speciale configurata.</em>";

        return;

    }

    contenitore.innerHTML = date.map(data => `

        <div class="riga-tariffa-speciale">
            <span>${formattaData(data)}</span>
            <strong>${euro(tariffeInModifica.dateSpeciali[data])} €</strong>
            <button type="button" data-rimuovi-tariffa="${data}" aria-label="Rimuovi tariffa speciale">&times;</button>
        </div>

    `).join("");

    contenitore.querySelectorAll("[data-rimuovi-tariffa]").forEach(pulsante => {

        pulsante.onclick = () => {

            delete tariffeInModifica.dateSpeciali[pulsante.dataset.rimuoviTariffa];
            mostraListaDateSpeciali();

        };

    });

}

function salvaGestioneTariffe() {

    const prezzoStandard = numero(document.getElementById("txtTariffaStandard").value);
    const prezzoSabato = numero(document.getElementById("txtTariffaSabato").value);
    const prezzoDomenica = numero(document.getElementById("txtTariffaDomenica").value);

    if (prezzoStandard <= 0 || prezzoSabato <= 0 || prezzoDomenica <= 0) {

        avviso("Inserisci prezzi validi per tariffa standard, sabato e domenica.");

        return;

    }

    tariffeInModifica.prezzoStandard = prezzoStandard;
    tariffeInModifica.prezzoSabato = prezzoSabato;
    tariffeInModifica.prezzoDomenica = prezzoDomenica;

    localStorage.setItem(CHIAVE_TARIFFE, JSON.stringify(tariffeInModifica));

    aggiornaTariffaAutomatica();
    chiudiGestioneTariffe();

}
