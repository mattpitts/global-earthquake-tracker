# Global Earthquake Tracker

## Project Description

The Global Earthquake Tracker uses api data to generate reports of recent earthquakes,
displaying information like depth, magnitude, effected population, and location.
The location will be plotted on a map using coordinates derived from the api search.
The user will be able to browse through cards representing recent earthquakes and
will have the option of expanding the cards into a detailed view with links to
outside resources and a visualization of the affected region on a map.

## Feature list

* Returns a list of earthquakes from http://api.sigimera.org
* Results are formatted and placed on dynamically created cards, one for each event
* Cards can be selected to show more detailed information
* Detailed view includes a custom google map with coordinates plotted for visualization
	as well as depth, magnitude, affected population, and any other relevant data which can be acquired

* STRETCH Detailed view includes links to relevant news articles sourced from google search api
* STRETCH Latitude and longitude plotted on a 3d globe
