/*
 * @include GeoExt/data/AttributeStore.js
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

    
    var updateCurrentFeature = function(attrs) {
        Ext.apply(editedFeature.attributes, attrs);
        editedFeature.state = OpenLayers.State.UPDATE;
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
    
    var createGrid = function(feature) {
        return new Ext.grid.PropertyGrid({
            id: 'propGrid',
            //trackMouseOver: true,
            customRenderers: {
                "highway": getRenderer(),
                "building": getRenderer(),
                "landuse": getRenderer()
            },
            source: feature.attributes
        });
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
            html: "<p>Here come the tags</p>"
        }]
    }, options);
    this.panel = new Ext.Panel(options);
    
    // clear current tile tags display
    this.clear = function(feature) {
        highlightedFeature = null;
        //editedFeature = null;
        propGrid.setSource({
            "highway": null,
            "building": null,
            "landuse": null
        });
    };
    
    this.edit = function(feature) {
        editedFeature = feature;
        if (!editGrid) {
            editGrid = new Ext.grid.PropertyGrid({
                id: 'editGrid',
                trackMouseOver: true,
                customRenderers: {
                    "highway": getRenderer(),
                    "building": getRenderer(),
                    "landuse": getRenderer()
                },
                source: feature.attributes,
                listeners: {
                    "beforepropertychange": function(source, recordId, value, oldValue) {
                        var attrs = {};
                        attrs[recordId] = value;
                        updateCurrentFeature(attrs);
                        //return false; // to cancel edit (TODO in case of pbs persisting)
                    }
                },
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
            });
            this.panel.add(editGrid);
        } else {
            editGrid.setSource(feature.attributes);
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
            propGrid = createGrid(feature);
            this.panel.add(propGrid);
        } else {
            propGrid.setSource(feature.attributes);
        }
        
        this.panel.layout.setActiveItem('propGrid');
    };

};
