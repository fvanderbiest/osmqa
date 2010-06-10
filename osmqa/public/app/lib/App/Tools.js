/*
 * @include OpenLayers/Control/ZoomToMaxExtent.js
 * @include OpenLayers/Control/ZoomBox.js
 * @include OpenLayers/Control/ZoomOut.js
 * @include OpenLayers/Control/NavigationHistory.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt.ux/MeasureLength.js
 * @include GeoExt.ux/MeasureArea.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Control/Measure.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Style.js
 * @include OpenLayers/Rule.js
 * @include OpenLayers/Handler.js
 * @include App/Locator.js
 * @include App/Permalink.js
 */

Ext.namespace('App');

/**
 * Constructor: App.Tools
 * Creates an {Ext.Toolbar} with tools. Use the "toolbar" property
 * to get a reference to the toolbar.
 *
 * Parameters:
 * map - {OpenLayers.Map} The map object.
 */
App.Tools = function(map) {

    // Private
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
        var zoomToMaxExtent = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            iconCls: 'maxExtent',
            tooltip: OpenLayers.i18n("Tools.maxextentactiontooltip")
        });
        var zoomIn = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomBox(),
            map: map,
            toggleGroup: map.id + '_tools',
            allowDepress: true,
            iconCls: 'mapZoomIn'
        });
        var zoomOut = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomOut(),
            map: map,
            iconCls: 'mapZoomOut'
        });

        var history = new OpenLayers.Control.NavigationHistory();
        map.addControl(history);
        var historyPrevious = new GeoExt.Action({
            control: history.previous,
            disabled: true,
            iconCls: 'mapHistoryPrevious'
        });
        var historyNext = new GeoExt.Action({
            control: history.next,
            disabled: true,
            iconCls: 'mapHistoryNext'
        });

        var permalink = (new App.Permalink()).action;

        var measureLength = new GeoExt.ux.MeasureLength({
            map: map,
            toggleGroup: map.id + '_tools',
            tooltip: OpenLayers.i18n("Tools.measurelengthactiontooltip"),
            iconCls: 'mapMeasureLength'
        });
        var measureArea = new GeoExt.ux.MeasureArea({
            map: map,
            toggleGroup: map.id + '_tools',
            tooltip: OpenLayers.i18n("Tools.measureareaactiontooltip"),
            iconCls: 'mapMeasureArea'
        });

        var locator = (new App.Locator(map, {
            toggleGroup: map.id + '_tools',
            tooltip: OpenLayers.i18n("Tools.measurepositionactiontooltip"),
            iconCls: 'mapMeasurePosition'
        })).action;

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
            //emptyText: 'contexte',
            //lazyRender: false,
            width: 100,
            listeners: {
                'select': function(v) {
                    observable.fireEvent("tagchanged", v.value);
                },
                scope: this
            }
        });
        
        var refresh = {
            text: 'refresh',
            tooltip: OpenLayers.i18n("Tools.refreshtooltip"), // FIXME
            //iconCls: 'mapRefresh', // FIXME
            listeners: {
                'click': function(v) {
                    observable.fireEvent("refresh");
                },
                scope: this
            }
        };
        
        return [
            zoomToMaxExtent, zoomIn, zoomOut, '-',
            historyPrevious, historyNext, '-',
            measureLength, measureArea, locator, '-',
            refresh, '->', permalink, tagCombo
        ];
    };

    // Public

    Ext.apply(this, {

        /**
         * APIProperty: toolbar
         * {Ext.Toolbar} The toolbar instance. Read-only.
         */
        toolbar: null,
        
        // our observable
        events: null
    });

    // Main

    this.toolbar = new Ext.Toolbar({ 
        items: getItems(map) 
    });
    
    this.events = observable;
};
