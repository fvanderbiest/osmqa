
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