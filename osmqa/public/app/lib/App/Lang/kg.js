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
 * @requires OpenLayers/Lang/ru.js
 * @requires App/config.js
 */
OpenLayers.Util.extend(OpenLayers.Lang.ru, {
    "app.title": "Quality Grid",
    "btn.refresh.text": "refresh",
    "btn.refresh.tooltip": "Force tiles reloading (this happens every 5 minutes)",
    "displayzone.title.prefix": "Tile",
    "displayzone.defaulttext": " ",
    "displayzone.tool.zoom": "Zoom to this tile",
    "displayzone.tool.unselect": "Unselect this tile<br/>Hint: you can click again on the same tile",
    "displayzone.tbar.reserve": "Reserve",
    'displayzone.tbar.reserve.tooltip': "Mark this area as reserved (yellow outline when unselected). Then, start editing with next buttons",
    'displayzone.tbar.josm': "JOSM",
    'displayzone.tbar.josm.tooltip': "Load this data in JOSM, with the remotecontrol plugin",
    'displayzone.tbar.potlatch': "Potlatch",
    'displayzone.tbar.potlatch.tooltip': "Load this data in Potlatch (new window)",
    'displayzone.tbar.walkingpapers.tooltip': "Load this area in Walking Papers (new window)",
    'displayzone.tbar.walkingpapers': "WP",
    'displayzone.tbar.unreserve': "Unreserve",
    'displayzone.tbar.unreserve.tooltip': "Mark this area as NOT reserved (when you're done with it)",
    'displayzone.bbar.allnok': "All NOK",
    'displayzone.bbar.allnok.tooltip': 'Mark all fields as NOT OK',
    'displayzone.bbar.allok': "All OK",
    "reserved": "reserved",
    "loading": "loading...",
    "dialog.error.save.title": "Oops, something went wrong...",
    "dialog.error.save.msg": "We could not save the feature update.",
    "dialog.info.clic.title": "Not yet...",
    "dialog.info.clic.msg": "You need to zoom beyond z="+(App.config.minZoomlevelForVectors-1)+" in order to select tiles !",
    "layer.tiles.vector": "Stroke",
    "layer.tiles.raster": "Fill",
    "layer.osm.attribution": "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    "layer.menu.lint": "Maplint",
    "layer.menu.tiles": "Tiles",
    'dialog.permalink.title': "Permalink",
    'dialog.permalink.btn.open': "Open link",
    'dialog.btn.close': "Close",
    'layertree.btn.addlayers': "Add WMS layers",
    'layertree.btn.permalink': "Permalink",
    'layer.menu.baselayers': "Base layer"
});
