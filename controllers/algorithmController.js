var http = require('http');
	exports.minTime = 0;
	exports.minLength = 0;
	exports.transplant = function (ticketList){
		var amountArray = [];
		var start_location = [];
		var end_location = [];
		var arrayTemp = [];
		var stats = [];
		for(var i = 0; i < ticketList.length; i++) {
			var di = new Date(parseInt(ticketList[i].time));
			var temp = [];
			var amount = 0;
			var check_i = this.check(i ,arrayTemp);
			if((!check_i) && (ticketList[i].merged == 'false')){
					for(var j = 0; j < ticketList.length; j++){
						var check_j = this.check(j ,arrayTemp);
						var dj = new Date(ticketList[j].time);
						if( i!=j && (ticketList[j].merged == 'false') && !check_j){
							if( Math.abs(ticketList[i].time - ticketList[j].time) < 30*60000) {
							var min = this.find_min(ticketList[i].data, ticketList[j].data);
							var time = min.min_start.time;
							if(min.min_start.length <= this.minLength && min.min_end.length <= this.minLength) {															
								var k = 0;
								
								do {
									time += ticketList[i]['data'][k].time ;
									k++;
								}
								while(k < min.min_start.step_index+1 );
										if(time < this.minTime*60){
											var cost = ticketList[i].cost + ticketList[j].cost ;
											this.get_time_cost(di, dj, cost, temp, arrayTemp, amount, ticketList[j], j, min);
										}
								}
							}
						}					
					}
			}
			if(temp.length){
				temp.push({trip : i});
				stats[stats.length] = {
					trip_transplant : temp
				}
				arrayTemp.push(i);
				amount += parseInt(ticketList[i].amount);
				amountArray[amountArray.length] = amount;
				start_location[start_location.length] = this.get_start_location(ticketList[i]);
				end_location[end_location.length] = this.get_end_location(ticketList[i]);
			}
		}
	return {stats: stats, amount : amountArray, start_location : start_location, end_location :end_location };
	}

	exports.assignSteps = function (time, steps, merged, cost, amount) {	 
		var data = [];
		for(var i=0; i<steps.length; i++) { 
			if(!i) {
				data.push({
					marker :steps[i].start_location,
					time : 0
				});
				data.push({
					marker :steps[i].end_location,
					time : steps[i].duration.value
				});
			}
			else {
				data.push({
					marker : steps[i].end_location,
					time : steps[i].duration.value
				});
			}
		}
		return { time: time,data: data, merged: merged, cost :cost, amount : amount} ;
	}

	exports.find_min = function (data, data1){
		var start_location_transplant = data1[0].marker; 	
		var min_start_location_transplant = 9999999999;
		var min_end_location_transplant = 9999999999;
		var end_location_transplant = data1[data1.length-1].marker;
		var stats = {};
		for(var i = 0 ; i < data.length ; i++){
			var distance_start_location_transplant = this.distance(data[i].marker,start_location_transplant);
			if(min_start_location_transplant > distance_start_location_transplant) {
				min_start_location_transplant = distance_start_location_transplant;
				stats.min_start = {
					start: start_location_transplant,
					end: data[i].marker,
					length: min_start_location_transplant,
					time :min_start_location_transplant/1000/30*3600,
					step_index : i,
				};
			}
			var distance_end_location_transplant = this.distance(data[i].marker,end_location_transplant);
			if(min_end_location_transplant > distance_end_location_transplant){
				min_end_location_transplant = distance_end_location_transplant;
				stats.min_end = {
					start: end_location_transplant,
					end: data[i].marker,
					length: min_end_location_transplant,
					time : min_end_location_transplant/1000/30*3600,
					step_index : i,
				};
			}
		}	
		return stats;
	}

	exports.distance = function (p1, p2) {
		var R = 6378137; 
		var dLat = this.rad(p2.lat - p1.lat);
		var dLong = this.rad(p2.lng - p1.lng);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	}

	exports.rad = function rad(x) {
	    return x * Math.PI / 180;
	}

	exports.get_start_location = function (ticket){
		return ticket.data[0].marker;
	}

	exports.get_end_location = function (ticket) {
		return ticket.data[ticket.data.length-1].marker;
	}

	exports.get_transplant_driver = function (amount, start_location, end_location, drivers){
		var driver = '';
		if(drivers.length){
			for(var i = 0 ; i < drivers.length ; i++){
				var minTemp_start = this.distance(start_location,drivers[0].home_location);
				var minTemp_end = this.distance(end_location,drivers[0].home_location);
				var minTemp = this.distance(start_location,drivers[0].location);
				if(drivers[i].receive == true){
					if(amount < drivers[i].loaixe){
						if(drivers[i].status == 1){
							if(this.distance(start_location,drivers[i].home_location) <= minTemp_start){
								driver = drivers[i];
							}
						}else if(drivers[i].status == 2){
							if(this.distance(end_location,drivers[i].home_location) <= minTemp_end){
								driver = drivers[i];
							}
						}else{
							if(this.distance(start_location,drivers[i].location) <= minTemp){
								driver = drivers[i];
							}
						}
					}
				}
			}
		}
		return driver;
	}

	exports.check = function(check , array){
		if(array.length){
			for(var i = 0 ; i < array.length; i++){
				if(array[i] == check){
					return true;
				}
			}
		}
		return false;
	}
	exports.get_time_cost = function(di, dj, cost, temp, arrayTemp, amount, ticketList, j, min){
		if((di.getHours() > 2 && di.getHours() < 10 ) || (dj.getHours() > 2 && dj.getHours() < 10))
		{
			if( cost >= 210000){
				temp.push({ trip : j ,data : min });
				arrayTemp.push(j);
				amount += parseInt(ticketList.amount);
			}
		}
		else if((di.getHours() > 8 && (di.getHours() <= 16 && di.getMinutes() < 31) ) || (dj.getHours() > 8 && (dj.getHours() <= 16 && dj.getMinutes() < 31) ))
		{
			if( cost >= 200000){
				temp.push({ trip : j ,data : min });
				arrayTemp.push(j);
				amount += parseInt(ticketList.amount);
			}
		}
		else
		{
			if( cost >= 180000){
				temp.push({ trip : j ,data : min });
				arrayTemp.push(j);
				amount += parseInt(ticketList.amount);
			}
		}
	}