/*
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include App/Permalink.js
 */

Ext.namespace('App');

/**
 * Module: App.LayerTree
 * Creates a layer tree, i.e. an {Ext.tree.TreePanel} configured with
 * a {GeoExt.tree.LayerContainer}. 
 *
 */
App.LayerTree = (function() {
    /*
     * Private
     */
    
    /**
     * Property: layerTreePanel
     * {Ext.tree.TreePanel} The layer tree panel.
     */
    var layerTreePanel = null;
    
    /*
     * Public
     */
    return {

        /* APIMethod: getPanel
         *
         * Parameters:
         * layerStore - {GeoExt.data.LayerStore} The layer store this layer
         *     tree is connected to.
         * options - {Object} Extra options to pass to the {Ext.tree.TreePanel}
         */
        getPanel: function(layerStore, options) {
            if (!layerTreePanel) {
                App.Permalink.init();
                var permalink = App.Permalink.getAction({
                    text: "permalink"
                });
                layerTreePanel = new Ext.tree.TreePanel(Ext.apply({
                    root: new GeoExt.tree.LayerContainer({
                        layerStore: layerStore,
                        leaf: false,
                        expanded: true
                    }),
                    buttons: [new Ext.Button(permalink),{
                        text: 'Add WMS layers',
                        handler: function() {
                            alert('To do...');
                        }
                    }],
                    enableDD: true
                }, options));
            }
            return layerTreePanel;
        }
        
    };
})();
