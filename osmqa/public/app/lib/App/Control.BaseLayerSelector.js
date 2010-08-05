/*
 * @requires OpenLayers/Control/LayerSelector.js
 */

OpenLayers.Control.BaseLayerSelector = OpenLayers.Class(OpenLayers.Control.LayerSelector, {

    /**
     * Method:
     * Create tag with label and checkbox
     *
     * Parameters:
     * - {<OpenLayers.Layer>} A OpenLayers Layer
     *
     * Returns:
     * - {element}
     */
    createInput: function(layer) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('name', this.id);

        label.appendChild(input);
        label.appendChild(document.createTextNode(layer.name));
        
        if (layer.getVisibility()) {
            input.checked = true;
        }

        return label;
    },

    /**
     * Method:
     * A label has been clicked, check or uncheck its corresponding input
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     *  - {DOMElement} input
     *  - {<OpenLayers.Control.LayerSelector>} layerSelector
     *  - {<OpenLayers.Layer>} layer
     */
    onInputClick: function(e) {
        var chk = this.input.childNodes[0];
        if (!chk.checked) {
            chk.checked = true;
            this.layer.map.setBaseLayer(this.layer);
        }
        OpenLayers.Event.stop(e);
    },

    CLASS_NAME: "OpenLayers.Control.BaseLayerSelector"

});
