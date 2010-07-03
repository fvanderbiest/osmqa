#! /usr/bin/env python
#-*- coding: utf-8 -*-

# This script creates a grid of geometries aligned with spherical mercator tiles, in a particular Earth region

# A WKT string is used to define this Earth region (EPSG:900913)
# Draw with http://openlayers.org/dev/examples/vector-formats.html
# Brest Region
wkt = 'POLYGON((-538728.17527893 6213402.3442011, -538116.67905273 6128693.5677395, -458010.67342102 6124113.8047434, -456787.68096863 6213402.3442011, -538728.17527893 6213402.3442011))' 
# France and surroundings:
#wkt = 'POLYGON((-645740.01486328 6163580.1021162, -587036.37714844 6342072.1746128, -264166.3697168 6463205.3904489, 19567.879238281 6463205.3904489, 264166.3697168 6742414.7749688, 450061.22248047 6632702.662042, 792499.10915039 6417574.3447539, 1027313.6600098 6267242.5253677, 909906.38458008 5988743.6733774, 841418.80724609 5817359.2316711, 929474.26381836 5335486.9709201, 1066449.4184863 5402787.7924653, 1154504.8750586 5136435.2698408, 1115369.116582 5031951.2576526, 949042.14305664 4954321.4119625, 831634.86762695 5322085.0229513, 684875.77333984 5175912.1427473, 459845.16209961 5255361.5900812, 430493.34324219 5044950.0293073, 127191.21504883 4890096.6260625, -264166.3697168 4993059.0538548, -293518.18857422 5484200.8827072, -244598.49047852 5760965.05086, -420709.40362305 5874115.800417, -567468.49791016 6017638.0390564, -645740.01486328 6163580.1021162))'

# Zoom level for which we want to generate tiles (it is recommended to keep z=15)
z = 15

# Table name for storing the tiles (do not modify unless you know what you're doing)
tablename = 'tile_geometries'

#####################################
# DO NOT MODIFY THE FOLLOWING LINES #
#####################################

import sys, os
from shapely.geometry import Polygon
from shapely.wkt import loads
from math import floor, ceil

# we need to generate two grids : 
# - tiles.sql for the survey tiles
# - slicendice_tiles.sql for the tiles which will slice and dice the world boundaries polygons
tablenames = [tablename, 'throwaway_grid']
filenames = ['../sql/generated/tiles.sql', '../sql/generated/slicendice_tiles.sql']
zs = [z, z-3]

# Maximum resolution
MAXRESOLUTION = 156543.0339;

# X/Y axis limit
max = MAXRESOLUTION*256/2

# grid bounding box
geom = loads(wkt)
xmin=geom.bounds[0]
ymin=geom.bounds[1]
xmax=geom.bounds[2]
ymax=geom.bounds[3]


def create_square(i, j, a):
    """
    creates a Shapely Polygon geometry representing tile indexed by (i,j) with dimension a
    """
    xmin = i*a-max
    ymin = j*a-max
    xmax = (i+1)*a-max
    ymax = (j+1)*a-max
    return Polygon([(xmin, ymin),(xmax, ymin),(xmax, ymax),(xmin, ymax)])



for k in range(2):
    # tile size (in meters) at the required zoom level
    step = max/(2**(zs[k]-1))

    xminstep = int(floor((xmin+max)/step))
    xmaxstep = int(ceil((xmax+max)/step))
    yminstep = int(floor((ymin+max)/step))
    ymaxstep = int(ceil((ymax+max)/step))

    tot = (xminstep - xmaxstep - 1) * (yminstep - ymaxstep - 1)

    percent = 0
    count = 1

    filed = open(filenames[k], 'w')

    for i in range(xminstep,xmaxstep+1):
        for j in range(yminstep,ymaxstep+1):
            filed.write("INSERT INTO %s (geometry) SELECT GeometryFromText('%s',900913);\r\n"%(tablenames[k],create_square(i,j,step).wkt))
            if k == 0:
                filed.write("INSERT INTO tags (map_id, tile_geometry_id) VALUES (1, %s);\r\n"%(count));
            count = count+1
            p = int(round(100 * count / tot))
            if p > percent:
                percent = p
                print percent
                
    filed.close()
