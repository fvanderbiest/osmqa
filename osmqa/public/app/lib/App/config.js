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
    // zoom level at which vector tiles appear:
    minZoomlevelForVectors: 12,
    // left bottom right top in spherical mercator (EPSG:900913):
    startupExtent: {
        "fr": "-621280,5162735,939258,6710917",
        "en": "-1188748,6379738,234814,8299323",
        "it": "738687,4372210,2079087,6024876"
    }
};
    