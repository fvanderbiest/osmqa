BEGIN;

ALTER TABLE tags ADD COLUMN barrier boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN cycleway boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN tracktype boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN waterway boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN railway boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN aeroway boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN aerialway boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN power boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN man_made boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN leisure boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN amenity boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN office boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN shop boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN tourism boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN historic boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN military boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN "natural" boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN sport boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN abutters boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN name boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN "ref" boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN place boolean DEFAULT false;
ALTER TABLE tags ADD COLUMN addr boolean DEFAULT false;

DROP VIEW tiles;

CREATE VIEW tiles AS 
SELECT t.tile_geometry_id as id, t.reserved, t.highway, t.building, t.landuse, t.barrier, t.cycleway, t.tracktype, t.waterway, t.railway, t.aeroway, t.aerialway, t.power, t.man_made, t.leisure, t.amenity, t.office, t.shop, t.tourism, t.historic, t.military, t."natural", t.sport, t.abutters, t.name, t."ref", t.place, t.addr, g.geometry  
FROM tags t 
LEFT JOIN tile_geometries g 
ON t.tile_geometry_id = g.id;


CREATE OR REPLACE RULE update_tiles AS ON UPDATE TO tiles DO INSTEAD (
  UPDATE tags SET updated_at = now(), reserved = NEW.reserved, highway = NEW.highway, building = NEW.building, landuse = NEW.landuse, barrier = NEW.barrier, cycleway = NEW.cycleway, tracktype = NEW.tracktype, waterway = NEW.waterway, railway = NEW.railway, aeroway = NEW.aeroway, aerialway = NEW.aerialway, power = NEW.power, man_made = NEW.man_made, leisure = NEW.leisure, amenity = NEW.amenity, office = NEW.office, shop = NEW.shop, tourism = NEW.tourism, historic = NEW.historic, military = NEW.military, "natural" = NEW."natural", sport = NEW.sport, abutters = NEW.abutters, name = NEW.name, "ref" = NEW."ref", place = NEW.place, addr = NEW.addr WHERE tile_geometry_id = NEW.id
);
CREATE OR REPLACE RULE delete_tiles AS ON DELETE TO tiles DO INSTEAD ();
CREATE OR REPLACE RULE insert_tiles AS ON INSERT TO tiles DO INSTEAD ();

COMMIT;

-- You will also need to re-run grants.sql