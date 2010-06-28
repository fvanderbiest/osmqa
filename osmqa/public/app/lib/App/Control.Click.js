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
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Click.js
 */

Ext.namespace('App.Control');

/*
 * A control for handling clicks on the map
 */
App.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     */
    autoActivate: true,
    
    defaultHandlerOptions: {
        'single': true,
        'double': true,
        'stopSingle': false,
        'stopDouble': false
    },
    
    onClick: function(e){},
    onDblclick: function(e){},  

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            this.defaultHandlerOptions, options.handlerOptions 
        ); 
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        ); 
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.onClick,
                'dblclick': this.onDblclick 
            }, this.handlerOptions
        );
    },
    
    destroy: function() {
        this.handler = null;
        this.handlerOptions = null;
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },

    CLASS_NAME: "App.Control.Click"
});