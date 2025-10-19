var map = L.map('map').setView([51.505, -0.09], 3);
L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var lat = -1;
var lng = -1;

function onMapClick(e) {

    lat = e.latlng.lat;
    lng = e.latlng.lng;

    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.remove();
        }
    });
    L.marker([lat, lng]).addTo(map);

}

map.on('click', onMapClick);
makeGuess = function () {

    if (lat == -1 || lng == -1) {

        alert("Please select a location on the map first!")
    } else {
        //Submit guess
        const fullname = localStorage.getItem("fullname");
        const email = localStorage.getItem("email");
        if (fullname == null || email == null) {
            alert("You are not logged in!");
            window.location.href = window.location.origin + '/index.html';
            return;
        }

        fetch("/api/makeGuess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, email, lat, lng }),
        }).then(response => response.json()).then(data => {
            console.log(data.message);
        });
        localStorage.clear();
        alert("Your guess has been submitted!");
        window.location.href = "index.html";
    }
}