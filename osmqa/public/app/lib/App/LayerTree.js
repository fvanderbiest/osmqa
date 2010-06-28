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
                    text: OpenLayers.i18n('layertree.btn.permalink')
                });
                layerTreePanel = new Ext.tree.TreePanel(Ext.apply({
                    root: new GeoExt.tree.LayerContainer({
                        layerStore: layerStore,
                        leaf: false,
                        expanded: true
                    }),
                    buttons: [new Ext.Button(permalink),{
                        text: OpenLayers.i18n('layertree.btn.addlayers'),
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
