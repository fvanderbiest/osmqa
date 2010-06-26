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
 * @include OpenLayers/Control/LoadingPanel.js
 * @include OpenLayers/Control/PanZoom.js
 * @include OpenLayers/Control/ArgParser.js
 * @include OpenLayers/Control/Attribution.js
 * @include OpenLayers/Control/ScaleLine.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include GeoExt/widgets/MapPanel.js
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
     * APIProperty: mapPanel
     * The {GeoExt.MapPanel} instance.
     */
    var mapPanel = null;
    
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
    
    
    var selected = null;
    
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
            toggle: true
        });
        sfControl.handlers.feature.stopDown = false;
        
        // highlight feature control
        hfControl = new OpenLayers.Control.SelectFeature(tiles, {
            hover: true,
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
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.LoadingPanel({div: $('loading')}),
            new OpenLayers.Control.ScaleLine(), 
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
        // FIXME: might need to require some JS dependency ? (for build process)
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
                        msg: OpenLayers.i18n("dialog.error.save.msg"),
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
     * Method: getLayers
     * Returns the list of layers.
     *
     * Returns:
     * {Array({OpenLayers.Layer})} An array of OpenLayers.Layer objects.
     */
    var getLayers = function() {
        
        var mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");
        var osmarender = new OpenLayers.Layer.OSM.Osmarender("Osmarender");
        var cyclemap = new OpenLayers.Layer.OSM.CycleMap("Cycle Map");
        var maplint = new OpenLayers.Layer.OSM.Maplint("Maplint");
        
        refreshStrategy = new OpenLayers.Strategy.Refresh({
            interval: 5*60*1000, // 5 minutes
            force: true
        });
        
        // TODO: config for z=12 transition raster/vector
        var transitionResolution = 156543.0339/(Math.pow(2, 12));
            
        tiles = new OpenLayers.Layer.Vector(OpenLayers.i18n("layer.tiles.vector"), {
            protocol: new OpenLayers.Protocol.HTTP({
                url: 'tiles',
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [
                new OpenLayers.Strategy.BBOX(),
                refreshStrategy
            ],
            eventListeners: {
                "featuresadded": function() {
                    // FIXME with events ... this breaks our rule of most independance between modules
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
            singleTile: true,
            ratio: 1.2,
            visibility: true,
            //displayInLayerSwitcher: true
            opacity: 0.3,
            //alwaysInRange: false,
            //minResolution: transitionResolution, 
            transitionEffect: 'resize'
        });
        
        var attrString = '<a href="http://www.brest.fr">Brest Métropole Océane</a>';
        var ortho_bmo = new OpenLayers.Layer.WMS("Ortho BMO 2004 @20cm", 'http://bmo.openstreetmap.fr/wms', {
            layers: 'ortho',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)), // z=15
            attribution: attrString,
            transitionEffect: 'resize'
        });
        
        attrString = '<a href="http://www.geolittoral.equipement.gouv.fr/">GeoLittoral</a>';
        var ortho_littorale = new OpenLayers.Layer.WMS("Ortho Littorale 2004 @50cm", 'http://bmo.openstreetmap.fr/wms', {
            layers: 'ortholittorale',
            format: 'image/jpeg'
        }, {
            isBaseLayer: false,
            buffer: 0,
            visibility: false,
            opacity: 0.5,
            alwaysInRange: false,
            maxResolution: 156543.0339/(Math.pow(2, 15)), // z=15
            attribution: attrString,
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
        
        return [mapnik, osmarender, cyclemap, ortho_bmo, ortho_littorale, maplint, raster_tiles, tiles];
    };

    
    var createMap = function() {
        // create map
        var m = 20037508.34;
        map = new OpenLayers.Map({
            projection: new OpenLayers.Projection("EPSG:900913"),
            maxExtent: new OpenLayers.Bounds(-m, -m, m, m),
            units: "m",
            theme: null,
            controls: []
        });
        map.addLayers(getLayers());
        map.addControls(getControls());

        // FIXME:
        sfControl.activate();
        hfControl.activate();
        
        return map;
    };
    
    var createTools = function() {
        var win = App.Tools.getPanel();
        
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
        
        win.show();
    };
    
    /*
     * Public
     */
    return {
        
        // our observable
        events: observable,

        // call protocol.commit for the given feature
        persist: function(feature) {
            persist(feature);
        },
    
        /**
         * Parameters:
         * options - {Object} Options passed to the {GeoExt.MapPanel}.
         */
        getMapPanel: function(options) {
            if (!mapPanel) {
                mapPanel = new GeoExt.MapPanel(Ext.apply({
                    map: createMap(),
                    //tbar: createTools(),
                    stateId: "map",
                    prettyStateKeys: true
                }, options));
                
                createTools();
            }
            return mapPanel;
        },
        
        zoomTo: function(config) {
            if (config.feature) {
                map.zoomToExtent(config.feature.geometry.getBounds());
            }
        },
        
        unselectFeature: function(feature) {
            sfControl.unselect(feature);
        }
    
    };
})();
