$("#submit").on('click',function(){
	$("#results").empty();
	var n = $(".form").length;
	var data_temp = [];
	var minLength = $("#minLength").val();
	var minTime = $("#minTime").val();
	var drivers = $("#drivers").val();
	$(".form").each(function(){
		var steps = $(this).find(".steps").val();
		var temp_time = $(this).find(".time").val();
		var	time = Date.parse(temp_time);
		var cost = $(this).find(".cost").val();
		var istransplant = $(this).find(".istransplant").val();
		var amount = $(this).find(".amount").val();
		data_temp.push({
			'steps' : steps,
			'time' : time,
			'cost' : cost,
			'istransplant' : istransplant,
			'amount' : amount,
		});
	});
	var data = { data:data_temp , minTime : minTime, minLength: minLength, drivers : drivers };
	$.ajax({
		type : 'post',
		dataType: 'json',
		data : data,
		url : "/api/ride_share_mapping",
		success: function(data){
			
		},
		error:function(){
			
		}
	});
});

$("#add").on('click',function(){
	$(".formdata").append(`
			<div class='form col-lg-12 form-group'>
				<div class="col-lg-4">
					<label>steps :</label>
					<input class="form-control steps" type="text" placeholder="steps" required="true" />
				</div>
				<div class="col-lg-3">
					<label>Time :</label>
					<input class="form-control time" type="datetime-local" placeholder="time" required="true" />
				</div>
				<div class="col-lg-2">
					<label>Cost :</label>
					<input class='form-control cost' type="number" placeholder="cost" required="true" />
				</div>
				<div class="col-lg-1">
					<label>IsTransplant:</label>
					<select class="istransplant form-control" required="true">
						<option value="true">True</option>
						<option value="false">False</option>
					</select>
				</div>
				<div class="col-lg-2">
					<label>Amount :</label>
					<input class='form-control amount' type="number" placeholder="Số Lượng" required="true" />
				</div>
			</div>
	`);
});

$("#subtr").on('click',function(){
	var n= $(".form").length;
	console.log(n);
	if(n>2){
		$(".form:last").remove();
	}else{
		alert("Số chuyến tối thiểu là 2");
	}
});