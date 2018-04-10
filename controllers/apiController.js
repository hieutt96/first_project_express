
var async = require('async');
var algorithm = require('../controllers/algorithmController');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.get_trip_transplant = function(req, res, next){
	res.render('form_transplant');
};	

exports.post_trip_transplant = [
	body('minTime').isAlphanumeric().withMessage("Thời Gian Phải Là Con Số"),
	body('minLength').isAlphanumeric().withMessage("Độ dài không hợp lệ"),
	sanitizeBody('minLength').trim().escape(),
	sanitizeBody('minTime').trim().escape(),
	(req, res, next) =>{
		var array = [];
		var minLength = req.body.minLength;
		var minTime = req.body.minTime;
		algorithm.minTime = minTime;
		algorithm.minLength = minLength;
		var drivers = JSON.parse(req.body.drivers); 
		var j = 0;
		while(req.body['data['+j+'][time]']) { 
			var steps = req.body['data['+j+'][steps]'];
			steps = JSON.parse(steps);
			array.push(algorithm.assignSteps(req.body['data['+j+'][time]'], steps, req.body['data['+j+'][istransplant]'], req.body['data['+j+'][cost]'], req.body['data['+j+'][amount]']));
			j++;
		}
		var data = [];
		var n = algorithm.transplant(array).stats;
		var amount = algorithm.transplant(array).amount;
		var start_location = algorithm.transplant(array).start_location;
		var end_location = algorithm.transplant(array).end_location;
		for(var i = 0 ;i < n.length ;i++){
			var str = '';
			for(var j = 0 ; j < n[i].trip_transplant.length ; j++){
				str += n[i].trip_transplant[j].trip + ',';
			}
			data[data.length] = {
					trip : str,
					tongSoKhach : amount[i],
					detail : n[i].trip_transplant,
					driver : algorithm.get_transplant_driver(amount[i],start_location[i], end_location[i],drivers),
			}
		}
		res.send(JSON.stringify(data));
	}
]