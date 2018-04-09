function readTimeData(oData) {
    var tData = [];
    var promise = new Promise(function (resolve) {
        var list = oData.results.bindings;
        for(var key in list){
            var org = list[key];
            tData.push({
                name: org.name.value,
                date: new Date(org.date.value)
            })
        }
        resolve(tData);
    });

    return promise;
}

function fetchTimeData(){
    var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        SELECT DISTINCT ?date ?name \
        WHERE { \
        ?org rdf:type sto:StandardOrganization . \
        ?org sto:formationDate ?date . \
        ?org rdfs:label ?name . FILTER( langMatches( lang(?name), 'en' ) ) \
} ORDER BY ?date";
    return fetchData(url, query);
}

