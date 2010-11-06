-- maps are areas where survey grids have been created for a well-defined purpose
-- for the moment, we just have one map, on "France métropole"
-- but later, we will let users create their own quality map, with the extent they want
CREATE TABLE maps(
    id serial primary key,
    name varchar(255), -- the following vars are not yet useful
    "left" float, -- map bbox in epsg:900913
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
    barrier boolean default false,
    cycleway boolean default false,
    tracktype boolean default false,
    waterway boolean default false,
    railway boolean default false,
    aeroway boolean default false,
    aerialway boolean default false,
    power boolean default false,
    man_made boolean default false,
    leisure boolean default false,
    amenity boolean default false,
    office boolean default false,
    shop boolean default false,
    tourism boolean default false,
    historic boolean default false,
    military boolean default false,
    "natural" boolean default false,
    sport boolean default false,
    abutters boolean default false,
    name boolean default false,
    "ref" boolean default false,
    place boolean default false,
    addr boolean default false,
    primary key (map_id, tile_geometry_id)
);
CREATE INDEX tags_map_id_idx ON tags (map_id); 
CREATE INDEX tags_tile_geometry_id_idx ON tags (tile_geometry_id); 
ALTER TABLE tags ADD CONSTRAINT fk_tags_tile_geometry_id FOREIGN KEY (tile_geometry_id) REFERENCES tile_geometries(id) ON DELETE CASCADE;
ALTER TABLE tags ADD CONSTRAINT fk_tags_map_id FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE;

-- DROP VIEW tiles;
CREATE VIEW tiles AS 
SELECT t.tile_geometry_id as id, t.reserved, t.highway, t.building, t.landuse, t.barrier, t.cycleway, t.tracktype, t.waterway, t.railway, t.aeroway, t.aerialway, t.power, t.man_made, t.leisure, t.amenity, t.office, t.shop, t.tourism, t.historic, t.military, t."natural", t.sport, t.abutters, t.name, t."ref", t.place, t.addr, g.geometry  
FROM tags t 
LEFT JOIN tile_geometries g 
ON t.tile_geometry_id = g.id;
--WHERE map_id = 1;

CREATE OR REPLACE RULE update_tiles AS ON UPDATE TO tiles DO INSTEAD (
  UPDATE tags SET updated_at = now(), reserved = NEW.reserved, highway = NEW.highway, building = NEW.building, landuse = NEW.landuse, barrier = NEW.barrier, cycleway = NEW.cycleway, tracktype = NEW.tracktype, waterway = NEW.waterway, railway = NEW.railway, aeroway = NEW.aeroway, aerialway = NEW.aerialway, power = NEW.power, man_made = NEW.man_made, leisure = NEW.leisure, amenity = NEW.amenity, office = NEW.office, shop = NEW.shop, tourism = NEW.tourism, historic = NEW.historic, military = NEW.military, "natural" = NEW."natural", sport = NEW.sport, abutters = NEW.abutters, name = NEW.name, "ref" = NEW."ref", place = NEW.place, addr = NEW.addr WHERE tile_geometry_id = NEW.id
);
CREATE OR REPLACE RULE delete_tiles AS ON DELETE TO tiles DO INSTEAD ();
CREATE OR REPLACE RULE insert_tiles AS ON INSERT TO tiles DO INSTEAD ();