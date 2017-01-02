//Goblal Variables
var map;
var markers = [];
var bounds;
var screenSize;
var state = {
	startDate: "",
	endDate: "",
	magnitude: 0
};
//Initialize Map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 2,
		center: {
			lat: -33.865427,
			lng: 151.196123
		},
		mapTypeId: 'satellite'
	});
}
//Get data from USGS API call
function getDataFromApi(state, callback) {
	var geoURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
	var settings = {
		url: geoURL,
		data: {
			starttime: state.startDate,
			endtime: state.endDate,
			minmagnitude: state.magnitude,
			format: 'geojson',
			limit: '1000'
		},
		dataType: 'json',
		type: 'GET',
		success: callback
	};
	$.ajax(settings);
}
//Handle Search request
function searchEarthquake() {
	$('.navbar-collapse').collapse('hide');
	state.startDate = $("#startDate").data('datepicker').getFormattedDate('yyyy-mm-dd');
	state.endDate = $("#endDate").data('datepicker').getFormattedDate('yyyy-mm-dd');
	var magnitude = $('#magnitudeInput').val();
	if (state.startDate > state.endDate) {
		bootbox.alert({
			size: 'small',
			message: 'Start Date should be eariler than End date'
		});
		return;
	}
	if (isNaN(magnitude)) {
		bootbox.alert({
			size: 'small',
			message: 'Magnitude need to be a number'
		});
	} else {
		state.magnitude = magnitude;
		getDataFromApi(state, displayData);
	}
}
//Remove markers from the map
function removeMarkers() {
	for (i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}
//Display data on the map
function displayData(data) {
	removeMarkers();
	var infowindow = new google.maps.InfoWindow({
		content: ""
	})
	var msg;
	if (data.features.length == 0) {
		msg = "No result for the given parameter";
	} else {
		msg = "  " + data.features.length + "  found";
		if (data.features.length == 1000) {
			msg += "(Result's limit is 1000)"
		}
	}
	bootbox.alert({
		message: msg,
		size: 'small'
	});
	for (var i = 0; i < data.features.length; i++) {
		var coords = data.features[i].geometry.coordinates;
		var earthquakeDate = new Date(data.features[i].properties.time);
		var latLng = new google.maps.LatLng(coords[1], coords[0]);
		var marker = new google.maps.Marker({
			icon: getCircle(data.features[i].properties.mag),
			position: latLng,
			map: map,
			html: "Magnitude :" + data.features[i].properties.mag + "<br> Location:" + data.features[i].properties.place + "<br> Time:" + earthquakeDate
		});
		markers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this.html);
			infowindow.open(map, this);
		});
	}
}
//Get Circle based on magnitude
function getCircle(magnitude) {
	return {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: 'red',
		fillOpacity: .2,
		scale: Math.pow(2, magnitude) / 2 * screenSize;,
		strokeColor: 'white',
		strokeWeight: .5
	};
}
//Handle magnitude scale change
$('.btn-number').click(function(e) {
	e.preventDefault();
	fieldName = $(this).attr('data-field');
	type = $(this).attr('data-type');
	var input = $("input[name='" + fieldName + "']");
	var currentVal = parseInt(input.val());
	if (!isNaN(currentVal)) {
		if (type == 'minus') {
			if (currentVal > input.attr('min')) {
				input.val(currentVal - 1).change();
			}
			if (parseInt(input.val()) == input.attr('min')) {
				$(this).attr('disabled', true);
			}
		} else if (type == 'plus') {
			if (currentVal < input.attr('max')) {
				input.val(currentVal + 1).change();
			}
			if (parseInt(input.val()) == input.attr('max')) {
				$(this).attr('disabled', true);
			}
		}
	} else {
		input.val(0);
	}
	state.magnitude = input.val();
});
//Document Ready
$(function() {
	screenSize=$(window).width()/1200;
	$("body").on("shown.bs.modal", ".modal", function() {
		$(this).css({
			'top': '50%',
			'margin-top': function() {
				return -($(this).height() / 2);
			}
		});
	});
	$('.dateDisplay').datepicker().on('changeDate', function(ev) {
		$('.datepicker').hide();
	});
	$('.dateDisplay').datepicker({
		dateFormat: 'yyyy-mm-dd',
		atuoclose: true
	});
	$('#startDate').datepicker('setDate', new Date());
	$('#endDate').datepicker('setDate', new Date());
	$('[data-toggle=popover]').popover({
		content: function() {
			var content = $(this).attr("data-popover-content");
			return $(content).children(".popover-body").html();
		},
		html: true
	}).click(function() {
		$(this).popover('show');
	});
});
