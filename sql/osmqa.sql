-- maps are areas where survey grids have been created for a well-defined purpose
CREATE TABLE maps(
    id serial primary key,
    name varchar(255),
    xmin float, -- map's bbox
    ymin float,
    xmax float,
    ymax float,
    purpose varchar(1024)
);
GRANT select, update, delete ON maps to "www-data";

-- tile_geometries are square geometries
CREATE TABLE tile_geometries ( 
    id serial primary key,
    intersectsland boolean default false
);
SELECT addGeometryColumn('public', 'tile_geometries', 'geometry', 900913, 'POLYGON', 2);
CREATE INDEX tile_geometries_geometry_idx on tile_geometries using GIST (geometry GIST_GEOMETRY_OPS); 
GRANT select ON tile_geometries TO "www-data";
CREATE INDEX tile_geometries_intersectsland_idx ON tile_geometries (intersectsland); 

-- tags are booleans qualifying the OSM dataset in a tile, according to a map
CREATE TABLE tags(
    map_id integer not null,
    tile_geometry_id integer not null,
    highway boolean default false, # question: should not tags be defined in the map object ?
    building boolean default false,
    landuse boolean default false,
    primary key (map_id, tile_geometry_id)
);
GRANT select, update ON tags TO "www-data";

ALTER TABLE tags ADD CONSTRAINT fk_tags_tile_geometry_id FOREIGN KEY (tile_geometry_id) REFERENCES tile_geometries(id);
ALTER TABLE tags ADD CONSTRAINT fk_tags_map_id FOREIGN KEY (map_id) REFERENCES maps(id);

/*
SELECT addGeometryColumn('public', 'world_boundaries', 'buffered_geometry', 900913, 'POLYGON', 2);
UPDATE world_boundaries SET buffered_geometry = st_buffer(geometry, 500);
CREATE INDEX world_boundaries_buffered_geometry_gist ON world_boundaries USING gist (buffered_geometry);


SELECT addGeometryColumn('public', 'world_boundaries_gshhs', 'geometry_sphmerc', 900913, 'POLYGON', 2);
UPDATE world_boundaries_gshhs SET geometry_sphmerc = transform(st_intersection(geometry, geomfromtext('POLYGON((-180 85, 180 85, 180 -85, -180 -85, -180 85))', 4326)), 900913);
CREATE INDEX world_boundaries_gshhs_geometry_sphmerc_gist ON world_boundaries_gshhs USING gist (geometry_sphmerc);


SELECT addGeometryColumn('public', 'world_boundaries_gshhs', 'geometry_sphmerc_simplified', 900913, 'POLYGON', 2);
UPDATE world_boundaries_gshhs SET geometry_sphmerc_simplified = st_simplify(st_buffer(geometry_sphmerc, 100), 100);
CREATE INDEX world_boundaries_gshhs_geometry_sphmerc_simplified_gist ON world_boundaries_gshhs USING gist (geometry_sphmerc_simplified);
*/

/*
SELECT addGeometryColumn('public', 'world_boundaries_h', 'geometry_sphmerc', 900913, 'POLYGON', 2);
UPDATE world_boundaries_h SET geometry_sphmerc = transform(st_intersection(geometry, geomfromtext('POLYGON((-180 85, 180 85, 180 -85, -180 -85, -180 85))', 4326)), 900913);
CREATE INDEX world_boundaries_h_geometry_sphmerc_gist ON world_boundaries_h USING gist (geometry_sphmerc);
*/

--create table local_boundaries(id sequence primary key); 
--v  world boundaries contient GSHHS de plus haute res dispo (f)
SELECT addGeometryColumn('public', 'world_boundaries_h', 'geometry_cropped', 900913, 'GEOMETRY', 2);

ALTER TABLE world_boundaries_h DROP CONSTRAINT enforce_geotype_geometry_cropped; -- car multipolygon et geometry colelectons
update world_boundaries_h set geometry_cropped = st_intersection(geometry_sphmerc, geomfromtext('POLYGON((-513656.83000488 6177851.1455421, -491642.96586182 6187070.9615844, -483082.01869507 6162200.2990878, -502038.40170715 6151169.8923667, -520383.28849304 6158521.9140156, -513656.83000488 6177851.1455421))', 900913));

CREATE INDEX world_boundaries_h_geometry_cropped_gist ON world_boundaries_h USING gist (geometry_cropped);

UPDATE tile_geometries
SET intersectsland = true 
WHERE id IN (select t.id 
from world_boundaries_h w, tile_geometries t where 
t.geometry && w.geometry_cropped and st_intersects(t.geometry, w.geometry_cropped));


-- DROP VIEW tiles;
CREATE VIEW tiles AS 
SELECT t.tile_geometry_id as id, t.highway, t.building, t.landuse, g.geometry 
FROM tags t 
LEFT JOIN tile_geometries g 
ON t.tile_geometry_id = g.id 
WHERE map_id=1 AND g.intersectsland = true ;
-- FIXME: selectionner les tuiles après creation, ou au moment de la creation, et non at runtime

GRANT select, update ON tiles TO "www-data";
-- TODO: rules/trigger pour la modification des tags

CREATE OR REPLACE RULE update_tiles AS ON UPDATE TO tiles DO INSTEAD (
  UPDATE tags SET highway = NEW.highway, building = NEW.building, landuse = NEW.landuse WHERE tile_geometry_id = NEW.id
);
CREATE OR REPLACE RULE delete_tiles AS ON DELETE TO tiles DO INSTEAD ();
CREATE OR REPLACE RULE insert_tiles AS ON INSERT TO tiles DO INSTEAD ();