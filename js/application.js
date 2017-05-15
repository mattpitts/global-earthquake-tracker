var startTime = "2000-01-15";
var endTime = "2017-04-01";
var minMagnitude = "7";
var earthquakeData = [];
var earthquakeCards= [];
var earth;

$(document).ready(function() {
	getEarthquakeInfo();
});



function getEarthquakeInfo() {
	$.get("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime="+startTime+
	"&endtime="+endTime+
	"&minmagnitude="+minMagnitude).then(function(data) {
		createEarthquakeData(data);
	});
}
function createEarthquakeData(data) {
	for (var i = 0; i < data.features.length; i++) {
		earthquakeData.push(data.features[i]);
		earthquakeData[i].index = i;
		createEarthquakeCard(earthquakeData[i]);
	}
	console.log(earthquakeData);
	initializeGlobe();
}
function createEarthquakeCard(earthquake) {
	let $cardContainer = $('<div>').addClass('card');
	let $newCard = $('<div>').addClass('card-block');
	let $title = $('<h5>').text(earthquake.properties.mag).addClass('card-title text-center');
	let $location = $('<p>').text(earthquake.properties.place).addClass('card-text');
	let $detailsButton = $('<button>').text("Details").addClass('btn btn-primary btn-sm details-button').attr('index', earthquake.index.toString()).css('align-self','flex-end');
	// let $mapButton = $('<button>').text("Center Map").addClass('btn btn-secondary btn-sm map-button').attr('type', 'button');
	$newCard.append($title);
	$newCard.append($location);
	$newCard.append($detailsButton);
	// $newCard.append($mapButton);
	$cardContainer.append($newCard);
	earthquakeCards.push($newCard);
		if(earthquakeCards.length < 6) {
			$('#carouselcontainer').append($cardContainer);
		}
}

function initializeGlobe() {
	console.log('initializing globe');
    var options = { zoom: 2.5, position: [17,132] };
    var earth = new WE.map('earth_div', options);
	WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(earth);
	updateGlobeMarkers(earth);
	console.log(earth);
 }

function updateGlobeMarkers(earth) {
	for (var i = 0; i < earthquakeData.length; i++) {
		let lattitude = Number(earthquakeData[i].geometry.coordinates[0]);
		let longitude = Number(earthquakeData[i].geometry.coordinates[1]);
		let newMarker = WE.marker([longitude,lattitude]).addTo(earth);
	}
}
$("#title").on('mouseenter',function() {
	alert('kj');
});
