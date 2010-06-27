#! /usr/bin/env python
#-*- coding: utf-8 -*-

# This script creates a grid of geometries aligned with spherical mercator tiles, in a particular Earth region

# An EPSG:900913 WKT string is used to define this Earth region 
# Here is the boundary for France metropole, drawn with http://openlayers.org/dev/examples/vector-formats.html
wkt = 'POLYGON((-645740.01486328 6163580.1021162, -587036.37714844 6342072.1746128, -264166.3697168 6463205.3904489, 19567.879238281 6463205.3904489, 264166.3697168 6742414.7749688, 450061.22248047 6632702.662042, 792499.10915039 6417574.3447539, 1027313.6600098 6267242.5253677, 909906.38458008 5988743.6733774, 841418.80724609 5817359.2316711, 929474.26381836 5335486.9709201, 1066449.4184863 5402787.7924653, 1154504.8750586 5136435.2698408, 1115369.116582 5031951.2576526, 949042.14305664 4954321.4119625, 831634.86762695 5322085.0229513, 684875.77333984 5175912.1427473, 459845.16209961 5255361.5900812, 430493.34324219 5044950.0293073, 127191.21504883 4890096.6260625, -264166.3697168 4993059.0538548, -293518.18857422 5484200.8827072, -244598.49047852 5760965.05086, -420709.40362305 5874115.800417, -567468.49791016 6017638.0390564, -645740.01486328 6163580.1021162))'

# Zoom level for which we want to generate tiles
z = 15

# Table name for storing the tiles
tablename = 'tile_geometries'

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