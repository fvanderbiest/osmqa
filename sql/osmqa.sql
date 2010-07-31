-- maps are areas where survey grids have been created for a well-defined purpose
-- for the moment, we just have one map, on "France métropole"
-- but later, we will let users create their own quality map, with the extent they want
CREATE TABLE maps(
    id serial primary key,
    name varchar(255), -- the following vars are not yet useful
    "left" float, -- map's bbox in epsg:900913
    "bottom" float,
    "right" float,
    "top" float,
    purpose varchar(1024)
);
INSERT INTO maps (name) VALUES ('France');

-- tile_geometries are square geometries
CREATE TABLE tile_geometries ( 
    id serial primary key,
    intersectsland boolean default false
);
SELECT addGeometryColumn('public', 'tile_geometries', 'geometry', 900913, 'POLYGON', 2);
CREATE INDEX tile_geometries_geometry_idx on tile_geometries using GIST (geometry GIST_GEOMETRY_OPS); 
CREATE INDEX tile_geometries_intersectsland_idx ON tile_geometries (intersectsland); 

-- tags are booleans qualifying the OSM dataset in a tile, according to a map
CREATE TABLE tags(
    map_id integer not null,
    tile_geometry_id integer not null,
    uid integer not null default 1, -- osm user id (user who made the tile update) -- for the future
    updated_at timestamp, -- for the future
    reserved boolean default false, -- is this tile reserved by someone ?
    highway boolean default false, -- open question: should not tags be defined in the map object ?
    building boolean default false,
    landuse boolean default false,
    primary key (map_id, tile_geometry_id)
);
CREATE INDEX tags_map_id_idx ON tags (map_id); 
CREATE INDEX tags_tile_geometry_id_idx ON tags (tile_geometry_id); 
ALTER TABLE tags ADD CONSTRAINT fk_tags_tile_geometry_id FOREIGN KEY (tile_geometry_id) REFERENCES tile_geometries(id) ON DELETE CASCADE;
ALTER TABLE tags ADD CONSTRAINT fk_tags_map_id FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE;

-- DROP VIEW tiles;
CREATE VIEW tiles AS 
SELECT t.tile_geometry_id as id, t.reserved, t.highway, t.building, t.landuse, g.geometry  
FROM tags t 
LEFT JOIN tile_geometries g 
ON t.tile_geometry_id = g.id;
--WHERE map_id = 1;

CREATE OR REPLACE RULE update_tiles AS ON UPDATE TO tiles DO INSTEAD (
  UPDATE tags SET updated_at = now(), reserved = NEW.reserved, highway = NEW.highway, building = NEW.building, landuse = NEW.landuse WHERE tile_geometry_id = NEW.id
);
CREATE OR REPLACE RULE delete_tiles AS ON DELETE TO tiles DO INSTEAD ();
CREATE OR REPLACE RULE insert_tiles AS ON INSERT TO tiles DO INSTEAD ();