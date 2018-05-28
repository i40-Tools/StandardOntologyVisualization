function fetchMapData() {
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>  \
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        SELECT DISTINCT ?org ?name ?abb ?comment ?label ?location \
        WHERE { \
        ?org rdf:type sto:StandardOrganization . \
        ?org sto:hasHeadquaterIn ?location . \
        OPTIONAL {?org sto:abbreviation ?abb} . \
    OPTIONAL {?org  rdfs:comment  ?comment} . \
    OPTIONAL {?org rdfs:label ?label } . \
    OPTIONAL {?org sto:orgName ?name} . \
    FILTER( LANG(?comment) = '' || langMatches( lang(?comment), 'en' ) ) \
    FILTER( LANG(?name) = '' || langMatches( lang(?name), 'en' ) ) \
    FILTER( !bound(?label) || langMatches( lang(?label), 'en' ) ) \
}";
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
                country: parseLocationForGoogle(obj.location.value),
                initiative: obj.org.value,
                name: obj.name === undefined ? obj.label.value : obj.name.value,
                abbr: obj.abb === undefined ? obj. label.value : obj.abb.value,
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
                    key: "AIzaSyBKPsQnSgddKK0ty7qGhnjo3bBOowRxYOU",
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