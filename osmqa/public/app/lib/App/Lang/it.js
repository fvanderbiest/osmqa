/*
 *
 * This file is part of osmqa
 *
 * osmqa is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * osmqa is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with osmqa.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Luca Delucchi <lucadeluge@gmail.com>
 * 
 */

/*
 * @requires OpenLayers/Lang/en.js
 * @requires App/config.js
 */
OpenLayers.Util.extend(OpenLayers.Lang.en, {
    "app.title": "Quality Grid",
    "btn.refresh.text": "aggiorna",
    "btn.refresh.tooltip": "Forza il ricarimento delle tile (avviene ogni 5 minuti)",
    "displayzone.title.prefix": "Tile",
    "displayzone.defaulttext": " ",
    "displayzone.tool.zoom": "Zoom a questa tile",
    "displayzone.tool.unselect": "Deseleziona questa tile<br/>Suggerimento:puoi cliccare di nuovo sulla stessa tile",
    "displayzone.tbar.reserve": "Riserva",
    'displayzone.tbar.reserve.tooltip': "Marca quest'area come riservata (contorno giallo quando viene deselezionata). Quindi, incomincia l'editing con il prossimo bottone",
    'displayzone.tbar.josm': "JOSM",
    'displayzone.tbar.josm.tooltip': "Carica questi dati in JOSM, con il remotecontrol plugin",
    'displayzone.tbar.potlatch': "Potlatch",
    'displayzone.tbar.potlatch.tooltip': "Carica questi dati in Potlatch (nuova finestra)",
    'displayzone.tbar.unreserve': "Togli riserva",
    'displayzone.tbar.unreserve.tooltip': "Marca quest'area come non riservata (quando ha finito con questa tile)",
    'displayzone.bbar.allnok': "Tutto NOK",
    'displayzone.bbar.allnok.tooltip': 'Marca tutti i campi come NOT OK',
    'displayzone.bbar.allok': "Tutto OK",
    "reserved": "riservata",
    "loading": "caricando...",
    "dialog.error.save.title": "Oops, qualcosa è andato storto...",
    "dialog.error.save.msg": "Non è possibile salvare gli aggiornamenti degli elementi.",
    "dialog.info.clic.title": "Non ancora...",
    "dialog.info.clic.msg": "Hai bisogno di fumare fino al livello z="+(App.config.minZoomlevelForVectors-1)+" per selezionare tiles !",
    "layer.tiles.vector": "Stroke",
    "layer.tiles.raster": "Fill",
    "layer.osm.attribution": "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    "layer.menu.lint": "Maplint",
    "layer.menu.tiles": "Tiles",
    'dialog.permalink.title': "Permalink",
    'dialog.permalink.btn.open': "Apri link",
    'dialog.btn.close': "Chiudi",
    'layertree.btn.addlayers': "Aggiungi layers WMS",
    'layertree.btn.permalink': "Permalink",
    'layertree.rootnode.text': "Layers"
});
