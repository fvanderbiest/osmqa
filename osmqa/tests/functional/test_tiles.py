from osmqa.tests import *

class TestTilesController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='tiles'))
        # Test response...
