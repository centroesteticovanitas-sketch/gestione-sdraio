/* ============================================================
 * dom.js
 * Riferimenti centralizzati al DOM
 * ============================================================
 */

"use strict";

const DOM = {

    /* ========================================================
     * HEADER
     * ====================================================== */

    header: {

        data:
            document.getElementById("data"),

        btnPrenota:
            document.getElementById("btnPrenota"),

        barraStato:
            document.getElementById("barraStato"),

        lblLibere:
            document.getElementById("libere"),

        lblOccupate:
            document.getElementById("occupate"),

        chkTariffaAuto:
            document.getElementById("chkTariffaAuto")

    },

    /* ========================================================
     * MAPPA
     * ====================================================== */

    mappa: {

        contenitore:
            document.getElementById("mappa"),

        layer:
            document.getElementById("layerSdraie"),

        scheda:
            document.getElementById("scheda")

    },

    /* ========================================================
     * FORM PRENOTAZIONE
     * ====================================================== */

    form: {

        cognome:
            document.getElementById("txtCognome"),

        telefono:
            document.getElementById("txtTelefono"),

        numero:
            document.getElementById("txtNumero"),

        data:
            document.getElementById("txtData"),

        prezzo:
            document.getElementById("txtPrezzo"),

        totale:
            document.getElementById("txtTotale"),

        acconto:
            document.getElementById("txtAcconto"),

        saldo:
            document.getElementById("txtSaldo"),

        chkTariffaAuto:
            document.getElementById("chkTariffaAutoModal")

    },

    /* ========================================================
     * ERRORI VALIDAZIONE
     * ====================================================== */

    errori: {

        cognome:
            document.getElementById("errCognome"),

        telefono:
            document.getElementById("errTelefono"),

        numero:
            document.getElementById("errNumero")

    },

    /* ========================================================
     * MODAL
     * ====================================================== */

    modal: {

        prenotazione:
            document.getElementById("modalPrenotazione"),

        pagamento:
            document.getElementById("modalPagamento"),

        pulsanti: {

            chiudiPrenotazione:
                document.getElementById("btnChiudiModal"),

            annullaPrenotazione:
                document.getElementById("btnAnnulla"),

            salvaPrenotazione:
                document.getElementById("btnSalva"),

            chiudiPagamento:
                document.getElementById("btnChiudiPagamento"),

            annullaPagamento:
                document.getElementById("btnAnnullaPagamento"),

            salvaPagamento:
                document.getElementById("btnSalvaPagamento")

        }

    },

    /* ========================================================
     * PAGAMENTO
     * ====================================================== */

    pagamento: {

        importo:
            document.getElementById("txtImportoPagamento")

    },

    /* ========================================================
     * SCHEDA (bottoni creati dinamicamente)
     * ====================================================== */

    scheda: {

        btnPagamento: null,

        btnModifica: null,

        btnPostazioni: null,

        btnElimina: null,

        btnChiudi: null

    }

};

/* ============================================================
 * AGGIORNA RIFERIMENTI SCHEDA
 * Da richiamare dopo scheda.innerHTML = ...
 * ============================================================
 */

function aggiornaDOMScheda() {

    DOM.scheda.btnPagamento =
        document.getElementById("btnPagamento");

    DOM.scheda.btnModifica =
        document.getElementById("btnModifica");

    DOM.scheda.btnPostazioni =
        document.getElementById("btnPostazioni");

    DOM.scheda.btnElimina =
        document.getElementById("btnElimina");

    DOM.scheda.btnChiudi =
        document.getElementById("btnChiudiScheda");

}
