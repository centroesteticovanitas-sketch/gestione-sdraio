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

        btnDataPrecedente:
            document.getElementById("btnDataPrecedente"),

        btnOggi:
            document.getElementById("btnOggi"),

        btnDataSuccessiva:
            document.getElementById("btnDataSuccessiva"),

        btnPrenota:
            document.getElementById("btnPrenota"),

        btnStatistiche:
            document.getElementById("btnStatistiche"),

        btnTariffe:
            document.getElementById("btnTariffe"),

        btnIncassi:
            document.getElementById("btnIncassi"),

        badgeIncassi:
            document.getElementById("badgeIncassi"),

        btnEsci:
            document.getElementById("btnEsci"),

        btnMenuMobile:
            document.getElementById("btnMenuMobile"),

        menuMobile:
            document.getElementById("menuMobile"),

        btnStatisticheMobile:
            document.getElementById("btnStatisticheMobile"),

        btnTariffeMobile:
            document.getElementById("btnTariffeMobile"),

        btnEsciMobile:
            document.getElementById("btnEsciMobile"),

        btnPrenotaMobile:
            document.getElementById("btnPrenotaMobile"),

        btnIncassiMobile:
            document.getElementById("btnIncassiMobile"),

        badgeIncassiMobile:
            document.getElementById("badgeIncassiMobile"),

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

        viewport:
            document.getElementById("mappaViewport"),

        layer:
            document.getElementById("layerSdraie"),

        scheda:
            document.getElementById("scheda"),

        zoomMeno:
            document.getElementById("btnZoomMeno"),

        zoomReset:
            document.getElementById("btnZoomReset"),

        zoomPiu:
            document.getElementById("btnZoomPiu")

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

        note:
            document.getElementById("txtNote"),

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

        accesso:
            document.getElementById("modalAccesso"),

        pagamento:
            document.getElementById("modalPagamento"),

        tariffe:
            document.getElementById("modalTariffe"),

        incassi:
            document.getElementById("modalIncassi"),

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
                document.getElementById("btnSalvaPagamento"),

            chiudiTariffe:
                document.getElementById("btnChiudiTariffe"),

            annullaTariffe:
                document.getElementById("btnAnnullaTariffe"),

            salvaTariffe:
                document.getElementById("btnSalvaTariffe")

        }

    },

    /* ========================================================
     * PAGAMENTO
     * ====================================================== */

    pagamento: {

        importo:
            document.getElementById("txtImportoPagamento"),

        metodo:
            document.getElementById("cmbMetodoPagamento"),

        operatore:
            document.getElementById("cmbOperatorePagamento")

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

    DOM.scheda.btnLinkSumup =
        document.getElementById("btnLinkSumup");

}
