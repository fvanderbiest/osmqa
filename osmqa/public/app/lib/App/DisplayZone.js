/*
 * @include GeoExt/data/AttributeStore.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Layer/SphericalMercator.js
 * @include OpenLayers/Util.js
 * @include App/Util.js
 */

Ext.namespace('App');

/**
 * Constructor: App.DisplayZone
 *
 * Parameters:
 * options - {Object} Options passed to the {GeoExt.MapPanel}.
 */
App.DisplayZone = function(options) {

    // Private
    var observable = new Ext.util.Observable();
    observable.addEvents(
        /**
         * Event: commit
         * Fires when we need to save a feature
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "commit"
    );
    
    /**
     * Property: highlightedFeature
     * {OpenLayers.Feature.Vector} the currently highlighted feature
     */
    var highlightedFeature = null;
    
    var propGrid = null;
    var editGrid = null;
    var gridRenderer = null;
    
    /**
     * Property: editedFeature
     * {OpenLayers.Feature.Vector} the currently edited feature
     */
    var editedFeature = null;

    var removeReservedTags = function (attrs) {
        var a = Ext.apply({}, attrs);
        delete a.reserved;
        return a;
    };
    
    var updateCurrentFeature = function(attrs) {
        Ext.apply(editedFeature.attributes, attrs);
        //editedFeature.state = OpenLayers.State.UPDATE;
        observable.fireEvent("commit", {
            feature: editedFeature
        });
    };
    
    var getRenderer = function() {
        if (!gridRenderer) {
            gridRenderer = function(v){
                if(v){
                    return '<span style="color: green;">true</span>';
                }else{
                    return '<span style="color: red;">false</span>';
                }
            };
        }
        return gridRenderer;
    };
    
    var createGrid = function(feature, options) {
        return Ext.apply({
            id: 'propGrid',
            xtype: 'propertygrid',
            title: 'Tile #'+feature.fid,
            trackMouseOver: true,
            customRenderers: {
                "highway": getRenderer(),
                "building": getRenderer(),
                "landuse": getRenderer()
            },
            source: removeReservedTags(feature.attributes)
        }, options);
    };

    // Public

    Ext.apply(this, {

        /**
         * APIProperty: panel
         * The {Ext.Panel} instance. Read-only.
         */
        panel: null,
        
        // our observable
        events: null
    });

    // Main
    
    this.events = observable;
    
    // create panel
    options = Ext.apply({
        id:'displayZone',
        layout:'card',
        activeItem: 'def',
        defaults: {
            border:false
        },
        items: [{
            id: 'def',
            bodyStyle: 'padding:.5em;',
            html: "<p>Tile information will be displayed<br />in here...</p>"
        }]
    }, options);
    this.panel = new Ext.Panel(options);
    
    // clear current tile tags display
    this.clear = function(feature) {
        highlightedFeature = null;
        var newSource = {
            "highway": null,
            "building": null,
            "landuse": null
        };
        //editedFeature = null;
        propGrid.setSource(newSource);
        propGrid.setTitle('Tile');
        
        this.panel.layout.setActiveItem('def');
        /*
        if (editGrid) {
            editGrid.setSource(newSource);
        }*/
        // FIXME: bbar buttons stay
    };
    
    this.edit = function(feature) {
        editedFeature = feature;
        if (!editGrid) {
            editGrid = this.panel.add(createGrid(feature, {
                id: 'editGrid',
                listeners: {
                    "beforepropertychange": function(source, recordId, value, oldValue) {
                        var attrs = {};
                        attrs[recordId] = value;
                        updateCurrentFeature(attrs);
                        //return false; // to cancel edit (TODO in case of pbs persisting)
                    }
                },
                tbar: [{
                    text: "Reserve",
                    tooltip: "Mark this area as reserved (yellow lining when unselected). Then, start editing with next buttons",
                    ref: '../reserveButton',
                    //disabled: editedFeature.attributes['reserved'],
                    handler: function() {
                        // FIXME: we might need to check here if the feature is reserved before triggering the commit
                        updateCurrentFeature({
                            reserved: true
                        });
                        editGrid.unreserveButton.enable();
                        editGrid.reserveButton.disable();
                    },
                    scope: this
                },{
                    text: "JOSM",
                    tooltip: "Load this data in JOSM, with the remotecontrol plugin",
                    ref: '../josmButton',
                    handler: function() {
                        
                        var base = 'http://127.0.0.1:8111/load_and_zoom?'; // TODO: config
                        var geom = editedFeature.geometry.clone();
                        geom.transform(
                            new OpenLayers.Projection("EPSG:900913"), 
                            new OpenLayers.Projection("EPSG:4326"));
                        var bounds = geom.getBounds();
                        var link = base + OpenLayers.Util.getParameterString({
                            left: App.Util.round(bounds.left,5),
                            bottom: App.Util.round(bounds.bottom,5),
                            right: App.Util.round(bounds.right,5),
                            top: App.Util.round(bounds.top,5)
                        });
                        
                        window.open(link);                        
                        
                    },
                    scope: this
                },{
                    text: "Potlatch",
                    tooltip: "Load this data in Potlatch (new window)",
                    ref: '../potlatchButton',
                    handler: function() {
                        var base = 'http://www.openstreetmap.org/edit?'; // TODO: config
                        var geom = editedFeature.geometry.clone();
                        geom = geom.getBounds().getCenterLonLat();
                        geom.transform(
                            new OpenLayers.Projection("EPSG:900913"), 
                            new OpenLayers.Projection("EPSG:4326"));
                        var link = base + OpenLayers.Util.getParameterString({
                            lon: App.Util.round(geom.lon,5),
                            lat: App.Util.round(geom.lat,5),
                            zoom: 16
                        });
                        window.open(link);                        
                    },
                    scope: this
                },{
                    text: "Unreserve",
                    tooltip: "Mark this area as NOT reserved (when you're done with it)",
                    ref: '../unreserveButton',
                    //disabled: !editedFeature.attributes['reserved'],
                    handler: function() {
                        updateCurrentFeature({
                            reserved: false
                        });
                        //feature.attributes['reserved'] = true;
                        //persist(feature);
                        
                        editGrid.reserveButton.enable();
                        editGrid.unreserveButton.disable();
                    },
                    scope: this
                }],
                bbar: [{
                    text: "All NOK",
                    iconCls: 'allnok',
                    ref: '../allnokButton',
                    handler: function() {                        
                        var newSource = {
                            "highway": false,
                            "building": false,
                            "landuse": false,
                        };
                        editGrid.setSource(newSource);
                        updateCurrentFeature(newSource);
                    }
                },'->',{
                    text: "All OK",
                    iconCls: 'allok',
                    ref: '../allokButton',
                    handler: function() {
                        var newSource = {
                            "highway": true,
                            "building": true,
                            "landuse": true,
                        };
                        editGrid.setSource(newSource);
                        updateCurrentFeature(newSource);
                    }
                }]
            }));
            this.panel.doLayout();
        } else {
            editGrid.setSource(removeReservedTags(feature.attributes));
            editGrid.setTitle('Tile #'+feature.fid);
            
            
        }
        
        if (feature.attributes['reserved']) {
            editGrid.unreserveButton.enable();
            editGrid.reserveButton.disable();
        } else {
            editGrid.unreserveButton.disable();
            editGrid.reserveButton.enable();
        }
        
        this.panel.layout.setActiveItem('editGrid');
    };
    
    
    // Display method : display tags for tile feature
    this.display = function(feature) {

        if (feature === highlightedFeature) {
            return;
        }
        highlightedFeature = feature;
        
        if (!propGrid) {
            propGrid = this.panel.add(createGrid(feature, {
                trackMouseOver: false
            }));
            this.panel.doLayout();
        } else {
            propGrid.setSource(removeReservedTags(feature.attributes));
            propGrid.setTitle('Tile #'+feature.fid);
        }
        
        this.panel.layout.setActiveItem('propGrid');
    };

};
