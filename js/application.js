var startTime = "&starttime=2013-01-15";
var endTime = "&endtime=2015-01-15";
var minMagnitude = "&minmagnitude=7";
var earthquakeData = [];
var earthquakeCards= [];
var indexesByDistance = [];
var earth;


$(document).ready(function() {
	getEarthquakeInfo();
	initializeCarousel();
	initializeSubmitButton();
	// let test = findDistance(39.7392, 104.9903, 32.7767, 96.7970);
	// console.log(test/1000);
	//should be 1066.30 kilometers
});


function getEarthquakeInfo() {
	removeLastSearch();
	$('#submit').attr('disabled','disabled');
	$.get("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
		+ startTime
		+ endTime
		+ minMagnitude
		+ "&limit=400").then(function(data) {
			createEarthquakeData(data);
			$('#submit').removeAttr('disabled');
			$('.loadingscreen').fadeOut(250);
	});
}


function createEarthquakeData(data) {
	for (var i = 0; i < data.features.length; i++) {
		earthquakeData.push(data.features[i]);
		earthquakeData[i].index = i;
		createEarthquakeCard(earthquakeData[i]);
	}
	initializeGlobe();
}


function createEarthquakeCard(earthquake) {
	let $cardContainer = $('<div>').addClass('card').append($('<div>').addClass('card-header text-center').text(earthquake.properties.mag));
	let $cardBlock = $('<div>').addClass('card-block'); //.append($('<div>').addClass('card-title text-center').text('Location'));
	let $location = $('<p>').text(earthquake.properties.place).addClass('card-text');
	let $detailsButton = $('<button>').text("Details").addClass('btn btn-primary btn-sm').attr('data-index', earthquake.index.toString());
	$cardBlock.append($location);
	$cardContainer.append($cardBlock);
	$cardContainer.append($('<div>').addClass('card-footer').append($detailsButton));
	earthquakeCards.push($cardContainer);
		if(earthquakeCards.length < 6) {
			$('#carouselcontainer').append($cardContainer);
		}
}


function initializeCarousel() {
	$('#carouselcontainer').on('click','.btn', function() {
		let index = $(this).attr('data-index');
		createDetailContent(index);
		centerGlobeOnEarthquake(index);
	});
}


function initializeGlobe() {
    var options = { zoom: 2.5, position: [17,132] };
    earth = new WE.map('earth_div', options);
	WE.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(earth);
	// $('#earth_div').css('background-color', 'black');
	updateGlobeMarkers(earth);
 }


function updateGlobeMarkers(earth) {
	for (var i = 0; i < earthquakeData.length; i++) {
		let lattitude = Number(earthquakeData[i].geometry.coordinates[0]);
		let longitude = Number(earthquakeData[i].geometry.coordinates[1]);
		let newMarker = WE.marker([longitude,lattitude]);
		// newMarker.element
		newMarker.element.childNodes["0"].setAttribute('data-index', i);
		// console.log(newMarker.element.childNodes["0"].outerHTML);
		newMarker.addTo(earth);
	}
	initializeGlobeMarkerListener();
}


function createDetailContent(index) {
	$('#detailcontainer').empty();
	let $detailsCard = $('<div>').addClass('card detailscard');
	$detailsCard.append($('<div>').addClass('card-header').text("Details"));
	let $detailsCardBlock = $('<div>').addClass('card-block');
	$detailsCardBlock.append($('<h3>').addClass('card-title text-center').text(earthquakeData[index].properties.place));
	let $detailsList = $('<ul>').addClass('list-group');
	$detailsList.append($('<li>').addClass('list-group-item').text("Alert: " +earthquakeData[index].properties.alert));
	$detailsList.append($('<li>').addClass('list-group-item').text("Felt: " +earthquakeData[index].properties.felt));
	$detailsList.append($('<li>').addClass('list-group-item').text("Tsunami: " +earthquakeData[index].properties.tsunami));
	$detailsCardBlock.append($detailsList);
	$detailsCard.append($detailsCardBlock);
	$('#detailcontainer').append($detailsCard);
}


function initializeSubmitButton() {
	$('#submit').click(function() {
		event.preventDefault();
		startTime = "&starttime=" + $('#minimum-date').val();
		endTime = "&endtime=" + $('#maximum-date').val();
		minMagnitude = "&minmagnitude=" + $('#minimum-magnitude').val();
		$('.loadingscreen').fadeIn(150);
		getEarthquakeInfo();
	});
}


function removeLastSearch() {
	$('#carouselcontainer').empty();
	$('#detailcontainer').empty();
	$('.mapcontainer').empty();
	$('.mapcontainer').append('<div>').addClass("globe-container").attr('id', 'earth_div');
	earthquakeData = [];
	earthquakeCards = [];
}


function initializeGlobeMarkerListener() {
	$('.globe-container').on('click', '.we-pm-icon', function() {
		let index = $(this).attr('data-index');
		createDetailContent(index);
		updateEarthquakeDistances(index);
		// console.log(earthquakeData);
	});
}

function deleteMarkers() {
	for (let i in earth.da.P.O) {
		earth.da.P.O[i].removeFrom(earth);
	}
}

function centerGlobeOnEarthquake(index) {
	let lattitude = Number(earthquakeData[index].geometry.coordinates[0]);
	let longitude = Number(earthquakeData[index].geometry.coordinates[1]);
	earth.panTo([longitude,lattitude]);
}

function updateEarthquakeDistances(index) {
	let selectedLat = Number(earthquakeData[index].geometry.coordinates[0]);
	let selectedLon = Number(earthquakeData[index].geometry.coordinates[1]);
	for (var i = 0; i < earthquakeData.length; i++) {
		let checkLat = Number(earthquakeData[i].geometry.coordinates[0]);
		let checkLon = Number(earthquakeData[i].geometry.coordinates[1]);
		earthquakeData[i].distanceFromSelected = findDistance(selectedLat, selectedLon, checkLat, checkLon);
		// 	console.log(earthquakeData[i].disanceFromSelected);
	}
	findClosestQuakes(5);
}




//  Haversine method
function findDistance(lat1,long1,lat2,long2) {
	let radius = 6378137;
	let deltaLat = lat1-lat2;
	let deltaLong = long1-long2;
	let angle = 2 * Math.asin( Math.sqrt(Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLong/2), 2)));
	return angle * radius;
}

// function findClosestQuakes(num) {
// 	let lastClosestDistance = 0;
// 	let quakesFound = 0;
// 	let foundQuakesIndexes = [];
// 	// while(quakesFound <= num) {
// 		for (var i = 0; i < earthquakeData.length; i++) {
// 			if(earthquakeData[i].disanceFromSelected > lastClosestDistance) {
// 				foundQuakesIndexes.push(i);
// 				lastClosestDistance = earthquakeData[i].disanceFromSelected;
// 				quakesFound++;
// 			}
// 		}
// 	// }
// 	populateCarousel(foundQuakesIndexes);
// }

function findClosestQuakes(num) {
	let distances = [];
	for (let x = 0; x < earthquakeData.length; x++) {
		distances.push(earthquakeData[x].distanceFromSelected);
	}
	let sortedDistances = distances.sort(function(a,b) { return a - b; });
	console.log(sortedDistances);
	let foundQuakesIndexes = []
	for (var i = 1; i < num + 1; i++) {
		for(let j = 0; j < earthquakeData.length; j++) {
			if(sortedDistances[i] === earthquakeData[j].distanceFromSelected) {
				foundQuakesIndexes.push(j);
			}
		}
	}
	populateCarousel(foundQuakesIndexes);
}

function populateCarousel(indexes) {
	$('#carouselcontainer').empty();
	for (var i = 0; i < indexes.length; i++) {
		$('#carouselcontainer').append(earthquakeCards[indexes[i]]);
	}
}

// function findDistance(lat1,long1,lat2,long2) {
// 	let absoluteLongitudeDifference = long2 - long1;
// 	let centralAngle = Math.acos( Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(absoluteLongitudeDifference));
// 	return 6378137 * centralAngle;
// }
