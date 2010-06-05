#! /usr/bin/env python
#-*- coding: utf-8 -*-

# This script creates a grid of geometries aligned with spherical mercator tiles, in a particular Earth region
# An EPSG:900913 WKT string is used to define this Earth region 

# Brest Region, as drawn from http://openlayers.org/dev/examples/vector-formats.html
wkt = 'POLYGON((-513656.83000488 6177851.1455421, -491642.96586182 6187070.9615844, -483082.01869507 6162200.2990878, -502038.40170715 6151169.8923667, -520383.28849304 6158521.9140156, -513656.83000488 6177851.1455421))'

# Zoom level for which we want to generate tiles
z = 15

# Table name for storing the tiles
tablename = 'tiles'

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
xminstep = floor((xmin+max)/step)
xmaxstep = ceil((xmax+max)/step)
yminstep = floor((ymin+max)/step)
ymaxstep = ceil((ymax+max)/step)

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
filed.write("DROP TABLE %s;CREATE TABLE %s ( id serial primary key);\r\n"%(tablename,tablename))
filed.write("SELECT addGeometryColumn('public', '%s', 'geometry', 900913, 'POLYGON', 2);\r\n"%(tablename))

count = 1
tot = (xminstep - xmaxstep) * (yminstep - ymaxstep)
percent = 0
for i in range(xminstep,xmaxstep):
    for j in range(yminstep,ymaxstep):
        #filed.write("%s;%s\r\n"%(count,create_square(i,j).wkb.encode('hex')))
        filed.write("INSERT INTO %s (geometry) SELECT GeometryFromText('%s',900913);\r\n"%(tablename,create_square(i,j).wkt))
        count = count+1
        p = round(100 * count / tot)
        if p > percent:
            percent = p
            print percent
            
filed.write('grant select,update on %s to "www-data";\r\n'%(tablename));
filed.close()