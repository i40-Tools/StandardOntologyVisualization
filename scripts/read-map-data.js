function fetchMapData() {
    var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>  \
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        SELECT DISTINCT ?org ?name ?abb ?comment ?label ?location \
        WHERE { \
        ?org rdf:type sto:StandardOrganization . \
        ?org sto:abbreviation ?abb . \
        ?org  rdfs:comment  ?comment . \
        ?org rdfs:label ?label . \
        ?org sto:orgName ?orgName . \
        ?org sto:hasHeadquaterIn ?location . \
    FILTER( langMatches( lang(?label), 'en' ) ) \
        FILTER( langMatches( lang (?comment), 'en' ) ) \
} ";
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
        var countryList = {};
        for (var i in countryData) {
            var obj = countryData[i];
            countryList[obj.org.value] = {
                country : parseLocationForGoogle(obj.location.value),
                initiative : obj.org.value,
                name: obj.name === undefined ? obj.label.value : obj.name.value,
                abbr: obj.abb.value,
                comment: obj.comment.value
            };
        }
        resolve(Object.values(countryList));
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