var droneIcon = L.icon({
	iconUrl: 'drone.png',
	shadowUrl: 'drone-shadow.png',

	iconSize:     [86, 39], // size of the icon
	shadowSize:   [99, 49], // size of the shadow
	iconAnchor:   [43, 74], // point of the icon which will correspond to marker's location
	shadowAnchor: [50, 25],  // the same for the shadow
	popupAnchor:  [0, -3] // point from which the popup should open relative to the iconAnchor
});

var followDrone = true;
var mapElement = document.getElementById("map");
var map;
var drone;
var droneCurrentCoordinates;
var droneTargetCoordinates;
var moveStep = 1.0;
var trailList = [];
var trailLine;
window.onresize = onWindowResize;

init();
spawnDrone([55.71862045535753, 13.2208389043808]);

function init() {
	onWindowResize();

	map = L.map('map').setView([55.71862045535753, 13.2208389043808], 19);
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);
	map.on('click', onMapClick);
}

// This can't be set through css since it needs to be static
function onWindowResize() {
	mapElement.style.height = window.innerHeight + "px";
}

function onMapClick(e) {
	moveDrone([e.latlng.lat, e.latlng.lng]);
}

function spawnDrone(coordinates) {
	droneTargetCoordinates = coordinates;
	drone = L.marker(coordinates, {icon: droneIcon});
	drone.addTo(map);
	addTrailPoint(coordinates);
}

function teleportDrone(coordinates) {
	droneCurrentCoordinates = coordinates;
	droneTargetCoordinates = coordinates;
	drone.setLatLng(coordinates);
}

function moveDrone(coordinates) {
	var currentPos = drone.getLatLng();
	droneCurrentCoordinates = [currentPos.lat, currentPos.lng];
	droneTargetCoordinates = coordinates;
	moveStep = 0.0;
	moveLoop();
	addTrailPoint(coordinates);
}

async function moveLoop() {
	while (moveStep < 1.0) {
		var moveStepMilliseconds = 2;
		moveStep += moveStepMilliseconds / 200.0;
		if (moveStep > 1.0) { moveStep = 1.0; }
		var direction = subtract(droneTargetCoordinates, droneCurrentCoordinates);
		var newPos = add(droneCurrentCoordinates, multiply(direction, moveStep));

		drone.setLatLng(newPos);
		if (followDrone) map.panTo(drone.getLatLng(), {animate: false});
		await sleep(moveStepMilliseconds);
	}
}

function addTrailPoint(coordinates) {
	if (trailLine == null) {
		trailLine = L.polyline([], {color: '#fc3', opacity: 0.4}).addTo(map)
	}
	trailLine.addLatLng(coordinates);
}

function clearTrail() {
	trailLine.setLatLngs([]);
}

function multiply(a, b) {
	return [a[0] * b, a[1] * b];
}

function add(a, b) {
	return [a[0] + b[0], a[1] + b[1]];
}

function subtract(a, b) {
	return [a[0] - b[0], a[1] - b[1]];
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
