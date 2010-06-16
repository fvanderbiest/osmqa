/*
 * @include App/Map.js
 * @include App/LayerTree.js
 * @include App/Print.js
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
    OpenLayers.Lang.setCode(OpenLayers.Util.getParameters().lang || "fr");
    OpenLayers.Number.thousandsSeparator = ' ';
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;

    /*
     * Setting of Ext global vars.
     */
    Ext.QuickTips.init();

    /*
     * Initialize the application.
     */
    
    var Map = (new App.Map({
        region: "center"
    }));

    /*
    var headerPanel = new Ext.Panel({
        region: 'north',
        height: 100,
        contentEl: 'header'
    });
    */
    
    var layerTreePanel = (new App.LayerTree(Map.mapPanel.layers, {
        title: OpenLayers.i18n("layertree"),
        region: 'north'
    })).layerTreePanel;

    /*
    var printPanel = (new App.Print(mapPanel, {
        title: OpenLayers.i18n("print"),
        labelAlign: 'top',
        defaults: {
            anchor:'100%'
        }
    })).printPanel;
    */
    
    var displayZone = (new App.DisplayZone({
        title: OpenLayers.i18n("tags"),
        region: 'center'
    }));
    
    // We're acting as a mediator between modules:
    Map.events.on({
        "featurehighlighted": function(feature) {
            displayZone.display(feature);
        }
    });
    
    
    // the viewport
    new Ext.Viewport({
        layout: "border",
        items: [
            //headerPanel,
            Map.mapPanel,
            { 
                region: "east",
                layout: "border",
                width: 300,
                minWidth: 300,
                maxWidth: 400,
                split: true,
                collapseMode: "mini",
                border: false,
                defaults: {
                    autoScroll: true,
                    bodyCssClass: 'app-accordion-body'
                },
                items: [layerTreePanel, displayZone.panel] //, printPanel]
            }
        ]
    });
    
    Map.mapPanel.map.zoomToExtent(new OpenLayers.Bounds(-556461,6143587,-446850,6191896));
};
