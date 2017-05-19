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
var $carouselCards;


$(function() {
	getEarthquakeInfo();
	initializeCarousel();
	initializeCarouselEndButtons();
	initializeSubmitButton();
	initializeCardOptions();
	$('#minimum-date').datepicker({});
	$('#maximum-date').datepicker({});
});


function getEarthquakeInfo() {
	removeLastSearch();
	$('#submit').attr('disabled','disabled');
	$.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson${startTime}${endTime}${minMagnitude}&limit=400`).then(function(data) {
		createEarthquakeData(data);
		$('#submit').removeAttr('disabled');
		$('.loadingscreen').fadeOut(250);
	});
}


function createEarthquakeData(data) {
	earthquakeData = [];
	dataTotals = { magTotal: 0, depthTotal: 0, mmiTotal: 0, feltTotal: 0};
	for (let i = 0; i < data.features.length; i++) {
		earthquakeData.push(createEarthquakeObject(data.features[i], i));
		earthquakeData[i].cardData = createEarthquakeCard(earthquakeData[i], keyToSortBy);
		addToDataTotals(earthquakeData[i]);
	}
	// calculateDataAverages();
	findMaxValues();
	findMinValues();
	initializeGlobe();
	populateCarousel();
}

function createEarthquakeObject(earthquake, index) {
	return {
		index: index,
		latitude: earthquake.geometry.coordinates[1],
		longitude: earthquake.geometry.coordinates[0],
		depth: earthquake.geometry.coordinates[2],
		magnitude: earthquake.properties.mag,
		location: earthquake.properties.place,
		date: createParsedDate(earthquake.properties.time),
		felt: earthquake.properties.felt,
		mmi: earthquake.properties.mmi
	};
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
	$carouselCards.empty();
	createSortedCarouselArray(keyToSortBy);
	for (var i = 0; i < 4; i++) {
		$carouselCards.append(carouselArray[i]);
	}
}


function moveCarouselRight() {
	if(carouselIndex + 4 > carouselArray.length) {
		return;
	}
	$carouselCards.empty().hide();
	carouselIndex += 4;
	for (var i = carouselIndex; i < carouselIndex + 4; i++) {
		$carouselCards.append(carouselArray[i]);
	}
	$carouselCards.fadeIn(300);
}


function moveCarouselLeft() {
	if(carouselIndex - 4 < 0) {
		return;
	}
	$carouselCards.empty().hide();
	carouselIndex -= 4;
	for (var i = carouselIndex; i < carouselIndex + 4; i++) {
		$carouselCards.append(carouselArray[i]);
	}
	$carouselCards.fadeIn(300);
}


function createSortedCarouselArray(key) {
	carouselArray = [];
	let sorted = earthquakeData.slice();
	sorted.sort(function(a,b) {
		return b[key] * 10 - a[key] * 10;
	});
	for (var i = 0; i < sorted.length; i++) {
		carouselArray.push(sorted[i].cardData);
	}
	createDetailContent(sorted[0]);
	centerGlobeOnEarthquake(sorted[0].index);
	replaceNullsWithNoData(sorted);
	return sorted;
}

function replaceNullsWithNoData(array) {
	for (var i = 0; i < array.length; i++) {
		for(let x in array[i]) {
			if(array[i][x] === null) {
				array[i][x] = "No data";
			}
		}
	}
}

function createEarthquakeCard(earthquake, key) {
	let keyText = createKeyText(key);
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
	$carouselCards = $('#carousel-cards');
	$carouselCards.on('click','.btn', function() {
		let index = $(this).attr('data-index');
		createDetailContent(earthquakeData[index]);
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
    var options = { zoom: 2.25, position: [17,132] };
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
	}
	initializeGlobeMarkerListener();
}


function initializeGlobeMarkerListener() {
	$('.globe-container').on('click', '.we-pm-icon', function() {
		let index = $(this).attr('data-index');
		createDetailContent(earthquakeData[index]);
	});
}


function createDetailContent(earthquake) {
	$('#detailcontainer').empty();
	let $detailsCard = $('<div>').addClass('card detailscard');
	$detailsCard.append($('<div>').addClass('card-header').text(earthquake.date));
	let $detailsCardBlock = $('<div>').addClass('card-block');
	let $detailsList = createDetailsList(earthquake);
	$detailsCardBlock.append($detailsList);
	$detailsCard.append($detailsCardBlock);
	$('#detailcontainer').append($detailsCard);
	setGraphValues(earthquake);
}


function createDetailsList(earthquake) {
	let $detailsList = $('<ul>').addClass('list-group');
	$detailsList.append($('<li>').addClass('list-group-item small').text("Location: " + earthquake.location));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Modified Mercali Intensity: " + earthquake.mmi));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Magnitude: " + earthquake.magnitude));
	$detailsList.append($('<li>').addClass('list-group-item small').text("Depth: " + earthquake.depth + 'km'));
	return $detailsList;
}


function setGraphValues(earthquake) {
	let magHeight = ((earthquake.magnitude / maxValues.magnitude) * 100) + '%';
	let depthHeight = ((earthquake.depth / maxValues.depth) * 100) + '%';
	// let mmiHeight = (((earthquake.mmi - minValues.mmi) / (maxValues.mmi - minValues.mmi)) * 100) + '%';// doesnt work; need to remove null values
	let mmiHeight = ((earthquake.mmi / maxValues.mmi) * 100) + '%';
	$('.graph-left').css('height', magHeight);
	$('.graph-center').css('height', depthHeight);
	$('.graph-right').css('height', mmiHeight);
}


function initializeSubmitButton() {
	$('#submit').click(function() {
		event.preventDefault();
		startTime = "&starttime=" + formatDate($('#minimum-date').val());
		endTime = "&endtime=" + formatDate($('#maximum-date').val());
		minMagnitude = "&minmagnitude=" + $('#minimum-magnitude').val();
		$('.loadingscreen').fadeIn(150);
		getEarthquakeInfo();
	});
}

function formatDate(dateString) {
	let dateStringArray = dateString.split('/');
	return dateStringArray[2] + '-' + dateStringArray[0] + '-' + dateStringArray[1];
}


function removeLastSearch() {
	$('#carouselCards').empty();
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


// function changeMarkerIcon(index) {
// 	earthquakeData[index].marker.removeFrom(earth);
// 	let newMarker = WE.marker([earthquakeData[index].latitude,earthquakeData[index].longitude],'goldStar');
// 	newMarker.element.childNodes["0"].setAttribute('data-index', index);
// 	newMarker.addTo(earth);
// }
//
//
// var goldStar = {
//           path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
//           fillColor: 'yellow',
//           fillOpacity: 0.8,
//           scale: 1,
//           strokeColor: 'gold',
//           strokeWeight: 14
//         };





//
// function findDistance(lat1,long1,lat2,long2) {
// 	let absoluteLongitudeDifference = long2 - long1;
// 	let centralAngle = Math.acos( Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(absoluteLongitudeDifference));
// 	return 6378137 * centralAngle;
// }
