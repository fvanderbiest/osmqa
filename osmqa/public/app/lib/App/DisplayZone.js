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
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Layer/SphericalMercator.js
 * @include OpenLayers/Util.js
 * @include App/Util.js
 * @include App/Permalink.js
 */

Ext.namespace('App');

/**
 * Module: App.DisplayZone
 * This module handles the vector tile display and edit panels
 */
App.DisplayZone = (function() {
    /*
     * Private
     */

    /**
     * Property: panel
     * The {Ext.Panel} instance. 
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
         * Event: commit
         * Fires when we need to save a feature
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "commit",
        
        /**
         * Event: zoomto
         * Fires when we need to zoom to a location
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "zoomto",
        
        /**
         * Event: unselect
         * Fires when we need to unselect a feature
         *
         * Listener arguments: Object with hash:
         * feature - {OpenLayers.Feature.Vector}
         */
        "unselect"
    );
    
    /**
     * Property: highlightedFeature
     * {OpenLayers.Feature.Vector} the currently highlighted feature
     */
    var highlightedFeature = null;
    
    /**
     * Property: editedFeature
     * {OpenLayers.Feature.Vector} the currently edited feature
     */
    var editedFeature = null;
    
    /**
     * Property: propGrid
     * {Ext.grid.PropertyGrid} the property grid used to display tile tags
     */
    var propGrid = null;
    
    /**
     * Property: editGrid
     * {Ext.grid.PropertyGrid} the grid used to edit tile tags
     */
    var editGrid = null;
    
    /**
     * Method: gridRenderer
     *
     * Parameters:
     * v - {Boolean} the tag value
     *
     * Returns:
     * {String} The HTML string to display to represent the tag value
     */
    var gridRenderer = function(v){
        if(v) {
            return '<span style="color: green;">true</span>';
        } else {
            return '<span style="color: red;">false</span>';
        }
    };
    
    /**
     * Method: removeReservedTags
     *
     * Parameters:
     * attrs - {Object} a feature attributes hash
     *
     * Returns:
     * {Object} A clone of the attributes hash, 
     *          in which special attributes have been removed
     *          (eg: reserved, and maybe other tags later)
     */
    var removeReservedTags = function (attrs) {
        var a = Ext.apply({}, attrs);
        delete a.reserved;
        return a;
    };
    
    /**
     * Method: updateCurrentFeature
     * Applies input hash to the currently edited feature's attributes
     * and make the feature persist by calling protocol.commit()
     *
     * Parameters:
     * attrs - {Object} attributes hash
     */
    var updateCurrentFeature = function(attrs) {
        Ext.apply(editedFeature.attributes, attrs);
        observable.fireEvent("commit", {
            feature: editedFeature
        });
    };
    
    /**
     * Method: getTitle
     * Formats a string based on a feature to display as panel's title
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} a feature
     *
     * Returns:
     * {String} the required string
     */
    var getTitle = function(feature) {
        var t = OpenLayers.i18n('displayzone.title.prefix') + ' #' + feature.fid ;
        t += (feature.attributes['reserved']) ? ' ('+OpenLayers.i18n('reserved')+')' : '';
        return t;
    };
    
    /**
     * Method: createTagHash
     * Utility method to create a hash with all available tags as keys
     * and input object as value
     *
     * Parameters:
     * value - {whatever} 
     *
     * Returns:
     * {Object} An object with all available OSM tag keys as keys
     */
    var createTagHash = function(value) {
        var tags = App.config.tags, out = {};
        for (var i=0, l=tags.length;i<l;i++) {
            out[tags[i]] = value;
        }
        return out;
    };
    
    /**
     * Method: createGrid
     * Creates a basic xtyped hash for property grid
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} a feature
     * options - {Object} extra options for the hash
     *
     * Returns:
     * {Object} xtyped property grid object
     */
    var createGrid = function(feature, options) {
        
        return Ext.apply({
            id: 'propGrid',
            xtype: 'propertygrid',
            title: getTitle(feature),
            trackMouseOver: true,
            stripeRows: true,
            customRenderers: createTagHash(gridRenderer),
            clicksToEdit: 'auto',
            source: removeReservedTags(feature.attributes)
        }, options);
    };
    
    /**
     * Method: WalkingPapersOpen
     * Opens WalkingPapers on the current tile area
     */
    var WalkingPapersOpen = function() {
        var base = 'http://walking-papers.org/?'; // TODO: config ?
        var geom = editedFeature.geometry.clone();
        geom = geom.getBounds().getCenterLonLat();
        geom.transform(
            new OpenLayers.Projection("EPSG:900913"), 
            new OpenLayers.Projection("EPSG:4326"));
        var link = base + OpenLayers.Util.getParameterString({
            lon: App.Util.round(geom.lon,5),
            lat: App.Util.round(geom.lat,5),
            zoom: 16
        });
        window.open(link+'#make');                        
    };
    
    /**
     * Method: potlatchOpen
     * Opens potlatch on the current tile area
     */
    var potlatchOpen = function() {
        var base = 'http://www.openstreetmap.org/edit?'; // TODO: config ?
        var geom = editedFeature.geometry.clone();
        geom = geom.getBounds().getCenterLonLat();
        geom.transform(
            new OpenLayers.Projection("EPSG:900913"), 
            new OpenLayers.Projection("EPSG:4326"));
        var link = base + OpenLayers.Util.getParameterString({
            lon: App.Util.round(geom.lon,5),
            lat: App.Util.round(geom.lat,5),
            zoom: 16
        });
        window.open(link);                        
    };
    
    /**
     * Method: JosmOpen
     * Opens JOSM on the current tile area
     */
    var JosmOpen = function() {
        var base = 'http://127.0.0.1:8111/load_and_zoom?'; // TODO: config ?
        var geom = editedFeature.geometry.clone();
        geom.transform(
            new OpenLayers.Projection("EPSG:900913"), 
            new OpenLayers.Projection("EPSG:4326"));
        var bounds = geom.getBounds();
        var link = base + OpenLayers.Util.getParameterString({
            left: App.Util.round(bounds.left,5),
            bottom: App.Util.round(bounds.bottom,5),
            right: App.Util.round(bounds.right,5),
            top: App.Util.round(bounds.top,5)
        });
        var w = window.open(link);
        w.close();
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
         * Returns the "display zone" panel
         *
         * Parameters:
         * options - {Object} Extra options passed to the panel
         *
         * Returns:
         * {Ext.Panel} the display zone panel
         */
        getPanel: function(options) {
            if (!panel) {
                App.Permalink.init();
                var permalink = App.Permalink.getAction({
                    text: OpenLayers.i18n('layertree.btn.permalink')
                });
                panel = new Ext.Panel(
                    Ext.apply({
                        id: 'displayZone',
                        layout: 'card',
                        activeItem: 'def',
                        defaults: {
                            border:false
                        },
                        items: [{
                            id: 'def',
                            bodyStyle: 'padding:.5em;',
                            html: "<p>"+OpenLayers.i18n('displayzone.defaulttext')+"</p>"
                        }], 
                        buttons: [ new Ext.Button(permalink)/*, {
                            text: OpenLayers.i18n('layertree.btn.addlayers'),
                            handler: function() {
                                alert('To do...');
                            }
                        }*/]
                    }, options)
                );
            }
            return panel;
        },
        
        /**
         * APIMethod: clear
         * Clears current tile displaying/editing
         */
        clear: function() {
            highlightedFeature = null;
            var newSource = createTagHash(null);
            propGrid.setSource(newSource);
            propGrid.setTitle(OpenLayers.i18n('Tile'));
            editedFeature = null;
            panel.layout.setActiveItem('def');
        },
        
        /**
         * APIMethod: edit
         * Displays the "edit tile" panel
         *
         * Parameters:
         * feature - {OpenLayers.Feature.Vector} feature to edit
         */
        edit: function(feature) {
            editedFeature = feature;
            if (!editGrid) {
                editGrid = panel.add(createGrid(feature, {
                    id: 'editGrid',
                    listeners: {
                        "beforepropertychange": function(source, recordId, value, oldValue) {
                            var attrs = {};
                            attrs[recordId] = value;
                            updateCurrentFeature(attrs);
                            //return false; // to cancel edit (TODO in case of pbs persisting)
                        }
                    },
                    tools: [{ 
                        qtip: OpenLayers.i18n('displayzone.tool.zoom'),
                        id: 'plus',
                        handler: function() {
                            observable.fireEvent("zoomto", {
                                feature: editedFeature
                            });
                        }
                    }, {
                        qtip: OpenLayers.i18n('displayzone.tool.unselect'),
                        id: 'close',
                        handler: function() {
                            observable.fireEvent("unselect", {
                                feature: editedFeature
                            });
                        }
                    }],
                    tbar: [{
                        text: OpenLayers.i18n('displayzone.tbar.reserve'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.reserve.tooltip'),
                        ref: '../reserveButton',
                        handler: function() {
                            updateCurrentFeature({
                                reserved: true
                            });
                            // TODO: would be smarter with events:
                            editGrid.unreserveButton.enable();
                            editGrid.reserveButton.disable();
                            editGrid.setTitle(getTitle(editedFeature));
                        },
                        scope: this
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.josm'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.josm.tooltip'),
                        ref: '../josmButton',
                        handler: JosmOpen
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.potlatch'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.potlatch.tooltip'),
                        ref: '../potlatchButton',
                        handler: potlatchOpen
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.walkingpapers'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.walkingpapers.tooltip'),
                        ref: '../walkingpapersButton',
                        handler: WalkingPapersOpen
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.unreserve'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.unreserve.tooltip'),
                        ref: '../unreserveButton',
                        handler: function() {
                            updateCurrentFeature({
                                reserved: false
                            });
                            editGrid.reserveButton.enable();
                            editGrid.unreserveButton.disable();
                            editGrid.setTitle(getTitle(editedFeature));
                        },
                        scope: this
                    }],
                    bbar: [{
                        text: OpenLayers.i18n('displayzone.bbar.allnok'),
                        iconCls: 'allnok',
                        tooltip: OpenLayers.i18n('displayzone.bbar.allnok.tooltip'),
                        ref: '../allnokButton',
                        handler: function() {                        
                            var newSource = createTagHash(false); 
                            editGrid.setSource(newSource);
                            updateCurrentFeature(newSource);
                        }
                    },'->',{
                        text: OpenLayers.i18n('displayzone.bbar.allok'),
                        iconCls: 'allok',
                        // commented because tip displays in front of btn
                        //tooltip: 'Mark all fields as OK / true',
                        ref: '../allokButton',
                        handler: function() {
                            var newSource = createTagHash(true); 
                            editGrid.setSource(newSource);
                            updateCurrentFeature(newSource);
                        }
                    }]
                }));
                panel.doLayout();
            } else {
                editGrid.setSource(removeReservedTags(feature.attributes));
                editGrid.setTitle(getTitle(feature));
            }
            
            if (feature.attributes['reserved']) {
                editGrid.unreserveButton.enable();
                editGrid.reserveButton.disable();
            } else {
                editGrid.unreserveButton.disable();
                editGrid.reserveButton.enable();
            }
            
            panel.layout.setActiveItem('editGrid');
        },
        
        /**
         * APIMethod: display
         * Displays the "information about this tile" panel
         *
         * Parameters:
         * feature - {OpenLayers.Feature.Vector} feature to display
         */
        display: function(feature) {

            if (feature === highlightedFeature) {
                return;
            }
            highlightedFeature = feature;
            
            if (!propGrid) {
                propGrid = panel.add(createGrid(feature, {
                    trackMouseOver: false,
                    tbar: [{
                        text: OpenLayers.i18n('displayzone.tbar.reserve'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.reserve.tooltip'),
                        disabled: true
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.josm'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.josm.tooltip'),
                        disabled: true
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.potlatch'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.potlatch.tooltip'),
                        disabled: true
                    },{
                        text: OpenLayers.i18n('displayzone.tbar.unreserve'),
                        tooltip: OpenLayers.i18n('displayzone.tbar.unreserve.tooltip'),
                        disabled: true
                    }]
                }));
                panel.doLayout();
            } else {
                propGrid.setSource(removeReservedTags(feature.attributes));
                propGrid.setTitle(getTitle(feature));
            }
            panel.layout.setActiveItem('propGrid');
        },
        
        /**
         * APIMethod: getSelectedId
         * Returns the id of the selected (= edited) feature
         *
         * Returns:
         * {Integer} the id
         */
        getSelectedId: function() {
            if (editedFeature) {
                return editedFeature.fid;
            }
            return null;
        }

    };
})();
