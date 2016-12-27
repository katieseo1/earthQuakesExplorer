
//Goblal Variables
var map;
var markers=[];
var bounds ;

var state={
  startDate:"",
  endDate:"",
  magnitude:0
};


//Initialize Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: {lat: -33.865427, lng: 151.196123},
    mapTypeId: 'satellite'
  });
}


//Magnitude Class Information
var magnitudeClassContent='<table border="1" >'+
'<tr>'+
   '<th>Magnitude	</th>'+
   '<th>Earthquake Effects</th>'+
   '<th>Estimated Number/Each Year'+
'</th>'+
'</tr>'+
'<tr>'+
   '<td>2.5 or less</td>'+
   '<td>Usually not felt, but can be recorded by seismograph.</td>'+
   '<td>900,000</td>'+
 '</tr>'+
 '<tr>'+
   '<td>2.5 to 5.4</td>'+
   '<td>Often felt, but only causes minor damage.</td>'+
   '<td>30,000</td>'+
 '</tr>'+
 '<tr>'+
   '<td>5.5 to 6.0</td>'+
   '<td>Slight damage to buildings and other structures.</td>'+
   '<td>500</td>'+
 '</tr>'+
 '<tr>'+
   '<td>6.1 to 6.9</td>'+
   '<td>May cause a lot of damage in very populated areas.</td>'+
   '<td>100</td>'+
 '</tr>'+
 '<tr>'+
   '<td>7.0 to 7.9</td>'+
   '<td>Major earthquake. Serious damage.</td>'+
   '<td>20</td>'+
 '</tr>'+
 '<tr>'+
   '<td>8.0 or greater</td>'+
   '<td>Great earthquake. Can totally destroy communities near the epicenter.</td>'+
   '<td>One every 5 to 10 years</td>'+
 '</tr>'+
'</table>';

//Get data from USGS API call
function getDataFromApi(state, callback) {
  var geoURL='https://earthquake.usgs.gov/fdsnws/event/1/query';
  var settings = {
    url: geoURL,
    data: {
      starttime: state.startDate,
      endtime:state.endDate,
      minmagnitude:state.magnitude,
      format: 'geojson',
      limit:'1000'
    },
    dataType: 'json',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}

//Handle Search request
function searchEarthquake(){
  state.startDate =  $("#startDate").data('datepicker').getFormattedDate('yyyy-mm-dd');
  state.endDate =  $("#endDate").data('datepicker').getFormattedDate('yyyy-mm-dd');
  var magnitude= $('#magnitudeInput').val();
  if (state.startDate>state.endDate){
    bootbox.alert({
    size: 'small',
    message: 'Start Date should be eariler than End date'
    });
    return;
  }
  if (isNaN(magnitude))
  {
    bootbox.alert({
    size: 'small',
    message: 'Magnitude need to be a number'
    });
  }
  else{
    state.magnitude=magnitude;
    getDataFromApi(state,displayData);
  }
}

//Remove markers from the map
function removeMarkers(){
    for(i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
  }

//Display data on the map
function displayData(data){
  removeMarkers();
  var infowindow = new google.maps.InfoWindow({
            content: ""
    })
    var msg;
    if (data.features.length==0){
      msg="No result for the given parameter";
    }
    else{
      msg="  " + data.features.length + "  found";
      if (data.features.length==1000){
          msg+= "(Result's limit is 1000)"
        }
    }

    bootbox.alert({
    message: msg,
    size: 'small'
    });

  for (var i = 0; i < data.features.length; i++) {
    var coords = data.features[i].geometry.coordinates;
    var earthquakeDate= new Date(data.features[i].properties.time);
    var latLng = new google.maps.LatLng(coords[1],coords[0]);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      html:"Magnitude : " +data.features[i].properties.mag +"<br> Location: "+ data.features[i].properties.place + "<br> Time:"+earthquakeDate
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(this.html);
      infowindow.open(map, this);
    });
  }
}

//Handle magnitude scale change

$('.btn-number').click(function(e){
    e.preventDefault();
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');

    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
    state.magnitude=input.val();
});

//Document Ready
$( function() {
    $( "#startDate" ).datepicker({ dateFormat: 'yyyy-mm-dd' });
    $("#startDate").datepicker('setDate', new Date());
    $( "#endDate" ).datepicker({ dateFormat: 'yyyy-mm-dd' });
    $("#endDate").datepicker('setDate', new Date());
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle=popover]').popover({
        content: magnitudeClassContent,
        html: true
    }).click(function() {
        $(this).popover('show');
    });
  } );
