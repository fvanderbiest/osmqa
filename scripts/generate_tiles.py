#! /usr/bin/env python
#-*- coding: utf-8 -*-

# This script creates a grid of geometries aligned with spherical mercator tiles, in a particular Earth region
# This region is defined in area.py by its WKT string

# Zoom level for which we want to generate tiles (it is recommended to keep z=15)
z = 15

# fast mode (set this to 0 in order to deactivate) : needs RAM !
fast_mode = 1

#####################################
# DO NOT MODIFY THE FOLLOWING LINES #
#####################################

import sys, os
from shapely.geometry import Polygon
from shapely.wkt import loads
from math import floor, ceil
from area import wkt

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


# tile size (in meters) at the required zoom level
step = max/(2**(z-1))

xminstep = int(floor((xmin+max)/step))
xmaxstep = int(ceil((xmax+max)/step))
yminstep = int(floor((ymin+max)/step))
ymaxstep = int(ceil((ymax+max)/step))

tot = (xminstep - xmaxstep - 1) * (yminstep - ymaxstep - 1)

percent = 0
count = 1
c = 1
str = ''

if not fast_mode:
    filed = open('../sql/generated/tiles.sql', 'w')

for i in range(xminstep,xmaxstep+1):
    for j in range(yminstep,ymaxstep+1):
        # TO DO: generate WKB
        # TO DO: use COPY instead of INSERT
        s = "INSERT INTO tile_geometries (geometry) SELECT GeometryFromText('%s',900913);\r\n"%(create_square(i,j,step).wkt)
        if fast_mode:
            str += s
        else:
            filed.write(s)
        count = count+1
        p = int(round(50 * count / tot))
        if p > percent:
            percent = p
            print percent

for i in range(xminstep,xmaxstep+1):
    for j in range(yminstep,ymaxstep+1):
        # TO DO: generate WKB
        # TO DO: use COPY instead of INSERT
        s = "INSERT INTO tags (map_id, tile_geometry_id) VALUES (1, %s);\r\n"%(c)
        if fast_mode:
            str += s
        else:
            filed.write(s)
        count = count+1
        c = c+1
        p = int(round(50 * count / tot))
        if p > percent:
            percent = p
            print percent

if fast_mode:
    print "Saving file, please wait..."
    filed = open('../sql/generated/tiles.sql', 'w')
    filed.write(str)

filed.close()
print "All done"
