/* ============================================================
 * statistiche.js
 * Riepilogo giornaliero per amministratore
 * ============================================================
 */

"use strict";

function mostraStatistiche(periodo = "giorno") {

    const intervallo = intervalloStatistiche(periodo, DOM.header.data.value);
    const prenotazioni = Stato.prenotazioni.filter(prenotazione =>
        dataNellIntervallo(prenotazione.data, intervallo)
    );

    const riepilogo = prenotazioni.reduce((totali, prenotazione) => {

        totali.postazioni += prenotazione.numero;
        totali.totale += prenotazione.totale;
        totali.saldo += prenotazione.saldo;

        return totali;

    }, {
        postazioni: 0,
        totale: 0,
        saldo: 0,
        sumup: 0,
        contanti: 0,
        altro: 0
    });

    Stato.prenotazioni.forEach(prenotazione => {

        prenotazione.pagamenti
            .filter(pagamento => dataNellIntervallo(pagamento.data, intervallo))
            .forEach(pagamento => {

                const metodo = pagamento.metodo ?? "Non specificato";

                if (metodo === "SumUp") {
                    riepilogo.sumup += pagamento.importo;
                }
                else if (metodo === "Contanti") {
                    riepilogo.contanti += pagamento.importo;
                }
                else {
                    riepilogo.altro += pagamento.importo;
                }

            });

    });

    Stato.schedaAperta = null;

    const oggi = oggiISO();
    const fineProssimiGiorni = new Date(`${oggi}T00:00:00`);
    fineProssimiGiorni.setDate(fineProssimiGiorni.getDate() + 9);
    const prossimePrenotazioni = Stato.prenotazioni
        .filter(prenotazione =>
            prenotazione.data >= oggi &&
            prenotazione.data <= dataISO(fineProssimiGiorni)
        )
        .sort((a, b) =>
            a.data.localeCompare(b.data) ||
            a.cognome.localeCompare(b.cognome)
        );

    DOM.mappa.scheda.innerHTML = `

        <div class="scheda-statistiche">
            <div class="scheda-titolo">
                📊 Statistiche ${intervallo.etichetta}
                <button id="btnChiudiStatistiche" type="button" class="btn-chiudi-scheda" aria-label="Chiudi statistiche">&times;</button>
            </div>
            <div class="selettore-statistiche" aria-label="Periodo statistiche">
                <button type="button" data-periodo="giorno" class="${periodo === "giorno" ? "attivo" : ""}">Giorno</button>
                <button type="button" data-periodo="settimana" class="${periodo === "settimana" ? "attivo" : ""}">Settimana</button>
                <button type="button" data-periodo="mese" class="${periodo === "mese" ? "attivo" : ""}">Mese</button>
                <button type="button" data-periodo="stagione" class="${periodo === "stagione" ? "attivo" : ""}">Stagione</button>
            </div>
            <div class="griglia-statistiche">
                <div><span>Prenotazioni</span><strong>${prenotazioni.length}</strong></div>
                <div><span>Postazioni</span><strong>${riepilogo.postazioni}</strong></div>
                <div><span>Totale prenotato</span><strong>${euro(riepilogo.totale)} €</strong></div>
                <div><span>Da incassare</span><strong>${euro(riepilogo.saldo)} €</strong></div>
                <div><span>Incassi SumUp</span><strong>${euro(riepilogo.sumup)} €</strong></div>
                <div><span>Incassi contanti</span><strong>${euro(riepilogo.contanti)} €</strong></div>
            </div>
            ${riepilogo.altro > 0 ? `<p class="nota-statistiche">Pagamenti senza metodo registrato: ${euro(riepilogo.altro)} €</p>` : ""}
        </div>

    `;

    DOM.mappa.scheda.querySelector(".scheda-statistiche").insertAdjacentHTML(
        "beforeend",
        `
            <div class="riepilogo-prossime-prenotazioni">
                <h3>Prossime prenotazioni (10 giorni)</h3>
                ${prossimePrenotazioni.length ? prossimePrenotazioni.map(prenotazione => `
                    <div class="riga-prossima-prenotazione">
                        <strong>${formattaData(prenotazione.data)}</strong>
                        <span>${prenotazione.cognome} · ${prenotazione.numero} postazioni</span>
                        <span>${euro(prenotazione.totale)} €</span>
                    </div>
                `).join("") : "<p>Nessuna prenotazione nei prossimi 10 giorni.</p>"}
            </div>
        `
    );

    document.getElementById("btnChiudiStatistiche").onclick = chiudiScheda;

    document.querySelectorAll("[data-periodo]").forEach(pulsante => {

        pulsante.onclick = () => mostraStatistiche(pulsante.dataset.periodo);

    });

}

function intervalloStatistiche(periodo, dataRiferimento) {

    const data = new Date(`${dataRiferimento}T00:00:00`);

    if (periodo === "settimana") {

        const giorno = data.getDay() || 7;
        data.setDate(data.getDate() - giorno + 1);

        const inizio = dataISO(data);

        data.setDate(data.getDate() + 6);

        return {
            inizio,
            fine: dataISO(data),
            etichetta: `${formattaData(inizio)} - ${formattaData(dataISO(data))}`
        };

    }

    if (periodo === "mese") {

        const anno = data.getFullYear();
        const mese = data.getMonth();
        const inizio = dataISO(new Date(anno, mese, 1));
        const fine = dataISO(new Date(anno, mese + 1, 0));

        return {
            inizio,
            fine,
            etichetta: new Intl.DateTimeFormat("it-IT", {
                month: "long",
                year: "numeric"
            }).format(data)
        };

    }

    if (periodo === "stagione") {

        return {
            inizio: "2026-05-01",
            fine: "2026-10-01",
            etichetta: "Stagione 2026 · 1 maggio - 1 ottobre"
        };

    }

    return {
        inizio: dataRiferimento,
        fine: dataRiferimento,
        etichetta: formattaData(dataRiferimento)
    };

}

function dataNellIntervallo(data, intervallo) {

    return data >= intervallo.inizio && data <= intervallo.fine;

}

function dataISO(data) {

    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");

}
