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
 * @include App/Map.js
 * @include App/config.js
 * @include App/LayerTree.js
 * @include App/DisplayZone.js
 */

/*
 * This file represents the application's entry point. 
 * OpenLayers and Ext globals are set, and the page
 * layout is created.
 */

window.onload = function() {

    /*
     * Setting of OpenLayers global vars.
     */
    
    var params = OpenLayers.Util.getParameters();
    var lang = params.lang || "en";
    OpenLayers.Lang.setCode(lang);
    OpenLayers.Number.thousandsSeparator = ' ';
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

    /*
     * Setting of Ext global vars.
     */
    Ext.QuickTips.init();
    // we want to keep tag values in english whatever the chosen language
    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            trueText   : "true",
            falseText  : "false"
        });
    }

    /*
     * Initialize the application.
     */
    
    // We're acting as a mediator between modules:
    App.Map.events.on({
        "tiledisplay": function(config) {
            App.DisplayZone.display(config.feature);
        },
        "tileedit": function(config) {
            App.DisplayZone.edit(config.feature);
        },
        "tileundisplay": function(config) {
            App.DisplayZone.clear();
        }
    });
    
    App.DisplayZone.events.on({
        "commit": function(config) {
            App.Map.persist(config.feature);
        },
        "unselect": function(config) {
            App.Map.unselectFeature(config.feature);
        },
        "zoomto": function(config) {
            App.Map.zoomTo(config);
        }
    });
    
    
    // get a reference to the GeoExt MapPanel
    var mapPanel = App.Map.getMapPanel({
        region: "center",
        id: "mappanel"
    });
    
    // create the Ext viewport
    var vp = new Ext.Viewport({
        layout: "border",
        items: [
            mapPanel, { 
                region: "east",
                layout: "border",
                width: 300,
                minWidth: 300,
                maxWidth: 400,
                split: true,
                collapseMode: "mini",
                border: false,
                items: [
                    App.LayerTree.getPanel(mapPanel.layers, {
                        region: 'north',
                        height: 230,
                        autoScroll: true
                    }), App.DisplayZone.getPanel({
                        region: 'center'
                    })
                ]
            }
        ]
    });
    
    var div = Ext.getCmp('mappanel').bwrap;
    div.appendChild($('tools'));
    div.appendChild($('loading'));
    $('loading').innerHTML = OpenLayers.i18n('loading');
    
    if (!(params.map_x && params.map_y && params.map_zoom)) {
        var boundsStr = (App.config.startupExtent.hasOwnProperty(lang)) ? 
            App.config.startupExtent[lang] : "-1369751,3948310,5537709,12307443";
        mapPanel.map.zoomToExtent(OpenLayers.Bounds.fromString(boundsStr));
    }
};
