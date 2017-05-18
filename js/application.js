var startTime = "&starttime=2013-01-15";
var endTime = "&endtime=2015-01-15";
var minMagnitude = "&minmagnitude=7";
var earthquakeData = [];
var keyToSortBy = 'magnitude';
var carouselArray = [];
var carouselIndex = 0;
var dataTotals = {};
var dataAverages = {};
var maxValues = {};
var minValues = {};
var earth;


$(document).ready(function() {
	getEarthquakeInfo();
	initializeCarousel();
	initializeCarouselEndButtons();
	initializeSubmitButton();
	initializeCardOptions();
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
	earthquakeData = [];
	dataTotals = { magTotal: 0, depthTotal: 0, mmiTotal: 0, feltTotal: 0};
	for (let i = 0; i < data.features.length; i++) {
		earthquakeData[i] = {};
		earthquakeData[i].index = i;
		earthquakeData[i].latitude = data.features[i].geometry.coordinates[1];
		earthquakeData[i].longitude = data.features[i].geometry.coordinates[0];
		earthquakeData[i].depth = data.features[i].geometry.coordinates[2];
		earthquakeData[i].magnitude = data.features[i].properties.mag;
		earthquakeData[i].location = data.features[i].properties.place;
		earthquakeData[i].date = createParsedDate(data.features[i].properties.time);
		if(data.features[i].properties.felt === null) {
			earthquakeData[i].felt = 0;
		}
		else {
			earthquakeData[i].felt = data.features[i].properties.felt;
		}
		earthquakeData[i].alert = data.features[i].properties.alert;
		earthquakeData[i].mmi = data.features[i].properties.mmi;
		earthquakeData[i].cardData = createEarthquakeCard(earthquakeData[i], keyToSortBy);
		addToDataTotals(earthquakeData[i]);
	}
	// calculateDataAverages();
	findMaxValues();
	findMinValues();
	initializeGlobe();
	populateCarousel();
}


function createParsedDate(msSinceEpoch) {
	let date = new Date(msSinceEpoch).toString().split('');
	let sliceIndexEnd = date.indexOf('G') - 1;
	let sliceIndexStart = date.indexOf(' ');
	return date.join('').substring(sliceIndexStart,sliceIndexEnd);
}


function addToDataTotals(data) {
	dataTotals.magTotal += data.magnitude;
	dataTotals.depthTotal += data.depth;
	dataTotals.mmiTotal += data.mmi;
	dataTotals.feltTotal += data.felt;
}
// function calculateDataAverages() {
// 	dataAverages.magnitude = dataTotals.magTotal / earthquakeData.length;
// 	dataAverages.depth = dataTotals.depthTotal / earthquakeData.length;
// 	dataAverages.mmi = dataTotals.mmiTotal / earthquakeData.length;
// 	dataAverages.felt = dataTotals.feltTotal / earthquakeData.length;
// }

function findMaxValues() {
	maxValues = { magnitude: 0, mmi: 0, depth: 0, felt: 0};
	for (var i = 0; i < earthquakeData.length; i++) {
		if(earthquakeData[i].magnitude > maxValues.magnitude) {
			maxValues.magnitude = earthquakeData[i].magnitude;
		}
		if(earthquakeData[i].depth > maxValues.depth) {
			maxValues.depth = earthquakeData[i].depth;
		}
		if(earthquakeData[i].mmi > maxValues.mmi) {
			maxValues.mmi = earthquakeData[i].mmi;
		}
		if(earthquakeData[i].felt > maxValues.felt) {
			maxValues.felt = earthquakeData[i].felt;
		}
	}
}


function findMinValues() {
	minValues = {
		magnitude: 	earthquakeData[0].magnitude,
		mmi: 		earthquakeData[0].mmi,
		depth:		earthquakeData[0].depth,
		felt: 		earthquakeData[0].felt
	};
	for (var i = 1; i < earthquakeData.length; i++) {
		if(earthquakeData[i].magnitude < minValues.magnitude) {
			minValues.magnitude = earthquakeData[i].magnitude;
		}
		if(earthquakeData[i].depth > minValues.depth) {
			minValues.depth = earthquakeData[i].depth;
		}
		if(earthquakeData[i].mmi > minValues.mmi) {
			minValues.mmi = earthquakeData[i].mmi;
		}
		if(earthquakeData[i].felt > minValues.felt) {
			minValues.felt = earthquakeData[i].felt;
		}
	}
}


function populateCarousel() {
	carouselIndex = 0;
	$('#carousel-cards').empty();
	createSortedCarouselArray(keyToSortBy);
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
	carouselArray = [];
	let sorted = earthquakeData.slice();
	sorted.sort(function(a,b) {
		return b[key] * 10 - a[key] * 10;
	});
	console.log(earthquakeData);
	for (var i = 0; i < sorted.length; i++) {
		carouselArray.push(sorted[i].cardData);
	}
	createDetailContent(sorted[0].index);
	centerGlobeOnEarthquake(sorted[0].index);
	return sorted;
}


function createEarthquakeCard(earthquake, key) {
	let keyText = createKeyText(key);
	let coordString = earthquake.latitude + "   " + earthquake.longitude;
	let $cardContainer = $('<div>').addClass('card').append($('<div>').addClass('card-header text-center').text(keyText + earthquake[key]));
	let $cardBlock = $('<div>').addClass('card-block');
	let $location = $('<p>').addClass('card-text text-small').text(earthquake.location);
	let $detailsButton = $('<button>').text("Details").addClass('btn btn-primary btn-sm').attr('data-index', earthquake.index);
	$cardBlock.append($location);
	$cardContainer.append($cardBlock);
	$cardContainer.append($('<div>').addClass('card-footer').append($detailsButton));
	return $cardContainer;
}


function createKeyText(key) {
	let keyArray = key.split('');
	keyArray[0] = keyArray[0].toUpperCase();
	return keyArray.join('') + ': ';
}


function initializeCardOptions() {
	$('#card-options').change(function() {
		keyToSortBy = $('#card-options option:selected').attr('value');
		createNewEarthquakeCards();
	});
}


function createNewEarthquakeCards() {
	for (var i = 0; i < earthquakeData.length; i++) {
		earthquakeData[i].cardData = createEarthquakeCard(earthquakeData[i], keyToSortBy);
	}
	populateCarousel();
}


function initializeCarousel() {
	$('#carousel-cards').on('click','.btn', function() {
		let index = $(this).attr('data-index');
		createDetailContent(index);
		centerGlobeOnEarthquake(index);
	});
}


function initializeCarouselEndButtons() {
	$('#carousel-left-slow').click(function() {
		moveCarouselLeft();
	});
	$('#carousel-right-slow').click(function() {
		moveCarouselRight();
	});
}


function initializeGlobe() {
    var options = { zoom: 2.5, position: [17,132] };
    earth = new WE.map('earth_div', options);
	WE.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(earth);
	updateGlobeMarkers(earth);
 }


function updateGlobeMarkers(earth) {
	for (let i = 0; i < earthquakeData.length; i++) {
		let latitude = Number(earthquakeData[i].latitude);
		let longitude = Number(earthquakeData[i].longitude);
		let newMarker = WE.marker([latitude,longitude]);
		newMarker.element.childNodes["0"].setAttribute('data-index', i);
		newMarker.addTo(earth);
		earthquakeData[i].marker = newMarker;
		console.log(newMarker);
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
	let coordString = (Math.round(earthquakeData[index].latitude * 100) /100).toString() + "   " + (Math.round(earthquakeData[index].longitude * 100) /100).toString();
	$('#detailcontainer').empty();
	let $detailsCard = $('<div>').addClass('card detailscard');
	$detailsCard.append($('<div>').addClass('card-header').text(earthquakeData[index].date));
	let $detailsCardBlock = $('<div>').addClass('card-block');
	let $detailsList = createDetailsList(index);
	$detailsCardBlock.append($detailsList);
	$detailsCard.append($detailsCardBlock);
	$('#detailcontainer').append($detailsCard);
	setGraphValues(index);
}


function createDetailsList(index) {
	let $detailsList = $('<ul>').addClass('list-group');
	$detailsList.append($('<li>').addClass('list-group-item small').text("Location: " + earthquakeData[index].location));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Modified Mercali Intensity: " + earthquakeData[index].mmi));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Magnitude: " + earthquakeData[index].magnitude));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Depth: " + earthquakeData[index].depth + 'km'));
	return $detailsList;
}


function setGraphValues(index) {
	// let magRange = maxValues.magnitude - minValues.magnitude;
	let magHeight = (((earthquakeData[index].magnitude - minValues.magnitude) / (maxValues.magnitude - minValues.magnitude)) * 100) + '%';
	let depthHeight = ((earthquakeData[index].depth / maxValues.depth) * 100) + '%';
	let mmiHeight = (((earthquakeData[index].mmi - minValues.mmi) / (maxValues.mmi - minValues.mmi)) * 100) + '%';
	$('.graph-left').css('height', magHeight);
	$('.graph-center').css('height', depthHeight);
	$('.graph-right').css('height', mmiHeight);
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
// }









//
// function findDistance(lat1,long1,lat2,long2) {
// 	let absoluteLongitudeDifference = long2 - long1;
// 	let centralAngle = Math.acos( Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(absoluteLongitudeDifference));
// 	return 6378137 * centralAngle;
// }
