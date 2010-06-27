-- SQL for world boundaries handling
-- see installation instructions for usage

SELECT addGeometryColumn('public', 'world_boundaries', 'geometry_cropped85', 900913, 'GEOMETRY', 2);
UPDATE world_boundaries SET geometry_cropped85 = transform(st_intersection(geometry, geomfromtext('POLYGON((-180 85, 180 85, 180 -85, -180 -85, -180 85))', 4326)), 900913); 

SELECT addGeometryColumn('public', 'world_boundaries', 'geometry_cropped', 900913, 'GEOMETRY', 2);
--ALTER TABLE world_boundaries DROP CONSTRAINT enforce_geotype_geometry_cropped; -- might be necessary in case there's a mix of multipolygon and geometry collections

-- Crop to France area:
UPDATE world_boundaries SET geometry_cropped = st_intersection(geometry_cropped85, geomfromtext('POLYGON((-645740.01486328 6163580.1021162, -587036.37714844 6342072.1746128, -264166.3697168 6463205.3904489, 19567.879238281 6463205.3904489, 264166.3697168 6742414.7749688, 450061.22248047 6632702.662042, 792499.10915039 6417574.3447539, 1027313.6600098 6267242.5253677, 909906.38458008 5988743.6733774, 841418.80724609 5817359.2316711, 929474.26381836 5335486.9709201, 1066449.4184863 5402787.7924653, 1154504.8750586 5136435.2698408, 1115369.116582 5031951.2576526, 949042.14305664 4954321.4119625, 831634.86762695 5322085.0229513, 684875.77333984 5175912.1427473, 459845.16209961 5255361.5900812, 430493.34324219 5044950.0293073, 127191.21504883 4890096.6260625, -264166.3697168 4993059.0538548, -293518.18857422 5484200.8827072, -244598.49047852 5760965.05086, -420709.40362305 5874115.800417, -567468.49791016 6017638.0390564, -645740.01486328 6163580.1021162))', 900913));
--CREATE INDEX world_boundaries_geometry_cropped_gist ON world_boundaries USING gist (geometry_cropped); -- should not be necessary

UPDATE tile_geometries 
SET intersectsland = true 
WHERE id IN (SELECT t.id 
FROM world_boundaries w, tile_geometries t WHERE 
t.geometry && w.geometry_cropped AND st_intersects(t.geometry, w.geometry_cropped));
