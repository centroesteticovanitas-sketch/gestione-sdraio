/* ============================================================
 * AMURUSU RESIDENCE
 * layout.js
 *
 * Definizione geometrica delle postazioni
 * ============================================================ */

"use strict";

/* ============================================================
 * LAYOUT
 * ============================================================ */

const layout = [

    /* SINISTRA */

    { id: 1,  x: 50,  y:291, rot:"H" },
    { id: 2,  x: 50,  y:319, rot:"H" },
    { id: 3,  x: 50,  y:347, rot:"H" },
    { id: 4,  x: 50,  y:375, rot:"H" },
    { id: 5,  x: 50,  y:403, rot:"H" },
    { id: 6,  x: 50,  y:431, rot:"H" },
    { id: 7,  x: 50,  y:459, rot:"H" },
    { id: 8,  x: 50,  y:487, rot:"H" },
    { id: 9,  x: 50,  y:514, rot:"H" },
    { id:10,  x: 50,  y:542, rot:"H" },
    { id:11,  x: 50,  y:571, rot:"H" },
    { id:12,  x: 50,  y:598, rot:"H" },

    /* ALTO */

    { id:13, x:247, y:70, rot:"V" },
    { id:14, x:275, y:70, rot:"V" },
    { id:15, x:303, y:70, rot:"V" },
    { id:16, x:331, y:70, rot:"V" },
    { id:17, x:359, y:70, rot:"V" },
    { id:18, x:387, y:70, rot:"V" },

    /* DESTRA COLONNA 1 */

    { id:19, x:308, y:212, rot:"H" },
    { id:20, x:308, y:240, rot:"H" },
    { id:21, x:308, y:268, rot:"H" },
    { id:22, x:308, y:296, rot:"H" },
    { id:23, x:308, y:324, rot:"H" },
    { id:24, x:308, y:352, rot:"H" },
    { id:25, x:308, y:380, rot:"H" },
    { id:26, x:308, y:408, rot:"H" },
    { id:27, x:308, y:436, rot:"H" },
    { id:28, x:308, y:464, rot:"H" },

    /* DESTRA COLONNA 2 */

    { id:29, x:353, y:212, rot:"H" },
    { id:30, x:353, y:240, rot:"H" },
    { id:31, x:353, y:268, rot:"H" },
    { id:32, x:353, y:296, rot:"H" },
    { id:33, x:353, y:324, rot:"H" },
    { id:34, x:353, y:352, rot:"H" },
    { id:35, x:353, y:380, rot:"H" },
    { id:36, x:353, y:408, rot:"H" },
    { id:37, x:353, y:436, rot:"H" },
    { id:38, x:353, y:464, rot:"H" },

    /* BASSO */

    { id:39, x:150, y:570, rot:"V" },
    { id:40, x:178, y:570, rot:"V" }

];

/* ============================================================
 * INDICE
 * ============================================================ */

const indiceLayout = new Map();

for (const posizione of layout) {

    indiceLayout.set(

        posizione.id,

        posizione

    );

}

/* ============================================================
 * API
 * ============================================================ */

function posizioneSdraia(id) {

    return indiceLayout.get(id) ?? null;

}

function tutteLePosizioni() {

    return layout;

}

function esistePosizione(id) {

    return indiceLayout.has(id);

}

function numeroPostazioni() {

    return layout.length;

}