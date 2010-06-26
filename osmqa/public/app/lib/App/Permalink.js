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
     * Property: permalinkTextField
     * {Ext.form.TextField} The permalink text field.
     */
    var permalinkTextField = null;
    
    
    /**
     * Property: permalinkWindow
     * {Ext.Window} The permalink window.
     */
    var permalinkWindow = null;

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
        
        init: function() {
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
