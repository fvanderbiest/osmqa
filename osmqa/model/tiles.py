from sqlalchemy import Column, Table, types
from sqlalchemy.orm import mapper

from mapfish.sqlalchemygeom import Geometry
from mapfish.sqlalchemygeom import GeometryTableMixIn

from osmqa.model.meta import metadata, engine

tiles_table = Table(
    'tiles', metadata,
    Column('geometry', Geometry(900913)),
    autoload=True, autoload_with=engine)

class Tile(GeometryTableMixIn):
    # for GeometryTableMixIn to do its job the __table__ property
    # must be set here
    __table__ = tiles_table

mapper(Tile, tiles_table)
