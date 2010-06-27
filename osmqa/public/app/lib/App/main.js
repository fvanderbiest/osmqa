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
    OpenLayers.Lang.setCode(params.lang || "en");
    OpenLayers.Number.thousandsSeparator = ' ';
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

    /*
     * Setting of Ext global vars.
     */
    Ext.QuickTips.init();

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
    new Ext.Viewport({
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
                        region: 'center',
                        autoScroll: true
                    }), App.DisplayZone.getPanel({
                        height: 300,
                        region: 'south'
                    })
                ]
            }
        ]
    });
    
    var div = Ext.getCmp('mappanel').bwrap;
    div.appendChild($('tools'));
    div.appendChild($('loading'));
    $('loading').innerHTML = OpenLayers.i18n('loading');
    div.on('click', function() {
        if (mapPanel.map.getZoom() < App.config.minZoomlevelForVectors) {
            Ext.Msg.show({
                title: OpenLayers.i18n("dialog.info.clic.title"),
                msg: OpenLayers.i18n("dialog.info.clic.msg"),
                width: 400,
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.INFO
            });
        }
    });
    
    if (!(params.map_x && params.map_y && params.map_zoom)) {
        mapPanel.map.zoomToExtent(OpenLayers.Bounds.fromString(App.config.startupExtent));
    }
};
