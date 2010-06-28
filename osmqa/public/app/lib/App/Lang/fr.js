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
 * @author François Van Der Biest francois.vanderbiest@camptocamp.com
 *
 */

/*
 * @requires OpenLayers/Lang/fr.js
 * @requires App/config.js
 */
OpenLayers.Util.extend(OpenLayers.Lang.fr, {
    "app.title": "Quality Grid",
    "btn.refresh.text": "recharger",
    "btn.refresh.tooltip": "Forcer un rechargement des tuiles<br />(cela se produit automatiquement toutes les 5 minutes)",
    "displayzone.title.prefix": "Tuile",
    "displayzone.defaulttext": " ",
    "displayzone.tool.zoom": "Zoomer sur cette tuile",
    "displayzone.tool.unselect": "Désélectionner cette tuile<br/>Astuce: vous pouvez aussi recliquer sur la même tuile",
    "displayzone.tbar.reserve": "Réserver",
    'displayzone.tbar.reserve.tooltip': "Réserver cette tuile (son contour devient jaune).<br />Ensuite, commencez l'édition avec les boutons qui suivent",
    'displayzone.tbar.josm': "JOSM",
    'displayzone.tbar.josm.tooltip': "Charger cette zone dans JOSM, avec le plugin remotecontrol",
    'displayzone.tbar.potlatch': "Potlatch",
    'displayzone.tbar.potlatch.tooltip': "Charger cette zone dans Potlatch (nouvelle fenêtre)",
    'displayzone.tbar.unreserve': "Dé-réserver",
    'displayzone.tbar.unreserve.tooltip': "Marquer cette tuile comme non réservée (quand vous avez fini de travailler dessus)",
    'displayzone.bbar.allnok': "Tout NOK",
    'displayzone.bbar.allnok.tooltip': 'Marquer tous les champs pas OK',
    'displayzone.bbar.allok': "Tout OK",
    "reserved": "réservée",
    "loading": "chargement...",
    "dialog.error.save.title": "Oups, ça s'est pas bien passé...",
    "dialog.error.save.msg": "On n'a pas pu sauvegarder la modification.",
    "dialog.info.clic.title": "Pas encore...",
    "dialog.info.clic.msg": "Il faut zoomer au dela de z="+(App.config.minZoomlevelForVectors-1)+" pour pouvoir sélectionner une tuile !",
    "layer.tiles.vector": "Tuiles vectorielles (contours)",
    "layer.tiles.raster": "Tuiles raster (remplissage)",
    "layer.osm.attribution": "Données CC-By-SA par <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    'dialog.permalink.title': "Permalien",
    'dialog.permalink.btn.open': "Ouvrir le lien",
    'dialog.btn.close': "Fermer",
    'layertree.btn.addlayers': "Ajouter des couches",
    'layertree.btn.permalink': "Permalien",
    'layertree.rootnode.text': "Couches"
});