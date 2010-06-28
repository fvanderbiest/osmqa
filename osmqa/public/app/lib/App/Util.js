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

Ext.namespace("App");

/**
 * Module: App.Util
 * A utility module 
 */
App.Util = (function() {
    /*
     * Private
     */

    
    /*
     * Public
     */
    return {

        /**
         * Method: round
         * Rounds input var to x decimals
         *
         * Parameters:
         * input - {float} 
         * decimals - {integer}
         *
         * Returns:
         * {float}
         */
        round: function(input, decimals) {
            var p = Math.pow(10, decimals);
            return Math.round(input*p)/p;
        }

    };
})();