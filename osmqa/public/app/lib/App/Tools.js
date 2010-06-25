/*
 * @include GeoExt/widgets/Action.js
 * @include App/Permalink.js
 * @include App/config.js
 */

Ext.namespace('App');

/**
 * Constructor: App.Tools
 * Creates an {Ext.Toolbar} with tools. Use the "toolbar" property
 * to get a reference to the toolbar.
 *
 */
App.Tools = (function() {

    /*
     * Private
     */
    
    var panel = null;
    
    var observable = new Ext.util.Observable();
    observable.addEvents(
        /**
         * Event: tagchanged
         * Fires when the user selects a tag
         *
         * Listener arguments:
         * tag - {string} the selected tag string
         */
        "tagchanged"
    );
    
    var permalink = null;
    
    /**
     * Method: getItems
     * Return the toolbar items.
     *
     * Parameters:
     * map - {OpenLayers.Map} The map instance.
     *
     * Returns:
     * {Array} An array of toolbar items.
     */
    var getItems = function(map) {


        permalink = App.Permalink.getAction({
            text: "permalink"
        });
        
        var tagCombo = new Ext.form.ComboBox({
            name: 'tag',
            store: new Ext.data.SimpleStore({
                fields: ['value', 'text'],
                data : [
                    ['highway', 'highway'],
                    ['building', 'building'],
                    ['landuse', 'landuse']
                ]
            }),
            value: App.config.defaultTag,
            valueField: 'value',
            displayField:'text',
            editable: false,
            mode: 'local',
            tooltip: {
                title: 'Map selector',
                text: 'Choose the tag you want to map'
            },
            triggerAction: 'all',
            width: 70,
            listeners: {
                'select': function(v) {
                    observable.fireEvent("tagchanged", v.value);
                },
                scope: this
            }
        });
        
        var refresh = new Ext.Button({
            text: 'refresh',
            tooltip: OpenLayers.i18n("Tools.refreshtooltip"), // FIXME
            //iconCls: 'mapRefresh', // FIXME
            listeners: {
                'click': function(v) {
                    observable.fireEvent("refresh");
                },
                scope: this
            }
        });
        
        return [{
            layout: 'fit',
            xtype: 'container',
            width: 80,
            items: [tagCombo]
        }, {
            layout: 'fit',
            xtype: 'container',
            cls: 'pad-left',
            width: 50,
            items: [refresh]
        }];//, {xtype: 'button', action: permalink}];
    };

    /*
     * Public
     */
    return {
        
        // our observable
        events: observable,

        getPanel: function(options) {
            if (!panel) {
                
                App.Permalink.init(); // FIXME: find a better place
                
                panel = new Ext.Container(Ext.apply({
                    renderTo: 'containerpanel',
                    width: 136,
                    height: 50,
                    layout: 'border',
                    defaults: {
                        border: false
                    },
                    items: [{
                        region: 'north',
                        xtype: 'container',
                        cls: 'pad-bot',
                        html: '<span>Quality Grid</span>'
                    },{
                        region: 'center',
                        xtype: 'container',
                        layout: 'column',
                        defaults: {
                            border: false
                        },
                        items: getItems() 
                    }]
                }, options));
            }
            return panel;
        }
    };
})();
