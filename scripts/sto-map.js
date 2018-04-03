var sto_map;
$(document).ready(function(){
    sto_map = L.map('sto_map').setView([51.9375, 6.9603], 3);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibXRhc25pbSIsImEiOiJjamYzMTU2aGswanBhMzNwZDJyNmxxM2hsIn0.wNIVvFJ-cTYpZxeH2ZS9NA'
    }).addTo(sto_map);
});

function loadHeadquarters(countryList){
    for(var i in countryList){
        var obj = countryList[i];
        if(coordinates[obj.country] !== undefined){
            var m = L.marker(coordinates[obj.country]).addTo(sto_map);
            var initiative = obj.initiative;
            var iName = initiative.split("#")[1].replace("_", " ");
            m.bindPopup("<b>Headquarter of Initiative</b><br><a href='" + initiative +  "'>" + iName + "</a> ");
        }
    }
}

function refreshMap() {
    sto_map.invalidateSize();
    sto_map.setView([51.9375, 6.9603], 3);
}