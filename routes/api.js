var express = require('express');
var router = express.Router();

var api_controller = require('../controllers/apiController');

router.get('/ride_share_mapping', api_controller.get_trip_transplant);
router.post('/ride_share_mapping', api_controller.post_trip_transplant);

module.exports = router;