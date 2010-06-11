/*
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/Util.js
 * @include OpenLayers/Layer/XYZ.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Protocol/HTTP.js
 * @requires OpenLayers/Strategy.js
 * @include OpenLayers/Strategy/Refresh.js
 * @include OpenLayers/Strategy/BBOX.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include OpenLayers/Control/Navigation.js
 * @include OpenLayers/Control/PanZoom.js
 * @include OpenLayers/Control/ArgParser.js
 * @include OpenLayers/Control/Attribution.js
 * @include OpenLayers/Control/ScaleLine.js
 * @include OpenLayers/Control/OverviewMap.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Popup.js
 * @include App/Tools.js
 * @include App/config.js
 */

Ext.namespace('App');

/**
 * Constructor: App.Map
 * Creates a {GeoExt.MapPanel} internally. Use the "mapPanel" property
 * to get a reference to the map panel.
 *
 * Parameters:
 * options - {Object} Options passed to the {GeoExt.MapPanel}.
 */
App.Map = function(options) {

    // Private    
    
    /**
     * Property: sfControl
     * {OpenLayers.Control.SelectFeature} the control used to select tiles
     */
    var sfControl = null;
    
    /**
     * Property: sfControl
     * {OpenLayers.Layer.Vector} the vector layer used to display tiles
     */
    var tiles = null;
    
    /**
     * Property: raster_tiles
     * {OpenLayers.Layer.WMS} the WMS layer used to display tiles
     */
    var raster_tiles = null;
    
    /**
     * Property: popup
     * {GeoExt.Popup} our unique popup (if any)
     */
    var popup = null;
    
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
            fillColor: "${getColor}", 
            fillOpacity: 0, //"${getOpacity}",
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
                    if (feature.attributes[tag] === true) {
                        return 0;
                    }
                    return 1;	
                },
                getColor: function(feature) {							
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
     * Returns the list of added controls
     *
     * Returns:
     * {Array({OpenLayers.Control})} An array of OpenLayers.Control objects.
     */
    var getControls = function() {
        
        sfControl = new OpenLayers.Control.SelectFeature(tiles, {
        });
        sfControl.handlers.feature.stopDown = false;
        
        return [new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.ScaleLine(), sfControl];
    };
    
    /**
     * Method: round
     * Rounds input var to x decimals
     *
     * Parameters:
     * input - {float} 
     * decimals - {integer}
     *
     * Returns:
     * {float}
     */
    var round = function(input, decimals) { // TODO: util namespace
        var p = Math.pow(10, decimals);
        return Math.round(input*p)/p;
    };
    
    /**
     * Method: createMarkup
     * Creates the html string with the RemoteControl stuff
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the feature on which to open a popup
     *
     * Returns:
     * {String} our string
     */
    var createMarkup = function(feature) {
        var base = 'http://127.0.0.1:8111/load_and_zoom?'; // TODO: config
        var geom = feature.geometry.clone();
        geom.transform(
            new OpenLayers.Projection("EPSG:900913"), 
            new OpenLayers.Projection("EPSG:4326"));
        var bounds = geom.getBounds();
        var link = base + OpenLayers.Util.getParameterString({
            left: round(bounds.left,5),
            bottom: round(bounds.bottom,5),
            right: round(bounds.right,5),
            top: round(bounds.top,5)
        });
        var post = '(avec le plugin '+
        '<a href="http://wiki.openstreetmap.org/wiki/JOSM/Plugins/RemoteControl"'+
        ' target="_blank">RemoteControl</a>)';
        return '<a href="'+link+'" target="_blank">Editer cette zone dans JOSM</a><br />'+post;
    };
    
    /**
     * Method: createItems
     * Creates the ExtJS items inside the popup 
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the feature on which to open a popup
     *
     * Returns:
     * {Array({Object})} An array of xtype'd objects.
     */
    var createItems = function(feature) {
        // TODO: create gridPanel with combos for fields
        // + button "all checked"
        return [{
            xtype: 'box',
            html: createMarkup(feature)
        }]
    };
    
    /**
     * Method: displayPopup
     * 
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the feature on which to open a popup
     */
    var displayPopup = function(feature) {
        if (popup) {
            popup.close();
        }
        popup = new GeoExt.Popup({
            title: 'Informations',
            feature: feature,
            width:200,
            // FIXME: layout ?
            items: createItems(feature),
            maximizable: false,
            collapsible: false,
            unpinnable: false
        });
        popup.on({
            close: function() {
                if(OpenLayers.Util.indexOf(tiles.selectedFeatures,
                                           this.feature) > -1) {
                    sfControl.unselect(this.feature);
                }
            }
        });
        popup.show();
    };
    
    /**
     * Method: getLayers
     * Returns the list of layers.
     *
     * Returns:
     * {Array({OpenLayers.Layer})} An array of OpenLayers.Layer objects.
     */
    var getLayers = function() {
        var osm = new OpenLayers.Layer.OSM();
        
        refreshStrategy = new OpenLayers.Strategy.Refresh({
            interval: 5*60*1000, // 5 minutes
            force: true
        });
        
        var transitionResolution = 156543.0339/(Math.pow(2, 12));
        
        tiles = new OpenLayers.Layer.Vector('tiles', {
            protocol: new OpenLayers.Protocol.HTTP({
                url: 'tiles',
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [
                new OpenLayers.Strategy.BBOX(),
                refreshStrategy
            ],
            styleMap: getStyleMap(),
            alwaysInRange: false,
            maxResolution: transitionResolution
        });
        
        refreshStrategy.activate();
        
        raster_tiles = new OpenLayers.Layer.WMS("Raster tiles", '../mapserv/?', {
            layers: 'tiles',
            format: 'image/png',
            TAG: App.config.defaultTag
        }, {
            isBaseLayer: false,
            singleTile: true,
            ratio: 1.2,
            visibility: true, // FIXME
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
                displayPopup(e.feature);
            },
            scope: this
        });
        
        return [osm, ortho_bmo, ortho_littorale, raster_tiles, tiles];
    };

    // Public

    Ext.apply(this, {

        /**
         * APIProperty: mapPanel
         * The {GeoExt.MapPanel} instance. Read-only.
         */
        mapPanel: null
    });

    // Main

    // create map
    var mapOptions = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        maxExtent: new OpenLayers.Bounds(
            -20037508.34, 
            -20037508.34,
            20037508.34, 
            20037508.34
        ),
        units: "m",
        theme: null,
        controls: []
    };
    var map = new OpenLayers.Map(mapOptions);
    map.addLayers(getLayers());
    map.addControls(getControls());
    
    sfControl.activate();
    
    var tools = new App.Tools(map);
    tools.events.on({
        "tagchanged": function(tag) {
            tiles.styleMap = getStyleMap(tag);
            tiles.redraw();
            raster_tiles.params['TAG'] = tag;
            raster_tiles.redraw();
        },
        "refresh": function() {
            refreshStrategy.refresh();
        },
        scope: this
    });
    
    // create map panel
    options = Ext.apply({
        map: map,
        tbar: tools.toolbar,
        stateId: "map",
        prettyStateKeys: true
    }, options);
    this.mapPanel = new GeoExt.MapPanel(options);
    
};
