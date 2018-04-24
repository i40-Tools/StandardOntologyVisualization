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
    console.log(countryList);
    for(var i in countryList){
        var obj = countryList[i];
        console.log(obj);
        var m = L.marker(obj.location);
        m.properties = {};
        var initiative = obj.initiative;
        var iName = obj.name;
        m.bindPopup(obj.abbr !== undefined ? "<b>" + iName + "</b>(" + obj.abbr + ")" : "<b>" + iName + "</b>");
        m.properties.countryName = parseCountryName(obj.country);
        m.properties.name = obj.name;
        m.properties.comment = obj.comment;
        m.properties.abbr = obj.abbr;
        m.properties.initiative = obj.initiative;
        m.on('click', function (e) {
            var obj = e.sourceTarget.properties;
            var info = "<h4>" + obj.name + "</h4></br><b>Located In: </b>" + obj.countryName + "</br></br>" + obj.comment + "</br></br><a href='" + obj.initiative + "'>More information on " + obj.abbr + "</a>";
            showInfo(info);
        });
        m.addTo(sto_map);
    }
}

function refreshMap() {
    sto_map.invalidateSize();
    sto_map.setView([51.9375, 6.9603], 3);
}

function parseCountryName(string) {
    var str =  string.replace("+", " ");
    return str.replace("_", " ");
}