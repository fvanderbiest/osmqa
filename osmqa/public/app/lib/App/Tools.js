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

    /**
     * Property: panel
     * The {Ext.Container} instance. 
     */
    var panel = null;

    /**
     * Property: observable
     * The {Ext.util.Observable} instance, which enables us to trigger events.
     * (see events listing below)
     */
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
        
        var tags = App.config.tags.sort(), l = tags.length, data = new Array(l);
        for (var i=0;i<l;i++) {
            data[i] = [tags[i], tags[i]];
        }
        
        var tagCombo = new Ext.form.ComboBox({
            name: 'tag',
            store: new Ext.data.SimpleStore({
                fields: ['value', 'text'],
                data: data
            }),
            value: App.config.defaultTag,
            valueField: 'value',
            displayField:'text',
            editable: false,
            mode: 'local',
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
            text: OpenLayers.i18n("btn.refresh.text"),
            tooltip: OpenLayers.i18n("btn.refresh.tooltip"),
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
            width: 75,
            items: [refresh]
        }];
    };

    /*
     * Public
     */
    return {
        
        /*
         * Observable object
         */
        events: observable,
        
        /**
         * APIMethod: getPanel
         * Returns the "tools" container
         *
         * Parameters:
         * options - {Object} Extra options passed to the container
         *
         * Returns:
         * {Ext.Container} the tools container
         */
        getPanel: function(options) {
            if (!panel) {
                panel = new Ext.Container(Ext.apply({
                    renderTo: 'containerpanel',
                    width: 155,
                    height: 50,
                    layout: 'border',
                    defaults: {
                        border: false
                    },
                    items: [{
                        region: 'north',
                        xtype: 'container',
                        cls: 'pad-bot',
                        html: '<span>'+OpenLayers.i18n("app.title")+'</span>'
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
