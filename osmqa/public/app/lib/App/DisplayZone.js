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
    
    /**
     * Property: highlightedFeature
     * {OpenLayers.Feature.Vector} the currently highlighted feature
     */
    var highlightedFeature = null;
    
    var propGrid = null;
    
    var timer = null;

    // Public

    Ext.apply(this, {

        /**
         * APIProperty: panel
         * The {Ext.Panel} instance. Read-only.
         */
        panel: null
    });

    // Main
    
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
        propGrid.setSource({
            "highway": null,
            "building": null,
            "landuse": null
        });
        timer = window.setTimeout(function(p){
            p.layout.setActiveItem('def');
        }, 50, this.panel);
    };
    
    // Display method : display tags for tile feature
    this.display = function(feature, edit) {
        
        if (timer) {
            window.clearTimeout(timer);
        }
        
        if (feature === highlightedFeature) {
            if (edit) {
                propGrid && propGrid.allnokButton.enable();
                propGrid && propGrid.allokButton.enable();
            }
            return;
        }
        highlightedFeature = feature;
        
        if (!propGrid) {
            var renderer = function(v){
                if(v){
                    return '<span style="color: green;">OK</span>';
                }else{
                    return '<span style="color: red;">NOK</span>';
                }
            };
            // TODO: listeners sur la modification des valeurs pour répercuter sur feature
            propGrid = new Ext.grid.PropertyGrid({
                id: 'propGrid',
                customRenderers: {
                    "highway": renderer,
                    "building": renderer,
                    "landuse": renderer
                },
                source: {
                    "highway": feature.data["highway"],
                    "building": feature.data["building"],
                    "landuse": feature.data["landuse"]
                },
                bbar: [{
                    text: "All NOK",
                    iconCls: 'allnok',
                    disabled: !edit,
                    ref: '../allnokButton',
                    handler: function() {
                        // todo
                    }
                },'->',{
                    text: "All OK",
                    iconCls: 'allok',
                    disabled: !edit,
                    ref: '../allokButton',
                    handler: function() {
                        // todo
                    }
                }]
            });
            this.panel.add(propGrid);
            
        } else {
            propGrid.setSource({
                "highway": feature.data["highway"],
                "building": feature.data["building"],
                "landuse": feature.data["landuse"]
            });
            if (!edit) {
                propGrid.allnokButton.disable();
                propGrid.allokButton.disable();
            }
        }
        
        this.panel.layout.setActiveItem('propGrid');
    };

};
