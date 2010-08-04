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
 * @author Claudius Henrichs chenrichs@gmail.com
 *
 */

/*
 * @requires OpenLayers/Lang/de.js
 * @requires App/config.js
 */
OpenLayers.Util.extend(OpenLayers.Lang.de, {
    "app.title": "Qualitätsraster",
    "btn.refresh.text": "Aktualisieren",
    "btn.refresh.tooltip": "Neu laden der Kacheln erzwingen (normalerweise alle 5 Minuten)",
    "displayzone.title.prefix": "Kachel",
    "displayzone.defaulttext": " ",
    "displayzone.tool.zoom": "Zu dieser Kachel zoomen",
    "displayzone.tool.unselect": "Unselect this tile<br/>Hint: you can click again on the same tile",
    "displayzone.tbar.reserve": "Reservieren",
    'displayzone.tbar.reserve.tooltip': "Dieses Gebiet als reserviert markieren (gelbe Umrandung wenn nicht ausgewählt). Mit den Knöpfen rechts bearbeiten.",
    'displayzone.tbar.josm': "JOSM",
    'displayzone.tbar.josm.tooltip': "Diese Daten in JOSM mit dem Remotecontrol-Plugin laden",
    'displayzone.tbar.potlatch': "Potlatch",
    'displayzone.tbar.potlatch.tooltip': "Diese Daten in Potlatch laden (öffnet neues Fenster)",
    'displayzone.tbar.unreserve': "Freigeben",
    'displayzone.tbar.unreserve.tooltip': "Dieses Gebiet als NICHT reserviert markieren (wenn fertig bearbeitet)",
    'displayzone.bbar.allnok': "Alle NOK",
    'displayzone.bbar.allnok.tooltip': 'Alle Felder als NOT OK markieren',
    'displayzone.bbar.allok': "Alle OK",
    "reserved": "reserviert",
    "loading": "Laden...",
    "dialog.error.save.title": "Uups, das hat nicht geklappt...",
    "dialog.error.save.msg": "Die Aktualisierung konnte nicht gespeichert werden.",
    "dialog.info.clic.title": "Noch nicht...",
    "dialog.info.clic.msg": "Um Kacheln auswählen zu können muss weiter als z="+(App.config.minZoomlevelForVectors-1)+" hereingezoomt werden!",
    "layer.tiles.vector": "Vectorkacheln (Umrandung)",
    "layer.tiles.raster": "Rasterkacheln (Füllung)",
    "layer.osm.attribution": "Data CC-By-SA von <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    'dialog.permalink.title': "Permalink",
    'dialog.permalink.btn.open': "Link öffnen",
    'dialog.btn.close': "Schliessen",
    'layertree.btn.addlayers': "WMS-Ebenen hinzufügen",
    'layertree.btn.permalink': "Permalink",
    'layertree.rootnode.text': "Ebenen"
});
