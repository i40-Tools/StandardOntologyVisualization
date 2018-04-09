function fetchMapData() {
    var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
    var query = "SELECT ?subject ?object WHERE { ?subject <https://w3id.org/i40/sto#hasHeadquaterIn> ?object . }";
    return fetchData(url, query);
};

function parseCountryUri(string) {
    var country = string.split('#')[1];
    return country.replace("_", " ");
}

function parseLocationForGoogle(string) {
    var country = string.split('#')[1];
    return country.replace("_", "+");
}


function readMapData(data) {
    var promise = new Promise(function (resolve) {
        var countryData = data.results.bindings;
        var countryList = [];
        for (var i in countryData) {
            var obj = countryData[i];
            var mapData = {
                "country" : parseLocationForGoogle(obj.object.value),
                "initiative" : obj.subject.value
            };
            countryList.push(mapData);
        }
        resolve(countryList);
    });
    return promise;
}

function addCoordinates(list) {
    var promise = new Promise(function (resolve) {
        var async_requests = [];
        var full_list = [];
        for (var key in list) {
            var org = list[key];
            var location = org.country;
            async_requests.push($.ajax({
                url: "https://maps.googleapis.com/maps/api/geocode/json",
                type: "GET", //send it through get method
                data: {
                    key: "AIzaSyAFDsfENF5ouq4B1FeykYDE8tY2NVVlGqQ",
                    address: location
                },
                success: function (response) {
                    var coord = [response.results[0].geometry.location.lat, response.results[0].geometry.location.lng];
                    full_list.push(coord)
                }
            }));
        }

        $.when.apply(null, async_requests).done(function () {
            list.map(function (obj, index) {
                obj.location = full_list[index];
            });
            resolve(list);
        });
    });
    return promise;
}