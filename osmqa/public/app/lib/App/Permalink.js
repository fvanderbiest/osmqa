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

/**
 * @requires GeoExt/state/PermalinkProvider.js
 */

Ext.namespace('App');

/**
 * Module: App.Permalink
 * Creates an {Ext.Action} that opens a window displaying the map permalink.
 *
 */
App.Permalink = (function() {
    /*
     * Private
     */

    /**
     * Property: action
     * {Ext.Action} The permalink action. 
     */
    var action = null;
    
    /**
     * Property: permalinkWindow
     * {Ext.Window} The permalink window.
     */
    var permalinkWindow = null;
    
    /**
     * Property: permalinkTextField
     * {Ext.form.TextField} The permalink text field.
     */
    var permalinkTextField = null;

    /**
     * Method: showPermalink
     * Handler of the {Ext.Action}.
     */
    var showPermalink = function() {
        if (!permalinkWindow) {
            permalinkWindow = new Ext.Window({
                layout: 'fit',
                renderTo: Ext.getBody(),
                width: 400,
                closeAction: 'hide',
                plain: true,
                title: OpenLayers.i18n('dialog.permalink.title'),
                items: permalinkTextField,
                buttons: [{
                    text: OpenLayers.i18n('dialog.permalink.btn.open'),
                    handler: function() {
                        window.open(permalinkTextField.getValue());
                        permalinkWindow.hide();
                    }
                }, {
                    text: OpenLayers.i18n('dialog.btn.close'),
                    handler: function() {
                        permalinkWindow.hide();
                    }
                }]
            });
        }
        permalinkWindow.show();
    };

    /*
     * Public
     */
    return {
    
        /**
         * APIMethod: init
         * Inits the permalink
         */
        init: function() {
            if (!permalinkTextField) {
                permalinkTextField = new Ext.form.TextField({
                    hideLabel: true,
                    autoHeight: true,
                    listeners: {
                        'focus': function() {
                            this.selectText();
                        }
                    }
                });
            
                // Registers a statechange listener to update the value
                // of the permalink text field.
                Ext.state.Manager.getProvider().on({
                    statechange: function(provider) {
                        permalinkTextField.setValue(provider.getLink());
                    }
                });
            }
        },
        
        /**
         * APIMethod: getAction
         * Returns the permalink action
         *
         * Parameters:
         * options - {Object} extra options
         */
        getAction: function(options) {
            if (!action) {
                action = new Ext.Action(Ext.apply({
                    allowDepress: false,
                    handler: showPermalink
                }, options));
            }
            return action;
        }
    
    };
})();

/**
 * Creates the permalink provider.
 */
Ext.state.Manager.setProvider(
    new GeoExt.state.PermalinkProvider({encodeType: false})
);
