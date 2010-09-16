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

Ext.namespace('App');

App.config = {
    // default tag to display in combobox
    defaultTag: 'highway',
    // all tags which can be surveyed
    tags: ['highway', 'building', 'landuse', 'barrier', 'cycleway', 'tracktype', 'waterway', 'railway', 'aeroway', 'aerialway', 'power', 'man_made', 'leisure', 'amenity', 'office', 'shop', 'tourism', 'historic', 'military', 'natural', 'sport', 'abutters', 'name', 'ref', 'place', 'addr'],
    // zoom level at which vector tiles appear:
    minZoomlevelForVectors: 13,
    // left bottom right top in spherical mercator (EPSG:900913):
    startupExtent: {
        "fr": "-621280,5162735,939258,6710917",
        "en": "-1188748,6379738,234814,8299323",
        "it": "738687,4372210,2079087,6024876",
        "kg": "7684061,4704585,8916837,5414615",
        "de": "694659,5924080,1682837,7357129"
    }
};
    
