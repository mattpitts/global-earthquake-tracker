var startTime = "&starttime=2013-01-15";
var endTime = "&endtime=2015-01-15";
var minMagnitude = "&minmagnitude=7";
var earthquakeData = [];
var earthquakeCards= [];
var earth;


$(document).ready(function() {
	getEarthquakeInfo();
	initializeCarousel();
	initializeSubmitButton();
});


function getEarthquakeInfo() {
	removeLastSearch();
	$('#submit').attr('disabled','disabled');
	$.get("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson"
		+ startTime
		+ endTime
		+ minMagnitude
		+ "&limit=1000").then(function(data) {
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
	WE.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(earth);
	updateGlobeMarkers(earth);
	console.log(earth.da.P.O);
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
		createDetailContent($(this).attr('data-index'));
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

//
// function createLoadingScreen() {
// 	let $loadContainer = $('<div>').addClass('loadingscreen');
// 	$(body).append($loadContainer);
// }
//
// function removeLoadingScreen() {
// 	$('.loadingscreen').hide();
// }

// function earthDivDebug() {
// 	let foo = $('#earth_div');
// 	console.log(foo);
// 	for (var i = 0; i < foo.length; i++) {
// 		console.log(foo[i]);
// 	}
// }
// function removeMarkers() {
// 	console.log(earth);
// }
