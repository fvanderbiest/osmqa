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
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Polygon.js
 * @include OpenLayers/Renderer/SVG.js
 * @include OpenLayers/Renderer/VML.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Protocol/HTTP.js
 * @include OpenLayers/Strategy/Refresh.js
 * @include OpenLayers/Strategy/BBOX.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include OpenLayers/Control/Navigation.js
 * @include OpenLayers/Control/ZoomPanel.js
 * @include OpenLayers/Control/LoadingPanel.js
 * @include OpenLayers/Control/PanZoom.js
 * @include OpenLayers/Control/ArgParser.js
 * @include OpenLayers/Control/Attribution.js
 * @include OpenLayers/Control/ScaleLine.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include OpenLayers/Control/Panel.js
 * @include OpenLayers/Control/MenuButton.js
 * @include OpenLayers/Control/LayerSelector.js
 * @include App/Control.BaseLayerSelector.js
 * @include GeoExt/widgets/MapPanel.js
 * @include App/Control.Click.js
 * @include App/Tools.js
 * @include App/config.js
 * @include App/OpenStreetMap.js
 */

Ext.namespace('App');

/**
 * Module: App.Map
 * Creates a {GeoExt.MapPanel} 
 *
 */
App.Map = (function() {
    /*
     * Private
     */
    
    /**
     * APIProperty: mapPanel
     * The {GeoExt.MapPanel} instance.
     */
    var mapPanel = null;
    
    /**
     * Property: observable
     * The {Ext.util.Observable} instance, which enables us to trigger events.
     * (see events listing below)
     */
    var observable = new Ext.util.Observable();
    
    observable.addEvents(
        /**
         * Event: tiledisplay
         * Fires when we need to display info about a vector tile
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "tiledisplay",
    
        /**
         * Event: tileundisplay
         * Fires when the mouse quits a tile
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "tileundisplay"
    );

    
    /**
     * Property: sfControl
     * {OpenLayers.Control.SelectFeature} the control used to select tiles
     */
    var sfControl = null;
    
    /**
     * Property: hfControl
     * {OpenLayers.Control.SelectFeature} the control used to highlight tiles
     */
    var hfControl = null;
    
    /**
     * Property: tiles
     * {OpenLayers.Layer.Vector} the vector layer used to display tiles
     */
    var tiles = null;
    
    /**
     * Property: raster_tiles
     * {OpenLayers.Layer.WMS} the WMS layer used to display tiles
     */
    var raster_tiles = null;
    
    /**
     * Property: refreshStrategy
     * {OpenLayers.Strategy.Refresh}
     */
    var refreshStrategy = null;
    
    /**
     * Method: getStyleMap
     * Returns the StyleMap for the tiles vector layer 
     *
     * Parameters:
     * tag - {String} (optional) the tag which defines the tiles' layer purpose
     *       ("is map complete for XX" where XX = highway, buildings ...)
     *
     * Returns:
     * {OpenLayers.StyleMap} the stylemap for the vector layer.
     */
    var getStyleMap = function(tag) {
        tag = tag || App.config.defaultTag;
        
        var style = new OpenLayers.Style({
            cursor: "pointer",
            fillColor: "${getColor}",
            fillOpacity: 0,
            strokeColor: "${getColor}",
            strokeWidth: "${getStrokeWidth}", 
            strokeOpacity: 0.2
        }, {
            context: {
                getOpacity: function(feature) {
                    if (feature.attributes[tag] === true) {
                        return 0.3;
                    }
                    return 0.05;	
                },
                getStrokeWidth: function(feature) {
                    if (feature.attributes['reserved'] === true) {
                        return 3;
                    }
                    if (feature.attributes[tag] === true) {
                        return 0;
                    }
                    return 1;	
                },
                getColor: function(feature) {
                    if (feature.attributes['reserved'] === true) {
                        return "#ffff00"; // yellow
                    }
                    if (feature.attributes[tag] === true) {
                        return "#00ff00"; // green
                    }
                    return "#ff0000"; // red					
                }
            }
        });

        return new OpenLayers.StyleMap({
            "default": style,
            "select": {
                fillColor: "#000000",
                strokeColor: "#0000ff", // blue
                strokeWidth: 3
            }
        });
    };
    
    /**
     * Method: getControls
     * Returns an array of map controls
     *
     * Returns:
     * {Array({OpenLayers.Control})} An array of OpenLayers.Control objects.
     */
    var getControls = function() {
        // select feature control
        sfControl = new OpenLayers.Control.SelectFeature(tiles, {
            toggle: true,
            autoActivate: true
        });
        sfControl.handlers.feature.stopDown = false;
        
        // highlight feature control
        hfControl = new OpenLayers.Control.SelectFeature(tiles, {
            hover: true,
            autoActivate: true,
            highlightOnly: true,
            eventListeners: {
                "featurehighlighted": function(config) {
                    observable.fireEvent("tiledisplay", {
                        feature: config.feature
                    });
                },
                "featureunhighlighted": function(config) {
                    observable.fireEvent("tileundisplay", {
                        feature: config.feature
                    });
                }
            }
        });
        hfControl.handlers.feature.stopDown = false;
        hfControl.handlers.feature.stopClick = false;
        
        return [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.ZoomPanel(),
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.LoadingPanel({div: $('loading')}),
            new OpenLayers.Control.ScaleLine(), 
            new App.Control.Click({
                onClick: function(e) {
                    if (e.object.CLASS_NAME == "OpenLayers.Map" &&
                        e.object.getZoom() < App.config.minZoomlevelForVectors) {
                        Ext.Msg.show({
                            title: OpenLayers.i18n("dialog.info.clic.title"),
                            msg: OpenLayers.i18n("dialog.info.clic.msg"),
                            width: 400,
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
            }),
            sfControl, hfControl
        ];
    };
    
    /**
     * Method: persist
     * Calls protocol.commit() on given feature
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} a feature
     */
    var persist = function(feature) {
        feature.state = OpenLayers.State.UPDATE; 
        tiles.protocol.commit([feature], {
            callback: function(resp) { 
                if (resp.code == OpenLayers.Protocol.Response.SUCCESS) {
                    raster_tiles.mergeNewParams({
                        dd: new Date().format('U')
                    });
                } else {
                    // TODO: we have a pb ... restore previous feature value ...
                    Ext.Msg.show({
                        title: OpenLayers.i18n("dialog.error.save.title"),
                        msg: OpenLayers.i18n("dialog.error.save.msg"), // TODO: add feature id in msg
                        width: 400,
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            },
            scope: this
        });
    };
    
    /**
     * Method: createOverlayLayers
     * creates all overlay layers, adds them to the map
     *
     * Parameters:
     * map - {OpenLayers.Map}
     */
    var createOverlayLayers = function(map) {
        
        var maplint = new OpenLayers.Layer.OSM.Maplint("Maplint", {
            displayInLayerSwitcher: false
        });
        
        refreshStrategy = new OpenLayers.Strategy.Refresh({
            interval: 5*60*1000, // 5 minutes
            force: true
        });
        
        // transition resolution between raster/vectors
        var transitionResolution = 156543.0339/(Math.pow(2, App.config.minZoomlevelForVectors));

        tiles = new OpenLayers.Layer.Vector(OpenLayers.i18n("layer.tiles.vector"), {
            displayInLayerSwitcher: false,
            protocol: new OpenLayers.Protocol.HTTP({
                url: 'tiles',
                params: {
                    // for a lighter, quicker response
                    'no_geom': true
                },
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [
                new OpenLayers.Strategy.BBOX({
                    ratio: 1.2
                }),
                refreshStrategy
            ],
            eventListeners: {
                // to speed up api read calls, no_geom has been added.
                "beforefeaturesadded": function(cfg) {
                    // we need to build geometry from bbox
                    Ext.each(cfg.features, function(f) {
                        f.geometry = f.bounds.toGeometry();
                    });
                },
                "featuresadded": function() {
                    // FIXME with events ... this breaks our rule of maximum independance between modules
                    var feature, featureId = App.DisplayZone.getSelectedId(); 
                    if (featureId === null) {
                        return;
                    }
                    // TODO: not efficient (use a featureStore ?)
                    for(var i=0, len=tiles.features.length; i<len; ++i) {
                        if(tiles.features[i].fid == featureId) {
                            feature = tiles.features[i];
                            break;
                        }
                    }
                    if (feature) {
                        sfControl.select(feature);
                    }
                }
            },
            styleMap: getStyleMap(),
            alwaysInRange: false,
            maxResolution: transitionResolution
        });
        
        refreshStrategy.activate();
        
        raster_tiles = new OpenLayers.Layer.WMS(OpenLayers.i18n("layer.tiles.raster"), '../mapserv/?', {
            layers: 'tiles',
            format: 'image/png',
            TAG: App.config.defaultTag
        }, {
            isBaseLayer: false,
            singleTile: false,
            maxResolution: 156543.0339/(Math.pow(2, 9)), // we need to setup tilecache for lower zoom levels
            buffer: 0,
            tileSize: new OpenLayers.Size(512, 512),
            visibility: true,
            displayInLayerSwitcher: false,
            opacity: 0.3
        });
        
        var attrString = '<a href="http://www.brest.fr">Brest Métropole Océane</a>';
        var ortho_bmo = new OpenLayers.Layer.WMS("BMO 2004", 'http://bmo.openstreetmap.fr/wms', {
            layers: 'ortho',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)),
            attribution: attrString,
            displayInLayerSwitcher: false,
            transitionEffect: 'resize'
        });
        
        attrString = '<a href="http://www.geolittoral.equipement.gouv.fr/">GeoLittoral</a>';
        var ortho_littorale = new OpenLayers.Layer.WMS("GeoLittoral 2000", 'http://bmo.openstreetmap.fr/wms', {
            layers: 'ortholittorale',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)),
            attribution: attrString,
            displayInLayerSwitcher: false,
            transitionEffect: 'resize'
        });
        
        attrString = '<a href="http://carto.craig.fr">CRAIG/TopoGEODIS</a>';
        var ortho_craig = new OpenLayers.Layer.WMS("CRAIG 2009", 'http://wms.craig.fr/osm', {
            layers: 'departements',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)),
            attribution: attrString,
            displayInLayerSwitcher: false,
            transitionEffect: 'resize'
        });
        
        attrString = '<a href="http://www.ville-grasse.fr/">Ville de Grasse</a>';
        var ortho_grasse = new OpenLayers.Layer.WMS("Grasse", 'http://maps.qualitystreetmap.org/grasse?', {
            layers: 'ortho',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)),
            attribution: attrString,
            displayInLayerSwitcher: false,
            transitionEffect: 'resize'
        });
        
        tiles.events.on({
            "featureselected": function(e) {
                observable.fireEvent("tileedit", {
                    feature: e.feature
                }); 
                hfControl.deactivate();
            },
            "featureunselected": function(e) {
                observable.fireEvent("tileundisplay", {
                    feature: e.feature
                }); 
                hfControl.activate();
            },
            scope: this
        });
        
        map.addLayers([ortho_bmo, ortho_littorale, ortho_craig, ortho_grasse, maplint, raster_tiles, tiles]);
        
        var p = new OpenLayers.Control.Panel();
        p.addControls([
            new OpenLayers.Control.MenuButton(
                OpenLayers.i18n("layer.menu.baselayers"), 
                new OpenLayers.Control.BaseLayerSelector({
                    layers: map.getLayersBy('isBaseLayer', true)
                })
            ),/*
            new OpenLayers.Control.MenuButton(
                OpenLayers.i18n("layer.menu.lint"), // 'Lint',
                new OpenLayers.Control.OverlayLayerSelector({
                    layers: [maplint]
                })
            ),*/
            new OpenLayers.Control.MenuButton(
                'WMS',
                new OpenLayers.Control.OverlayLayerSelector({
                    layers: [ortho_bmo, ortho_littorale, ortho_craig, ortho_grasse]
                })
            ),
            new OpenLayers.Control.MenuButton(
                OpenLayers.i18n("layer.menu.tiles"), // 'Tiles'
                new OpenLayers.Control.OverlayLayerSelector({
                    layers: [tiles, raster_tiles]
                })
            )
        ]);
        map.addControl(p);
    };
    
    /**
     * Method: getBaseLayers
     * Returns the list of base layers.
     *
     * Returns:
     * {Array({OpenLayers.Layer})} An array of OpenLayers.Layer objects.
     */
    var getBaseLayers = function() {
        return [
            new OpenLayers.Layer.OSM.Mapnik("Mapnik"), 
            new OpenLayers.Layer.OSM.Osmarender("Osmarender"), 
            new OpenLayers.Layer.OSM.CycleMap("Cycle Map")
        ];
    };

    /**
     * Method: createMap
     *
     * Returns:
     * {OpenLayers.Map} The map object with controls and layers added
     */
    var createMap = function() {
        var m = 20037508.34;
        map = new OpenLayers.Map({
            projection: new OpenLayers.Projection("EPSG:900913"),
            maxExtent: new OpenLayers.Bounds(-m, -m, m, m),
            units: "m",
            theme: null,
            layers: getBaseLayers(),
            controls: []
        });
        createOverlayLayers(map);
        map.addControls(getControls());
        return map;
    };

    /**
     * Method: createTools
     * Creates the Tools container.
     */
    var createTools = function() {
        App.Tools.getPanel();
        App.Tools.events.on({
            "tagchanged": function(tag) {
                tiles.styleMap = getStyleMap(tag);
                tiles.redraw();
                raster_tiles.params['TAG'] = tag;
                raster_tiles.redraw();
            },
            "refresh": function() {
                refreshStrategy.refresh();
                raster_tiles.redraw();
            },
            scope: this
        });
    };
    
    /*
     * Public
     */
    return {
        
        /*
         * Observable object
         */
        events: observable,
        
        /**
         * APIMethod: persist
         * Calls protocol.commit for the given feature
         *
         * Parameters:
         * feature - {OpenLayers.Feature.Vector}
         */
        persist: function(feature) {
            persist(feature);
        },
    
        /**
         * APIMethod: getMapPanel
         * Creates the map panel.
         *
         * Parameters:
         * options - {Object} Options passed to the {GeoExt.MapPanel}.
         *
         * Returns:
         * {GeoExt.MapPanel} the map panel
         */
        getMapPanel: function(options) {
            if (!mapPanel) {
                mapPanel = new GeoExt.MapPanel(Ext.apply({
                    map: createMap(),
                    stateId: "map",
                    prettyStateKeys: true
                }, options));
                
                createTools();
            }
            return mapPanel;
        },
    
        /**
         * APIMethod: zoomTo
         * Zoom to a feature
         *
         * Parameters:
         * config - {Object} hash with a 'feature' property 
         */
        zoomTo: function(config) {
            if (config.feature) {
                map.zoomToExtent(config.feature.geometry.getBounds());
            }
        },
    
        /**
         * APIMethod: unselectFeature
         * unselects a feature
         *
         * Parameters:
         * feature - {OpenLayers.Feature.Vector}
         */
        unselectFeature: function(feature) {
            sfControl.unselect(feature);
        }
    };
})();
