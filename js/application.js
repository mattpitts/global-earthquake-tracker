var startTime = "&starttime=2013-01-15";
var endTime = "&endtime=2015-01-15";
var minMagnitude = "&minmagnitude=7";
var earthquakeData = [];
var indexesByDistance = [];
var carouselArray = [];
var carouselIndex = 0;
var earth;


$(document).ready(function() {
	getEarthquakeInfo();
	initializeCarousel();
	initializeCarouselEndButtons();
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
		earthquakeData[i] = {};
		earthquakeData[i].index = i;
		earthquakeData[i].latitude = data.features[i].geometry.coordinates[1];
		earthquakeData[i].longitude = data.features[i].geometry.coordinates[0];
		earthquakeData[i].depth = data.features[i].geometry.coordinates[2];
		earthquakeData[i].magnitude = data.features[i].properties.mag;
		earthquakeData[i].location = data.features[i].properties.place;
		earthquakeData[i].felt = data.features[i].properties.felt;
		earthquakeData[i].alert = data.features[i].properties.alert;
		earthquakeData[i].mmi = data.features[i].properties.mmi;
		earthquakeData[i].cardData = createEarthquakeCard(earthquakeData[i]);
	}
	initializeGlobe();
	createSortedCarouselArray('magnitude');
	populateCarousel();
	console.log(earthquakeData);
	console.log(carouselArray);
}


function populateCarousel() {
	for (var i = 0; i < 4; i++) {
		$('#carousel-cards').append(carouselArray[i]);
	}
}


function moveCarouselRight() {
	if(carouselIndex + 4 > carouselArray.length) {
		return;
	}
	$('#carousel-cards').empty().hide();
	carouselIndex += 4;
	for (var i = carouselIndex; i < carouselIndex + 4; i++) {
		$('#carousel-cards').append(carouselArray[i]);
	}
	$('#carousel-cards').fadeIn(300);
}


function moveCarouselLeft() {
	if(carouselIndex - 4 < 0) {
		return;
	}
	$('#carousel-cards').empty().hide();
	carouselIndex -= 4;
	for (var i = carouselIndex; i < carouselIndex + 4; i++) {
		$('#carousel-cards').append(carouselArray[i]);
	}
	$('#carousel-cards').fadeIn(300);
}


function createSortedCarouselArray(key) {
	let sorted = earthquakeData.sort(function(a,b) {
		return a.key - b.key;
	});
	for (var i = 0; i < sorted.length; i++) {
		carouselArray.push(sorted[i].cardData);
	}
}



function createEarthquakeCard(earthquake) {
	let coordString = earthquake.latitude + "   " + earthquake.longitude;
	let $cardContainer = $('<div>').addClass('card').append($('<div>').addClass('card-header text-center').text(earthquake.magnitude));
	let $cardBlock = $('<div>').addClass('card-block');
	let $location = $('<p>').addClass('card-text text-small').text(earthquake.location);
	let $detailsButton = $('<button>').text("Details").addClass('btn btn-primary btn-sm').attr('data-index', earthquake.index);
	$cardBlock.append($location);
	$cardContainer.append($cardBlock);
	$cardContainer.append($('<div>').addClass('card-footer').append($detailsButton));
	return $cardContainer;
}


function initializeCarousel() {
	$('#carousel-cards').on('click','.btn', function() {
		let index = $(this).attr('data-index');
		createDetailContent(index);
		centerGlobeOnEarthquake(index);
	});
}


function initializeGlobe() {
    var options = { zoom: 2.5, position: [17,132] };
    earth = new WE.map('earth_div', options);
	WE.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(earth);
	updateGlobeMarkers(earth);
 }


function updateGlobeMarkers(earth) {
	for (var i = 0; i < earthquakeData.length; i++) {
		let latitude = Number(earthquakeData[i].latitude);
		let longitude = Number(earthquakeData[i].longitude);
		let newMarker = WE.marker([latitude,longitude]);
		newMarker.element.childNodes["0"].setAttribute('data-index', i);
		newMarker.addTo(earth);
	}
	initializeGlobeMarkerListener();
}

function initializeGlobeMarkerListener() {
	$('.globe-container').on('click', '.we-pm-icon', function() {
		let index = $(this).attr('data-index');
		createDetailContent(index);
		// updateEarthquakeDistances(index);
	});
}

function createDetailContent(index) {
	let coordString = earthquakeData[index].latitude.toString() + "   " + earthquakeData[index].longitude.toString();
	$('#detailcontainer').empty();
	let $detailsCard = $('<div>').addClass('card detailscard');
	$detailsCard.append($('<div>').addClass('card-header').text(earthquakeData[index].magnitude));
	let $detailsCardBlock = $('<div>').addClass('card-block');
	$detailsCardBlock.append($('<h5>').addClass('card-title text-center').text(coordString));
	let $detailsList = $('<ul>').addClass('list-group');
	$detailsList.append($('<li>').addClass('list-group-item small').text("Location: " + earthquakeData[index].location));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Felt: " + earthquakeData[index].felt));
	$detailsList.append($('<li>').addClass('list-group-item small').text("MMI: " + earthquakeData[index].mmi));
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
	$('#carousel-cards').empty();
	// $('#detailcontainer').empty();
	$('.mapcontainer').empty();
	$('.mapcontainer').append('<div>').addClass("globe-container").attr('id', 'earth_div');
	earthquakeData = [];
}




function deleteMarkers() {
	for (let i in earth.da.P.O) {
		earth.da.P.O[i].removeFrom(earth);
	}
}

function centerGlobeOnEarthquake(index) {
	let latitude = Number(earthquakeData[index].latitude);
	let longitude = Number(earthquakeData[index].longitude);
	earth.panTo([latitude,longitude]);
}

// function updateEarthquakeDistances(selected) {
// 	let selectedLat = Number(earthquakeData[selected].latitude);
// 	let selectedLon = Number(earthquakeData[selected].longitude);
// 	for (let i = 0; i < earthquakeData.length; i++) {
// 		let checkLat = Number(earthquakeData[i].latitude);
// 		let checkLon = Number(earthquakeData[i].longitude);
// 		earthquakeData[i].distanceFromSelected = findDistance(selectedLat, selectedLon, checkLat, checkLon);
// 		// console.log(earthquakeData[i].distanceFromSelected);
// 	}
// 	findClosestQuakes(4);
// }

//  Haversine method
// function findDistance(lat1,long1,lat2,long2) {
// 	let radius = 6378137;
// 	let deltaLat = lat2-lat1;
// 	let deltaLong = long2-long1;
// 	let angle = 2 * Math.asin( Math.sqrt(Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLong/2), 2)));
// 	// let angle = 2 * Math.atan2( Math.sqrt(Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLong/2), 2)));
//
// 	return angle * radius;
// }

// function findClosestQuakes(num) {
// 	let distances = [];
// 	for (let x = 0; x < earthquakeData.length; x++) {
// 		distances.push(earthquakeData[x].distanceFromSelected);
// 	}
// 	let sortedDistances = distances.sort(function(a,b) { return a - b; });
// 	let foundQuakesIndexes = [];
// 	for (var i = 1; i < num + 1; i++) {
// 		for(let j = 0; j < earthquakeData.length; j++) {
// 			if(sortedDistances[i] === earthquakeData[j].distanceFromSelected) {
// 				foundQuakesIndexes.push(j);
// 			}
// 		}
// 	}
// 	// console.log(foundQuakesIndexes);
// 	populateCarousel(foundQuakesIndexes);
// }

// function populateCarousel(indexes) {
// 	$('#carousel-cards').empty();
// 	for (var i = 0; i < indexes.length; i++) {
// 		$(earthquakeData[indexes[i]].cardData).find('.card-text').text(Math.floor(earthquakeData[indexes[i]].distanceFromSelected/1000)+"km");
// 		$('#carousel-cards').append(earthquakeData[indexes[i]].cardData);
// 	}
// }


function initializeCarouselEndButtons() {
	$('#carousel-left-slow').click(function() {
		moveCarouselLeft();
	});
	$('#carousel-right-slow').click(function() {
		moveCarouselRight();
	});
}





//
// function findDistance(lat1,long1,lat2,long2) {
// 	let absoluteLongitudeDifference = long2 - long1;
// 	let centralAngle = Math.acos( Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(absoluteLongitudeDifference));
// 	return 6378137 * centralAngle;
// }
