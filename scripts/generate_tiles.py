#! /usr/bin/env python
#-*- coding: utf-8 -*-

# This script creates a grid of geometries aligned with spherical mercator tiles, in a particular Earth region
# An EPSG:900913 WKT string is used to define this Earth region 

# Brest Region, as drawn from http://openlayers.org/dev/examples/vector-formats.html
wkt = 'POLYGON((-513656.83000488 6177851.1455421, -491642.96586182 6187070.9615844, -483082.01869507 6162200.2990878, -502038.40170715 6151169.8923667, -520383.28849304 6158521.9140156, -513656.83000488 6177851.1455421))'

# Zoom level for which we want to generate tiles
z = 15

# Table name for storing the tiles
tablename = 'tile_geometries'
areaname = 'Brest'

#####################################
# DO NOT MODIFY THE FOLLOWING LINES #
#####################################

import sys, os
from shapely.geometry import Polygon
from shapely.wkt import loads
from math import floor, ceil

# Maximum resolution CONSTANT
MAXRESOLUTION = 156543.0339;

# X/Y axis limit
max = MAXRESOLUTION*256/2

# tile size (in meters) at the required zoom level
step = max/(2**(z-1))

# compute the grid containing the whole input geometry
geom = loads(wkt)
xmin=geom.bounds[0]
ymin=geom.bounds[1]
xmax=geom.bounds[2]
ymax=geom.bounds[3]
xminstep = int(floor((xmin+max)/step))
xmaxstep = int(ceil((xmax+max)/step))
yminstep = int(floor((ymin+max)/step))
ymaxstep = int(ceil((ymax+max)/step))

def create_square(i,j):
    """
    creates a Polygon Shapely geometry for tile indexed by (i,j)
    """
    global step, Polygon
    xmin = i*step-max
    ymin = j*step-max
    xmax = (i+1)*step-max
    ymax = (j+1)*step-max
    return Polygon([(xmin, ymin),(xmax, ymin),(xmax, ymax),(xmin, ymax)])

filed = open('../sql/tiles.sql', 'w') 

filed.write("INSERT INTO maps (name) VALUES ('%s');"%(areaname))

count = 1
tot = (xminstep - xmaxstep) * (yminstep - ymaxstep)
percent = 0
for i in range(xminstep,xmaxstep):
    for j in range(yminstep,ymaxstep):
        #filed.write("%s;%s\r\n"%(count,create_square(i,j).wkb.encode('hex')))
        filed.write("INSERT INTO %s (geometry) SELECT GeometryFromText('%s',900913);\r\n"%(tablename,create_square(i,j).wkt))
        filed.write("INSERT INTO tags (map_id, tile_geometry_id) VALUES (1, %s);\r\n"%(count));
        count = count+1
        p = int(round(100 * count / tot))
        if p > percent:
            percent = p
            print percent
            
filed.close()

#3857 vers 900913
# ogr2ogr -s_srs "EPSG:3857" -t_srs "EPSG:900913" world_boundaries/world_bnd_m_900913.shp world_boundaries/world_bnd_m.shp
# mieux: ogr2ogr -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs" world_boundaries/world_bnd_m_900913.shp world_boundaries/world_bnd_m.shp

# shp2pgsql -s 900913 -g geometry -I world_boundaries/world_bnd_m_900913.shp world_boundaries > world_boundaries.sql

#bouba@oncidium:~/workspace/osmqa/trunk/sql/GSHHS_shp/h$ shp2pgsql -s 4326 -g geometry -I GSHHS_h_L1.shp world_boundaries_h > world_boundaries_h.sql
#Shapefile type: Polygon
#Postgis type: MULTIPOLYGON[2]
#puis : retaillage sur polygon((-180 85, 180 85, 180 -85, -180 -85, -180 85))
