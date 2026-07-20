/* ============================================================
 * prenotazioni.js
 * Parte 1 - Archivio e gestione prenotazioni
 * ============================================================
 */

"use strict";

const CHIAVE_ARCHIVIO = "amurusu-prenotazioni-v1";

function prenotazioniDelGiorno(data = DOM.header.data.value) {

    return Stato.prenotazioni.filter(p => p.data === data);

}

function salvaArchivio() {

    if (sincronizzazioneFirebaseAttiva) {

        salvaArchivioFirebase(Stato.prenotazioni);

    }

    localStorage.setItem(CHIAVE_ARCHIVIO, JSON.stringify(Stato.prenotazioni));

}

function caricaPrenotazioni() {

    try {

        const archivio = JSON.parse(localStorage.getItem(CHIAVE_ARCHIVIO) || "[]");

        Stato.prenotazioni = archivio.map(dati => creaPrenotazione(dati));

    }
    catch (errore) {

        console.warn("Archivio prenotazioni non leggibile.", errore);
        Stato.prenotazioni = [];

    }

    ridisegnaSdraie();

}

function cambiaDataVisualizzata() {

    if (Stato.modalita === Modalita.NUOVA_PRENOTAZIONE) {

        annullaPrenotazione();

    }

    chiudiScheda();
    Stato.sdraieSelezionate = [];
    ridisegnaSdraie();

}

/* ============================================================
 * ARCHIVIO
 * ============================================================
 */

function aggiungiPrenotazione(prenotazione) {

    Stato.prenotazioni.push(prenotazione);

    ordinaPrenotazioni();

    salvaArchivio();
    ridisegnaSdraie();

}

function eliminaPrenotazione(prenotazione) {

    const indice = Stato.prenotazioni.indexOf(prenotazione);

    if (indice >= 0) {

        Stato.prenotazioni.splice(indice, 1);

    }

    salvaArchivio();
    ridisegnaSdraie();

}

function numeroPrenotazioni() {

    return Stato.prenotazioni.length;

}

/* ============================================================
 * RICERCA
 * ============================================================
 */

function trovaPrenotazioneDaSdraia(id) {

    return Stato.mappaSdraie.get(id)?.prenotazione ?? null;

}

function trovaPrenotazione(idPrenotazione) {

    return Stato.prenotazioni.find(

        p => p.id === idPrenotazione

    ) ?? null;

}

function cercaPrenotazioni(testo) {

    testo = testo.trim().toLowerCase();

    if (!testo) {

        return [...Stato.prenotazioni];

    }

    return Stato.prenotazioni.filter(p =>

        p.cognome.toLowerCase().includes(testo) ||

        p.telefono.toLowerCase().includes(testo)

    );

}

function esistePrenotazione(idPrenotazione) {

    return trovaPrenotazione(idPrenotazione) !== null;

}

/* ============================================================
 * ORDINAMENTO
 * ============================================================
 */

function ordinaPrenotazioni() {

    Stato.prenotazioni.sort((a, b) => {

        const sa = Math.min(...a.sdraie);

        const sb = Math.min(...b.sdraie);

        return sa - sb;

    });

}

/* ============================================================
 * CREAZIONE
 * ============================================================
 */

function salvaNuovaPrenotazione(dati) {

    const prenotazione = creaPrenotazione(dati);

    assegnaSdraie(

        prenotazione,

        Stato.sdraieSelezionate

    );

    aggiungiPrenotazione(prenotazione);

    Stato.sdraieSelezionate = [];

    ridisegnaSdraie();
    chiudiScheda();

}

/* ============================================================
 * MODIFICA
 * ============================================================
 */

function salvaModifichePrenotazione(dati) {

    const p = Stato.prenotazioneInModifica;

    if (!p) return false;

    const altrePrenotazioni = prenotazioniDelGiorno(dati.data)
        .filter(altra => altra !== p);

    const postazioniDisponibili = layout
        .map(posizione => posizione.id)
        .filter(id => !altrePrenotazioni.some(altra => altra.sdraie.includes(id)));

    const nuoveSdraie = p.sdraie
        .filter(id => postazioniDisponibili.includes(id))
        .slice(0, dati.numero);

    for (const id of postazioniDisponibili) {

        if (nuoveSdraie.length >= dati.numero) break;

        if (!nuoveSdraie.includes(id)) nuoveSdraie.push(id);

    }

    if (nuoveSdraie.length !== dati.numero) {

        avviso("Non ci sono abbastanza sdraie libere per questa data.");

        return false;

    }

    p.cognome = dati.cognome;

    p.telefono = dati.telefono;

    p.note = dati.note;

    p.data = dati.data;

    p.prezzo = dati.prezzo;

    p.acconto = dati.acconto;

    assegnaSdraie(p, nuoveSdraie);

    salvaArchivio();

    ridisegnaSdraie();

    return true;

}

/* ============================================================
 * LETTURA FORM
 * ============================================================
 */

function leggiFormPrenotazione() {

    return {

        cognome:

            DOM.form.cognome.value.trim(),

        telefono:

            DOM.form.telefono.value.trim(),

        note:

            DOM.form.note.value.trim(),

        data:

            DOM.form.data.value,

        numero:

            intero(

                DOM.form.numero.value

            ),

        prezzo:

            numero(

                DOM.form.prezzo.value

            ),

        acconto:

            numero(

                DOM.form.acconto.value

            ),

        colore: Stato.coloreSelezione ?? undefined

    };

}

/* ============================================================
 * GESTIONE SDRAIE
 * ============================================================
 */

function assegnaPrenotazioneAlleSdraie(prenotazione) {

    for (const id of prenotazione.sdraie) {

        const sdraia = trovaSdraia(id);

        if (!sdraia) continue;

        sdraia.prenotazione = prenotazione;

        occupaSdraia(

            id,

            prenotazione.colore

        );

    }

}

function liberaPrenotazioneDalleSdraie(prenotazione) {

    for (const id of prenotazione.sdraie) {

        liberaSdraia(id);

    }

}

function aggiornaSdraiePrenotazione(

    prenotazione,

    nuoveSdraie

) {

    liberaPrenotazioneDalleSdraie(prenotazione);

    assegnaSdraie(

        prenotazione,

        nuoveSdraie

    );

    assegnaPrenotazioneAlleSdraie(prenotazione);

    salvaArchivio();

    ridisegnaSdraie();

    aggiornaBarraStato();

}

/* ============================================================
 * DISPONIBILITA'
 * ============================================================
 */

function sdraiaDisponibile(id) {

    const s = Stato.mappaSdraie.get(id);

    return Boolean(s && s.stato === "libera");

}

function sdraieDisponibili() {

    return layout.filter(

        s => sdraiaDisponibile(s.id)

    );

}

function sdraieOccupate() {

    return layout.filter(

        s => !sdraiaDisponibile(s.id)

    );

}

function sdraieLibere() {

    return sdraieDisponibili();

}

function numeroSdraieLibere() {

    return sdraieDisponibili().length;

}

function numeroSdraieOccupate() {

    return sdraieOccupate().length;

}

/* ============================================================
 * SELEZIONE
 * ============================================================
 */

function selezionaSdraia(id) {

    const indice = Stato.sdraieSelezionate.indexOf(id);

    if (indice < 0 && !sdraiaDisponibile(id)) {

        flashSdraie([id]);

        return;
    
    }

    if (indice >= 0) {

        Stato.sdraieSelezionate.splice(

            indice,

            1

        );

        liberaSdraia(id);

    }
    else {

        Stato.sdraieSelezionate.push(id);
        occupaSdraia(id, Stato.coloreSelezione);

    }

    Stato.sdraieSelezionate.sort(

        (a, b) => a - b

    );

    if (Stato.sdraieSelezionate.length === intero(DOM.form.numero.value)) {

        salvaPrenotazione();

        return;

    }

    DOM.mappa.scheda.innerHTML =
        `Sdraie selezionate: ${Stato.sdraieSelezionate.length} di ${DOM.form.numero.value}. Premi «Salva prenotazione» per confermare.`;

}

/* ============================================================
 * RICOSTRUZIONE ARCHIVIO
 * ============================================================
 */

function ricostruisciMappaSdraie() {

    Stato.mappaSdraie.clear();

    for (const prenotazione of Stato.prenotazioni) {

        assegnaPrenotazioneAlleSdraie(

            prenotazione

        );

    }

    aggiornaBarraStato();

}

/* ============================================================
 * AGGIORNAMENTO COMPLETO
 * ============================================================
 */

function aggiornaPrenotazioni() {

    ricostruisciMappaSdraie();

    ridisegnaSdraie();

}

/* ============================================================
 * GESTIONE MODAL
 * ============================================================
 */

function resetModal() {

    pulisciErrori();

    Stato.prenotazioneInModifica = null;
    Stato.sdraieSelezionate = [];
    Stato.coloreSelezione = null;

    DOM.form.cognome.value = "";
    DOM.form.telefono.value = "";
    DOM.form.note.value = "";

    DOM.form.numero.value = 2;
    DOM.form.numero.readOnly = false;

    DOM.form.acconto.value = "0";

    DOM.form.data.value = DOM.header.data.value || oggiISO();

    DOM.form.chkTariffaAuto.checked = DOM.header.chkTariffaAuto.checked;

    aggiornaTariffaAutomatica();

    rimuoviEvidenziazione();

    aggiornaTotale();

}

function caricaPrenotazioneNelModal(prenotazione) {

    Stato.prenotazioneInModifica = prenotazione;

    DOM.form.cognome.value = prenotazione.cognome;

    DOM.form.telefono.value = prenotazione.telefono;

    DOM.form.note.value = prenotazione.note ?? "";

    DOM.form.numero.value = prenotazione.numero;

    DOM.form.numero.readOnly = false;

    DOM.form.data.value = prenotazione.data ?? "";

    DOM.form.prezzo.value = prenotazione.prezzo;

    DOM.form.acconto.value = prenotazione.acconto;

    aggiornaTotale();

}

function aggiornaTariffaAutomatica() {

    if (DOM.form.chkTariffaAuto.checked) {

        DOM.form.prezzo.value = prezzoAutomaticoPerData(DOM.form.data.value);

    }

    aggiornaTotale();

}

function iniziaSceltaSdraie() {

    if (!validaPrenotazione(false)) return;

    Stato.modalita = Modalita.NUOVA_PRENOTAZIONE;
    Stato.sdraieSelezionate = [];
    Stato.coloreSelezione = prossimoColore(DOM.form.data.value);

    DOM.header.data.value = DOM.form.data.value;
    DOM.header.btnPrenota.textContent = "Annulla selezione";
    DOM.mappa.scheda.innerHTML =
        `Seleziona ${DOM.form.numero.value} sdraie sulla planimetria: la prenotazione verrà salvata automaticamente.`;

    chiudiModalPrenotazione();
    ridisegnaSdraie();

}

/* ============================================================
 * VALIDAZIONE
 * ============================================================
 */

function pulisciErrori() {

    DOM.errori.cognome.textContent = "";
    DOM.errori.telefono.textContent = "";
    DOM.errori.numero.textContent = "";

    DOM.form.cognome.classList.remove("inputErrore");
    DOM.form.telefono.classList.remove("inputErrore");
    DOM.form.numero.classList.remove("inputErrore");

}

function errore(campo, etichetta, messaggio) {

    etichetta.textContent = messaggio;

    campo.classList.add("inputErrore");

    campo.focus();

}

function normalizzaTelefonoInternazionale(telefono) {

    const numero = telefono.trim().replace(/[\s().-]/g, "");

    if (!/^\+[1-9]\d{6,14}$/.test(numero)) {

        return null;

    }

    return numero;

}

function validaPrenotazione(richiediSdraie = true) {

    pulisciErrori();

    if (DOM.form.cognome.value.trim() === "") {

        errore(

            DOM.form.cognome,

            DOM.errori.cognome,

            "Inserisci il cognome."

        );

        return false;

    }

    if (DOM.form.telefono.value.trim() === "") {

        errore(

            DOM.form.telefono,

            DOM.errori.telefono,

            "Inserisci il telefono."

        );

        return false;

    }

    const telefono = normalizzaTelefonoInternazionale(DOM.form.telefono.value);

    if (!telefono) {

        errore(

            DOM.form.telefono,

            DOM.errori.telefono,

            "Inserisci il prefisso internazionale, ad es. +39 333 1234567."

        );

        return false;

    }

    DOM.form.telefono.value = telefono;

    if (intero(DOM.form.numero.value) < 1) {

        errore(

            DOM.form.numero,

            DOM.errori.numero,

            "Numero non valido."

        );

        return false;

    }

    if (!DOM.form.data.value) {

        avviso("Seleziona una data.");

        return false;

    }

    if (Stato.prenotazioneInModifica) {

        const conflitto = Stato.prenotazioneInModifica.sdraie.some(id =>
            prenotazioniDelGiorno(DOM.form.data.value)
                .some(p => p !== Stato.prenotazioneInModifica && p.sdraie.includes(id))
        );

        if (conflitto) {

            avviso("Una delle sdraie è già prenotata per questa data.");

            return false;

        }

    }

    if (!Stato.prenotazioneInModifica) {

        const conflitto = Stato.sdraieSelezionate.some(id =>
            prenotazioniDelGiorno(DOM.form.data.value).some(p => p.sdraie.includes(id))
        );

        if (conflitto) {

            avviso("Una delle sdraie selezionate è già prenotata per questa data.");

            return false;

        }

    }

    if (

        richiediSdraie &&

        Stato.prenotazioneInModifica === null &&

        Stato.sdraieSelezionate.length !==

        intero(DOM.form.numero.value)

    ) {

        avviso(

            "Seleziona le sdraie sulla planimetria."

        );

        return false;

    }

    return true;

}

/* ============================================================
 * SALVATAGGIO
 * ============================================================
 */

function salvaPrenotazione() {

    if (!validaPrenotazione()) {

        return;

    }

    const dati = leggiFormPrenotazione();

    if (Stato.prenotazioneInModifica) {

        const prenotazione = Stato.prenotazioneInModifica;

        if (dati.numero !== prenotazione.numero) {

            Stato.prenotazionePostazioniOriginale = {
                cognome: prenotazione.cognome,
                telefono: prenotazione.telefono,
                note: prenotazione.note,
                data: prenotazione.data,
                numero: prenotazione.numero,
                prezzo: prenotazione.prezzo,
                acconto: prenotazione.acconto
            };

            prenotazione.cognome = dati.cognome;
            prenotazione.telefono = dati.telefono;
            prenotazione.note = dati.note;
            prenotazione.data = dati.data;
            prenotazione.numero = dati.numero;
            prenotazione.prezzo = dati.prezzo;
            prenotazione.acconto = dati.acconto;

            aggiornaPrenotazione(prenotazione);

            Stato.prenotazioneInModifica = null;
            DOM.header.data.value = dati.data;
            ridisegnaSdraie();
            chiudiModalPrenotazione();
            entraModificaPostazioni(prenotazione);

            return;

        }

        if (!salvaModifichePrenotazione(dati)) {

            return;

        }

        Stato.schedaAperta = null;

        mostraScheda(

            Stato.prenotazioneInModifica.sdraie[0]

        );

        Stato.prenotazioneInModifica = null;

    }
    else {

        salvaNuovaPrenotazione(dati);

    }

    rimuoviEvidenziazione();

    Stato.modalita = Modalita.NORMALE;
    Stato.coloreSelezione = null;

    DOM.header.btnPrenota.textContent = "➕ Prenotazione";

    DOM.modal.pulsanti.salvaPrenotazione.textContent = "Salva";

    chiudiModalPrenotazione();

}

/* ============================================================
 * ANNULLA
 * ============================================================
 */

function annullaPrenotazione() {

    Stato.sdraieSelezionate = [];
    Stato.coloreSelezione = null;

    Stato.prenotazioneInModifica = null;

    Stato.modalita = Modalita.NORMALE;

    DOM.header.btnPrenota.textContent = "➕ Prenotazione";

    DOM.modal.pulsanti.salvaPrenotazione.textContent = "Salva";

    rimuoviEvidenziazione();

    ridisegnaSdraie();

    chiudiModalPrenotazione();

}
/* ============================================================
 * AGGIORNA TOTALE DEL FORM
 * ============================================================
 */

function aggiornaTotale() {

    const quantita = numero(DOM.form.numero.value);

    const prezzo = numero(DOM.form.prezzo.value);

    const totale = quantita * prezzo;

    DOM.form.totale.value = totale.toFixed(2);

    aggiornaSaldo();

}

/* ============================================================
 * AGGIORNA SALDO DEL FORM
 * ============================================================
 */

function aggiornaSaldo() {

    const totale = numero(DOM.form.totale.value);

    const acconto = numero(DOM.form.acconto.value);

    DOM.form.saldo.value = euro(

        Math.max(totale - acconto, 0)

    );

}
