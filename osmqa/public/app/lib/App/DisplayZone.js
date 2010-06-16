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
    this.display = function(feature) {
        
        if (timer) {
            window.clearTimeout(timer);
        }
        
        if (feature === highlightedFeature) {
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
                    handler: function() {
                        // todo
                    }
                },'->',{
                    text: "All OK",
                    iconCls: 'allok',
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
        }
        this.panel.layout.setActiveItem('propGrid');
    };
    
    // edit function : once a tile has been clicked, display edit controls in displayZone
    this.edit = function(feature) {
        /*
        if (feature === highlightedFeature) {
            return;
        }
        highlightedFeature = feature;
        
        var combo = {
            xtype: "combo",
            store: new Ext.data.ArrayStore({
                fields: ['value', 'display'],
                data: [['false', 'NOK'], ['true', 'OK']]
            }),
            displayField: 'display',
            valueField: 'value',
            mode: 'local',
            editable: false,
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus: true
        };
        
        var store = new GeoExt.data.AttributeStore({
            feature: feature,
            fields: ["highway","building","landuse"],
            data: [{
                name: "highway",
                label: "Highway",
                type: combo,
                value: feature.data["highway"]
            }, {
                name: "building",
                label: "Building",
                type: combo,
                value: feature.data["building"]
            },{
                name: "landuse",
                label: "Landuse",
                type: combo,
                value: feature.data["landuse"]
            }]
        });
        
        var propGrid = new Ext.grid.PropertyGrid({
            store: store,
            id: 'propGrid'//,
            //title: 'Properties'
        });
        
        //var displayZone = Ext.getCmp('displayZone'); // FIXME : use events
        //console.log(displayZone);
        if (this.panel.getComponent('propGrid')) {
            this.panel.layout.setActiveItem('def');
            this.panel.remove('propGrid', true);
        }
        this.panel.add(propGrid);
        this.panel.layout.setActiveItem('propGrid');
        */
    };
};
