function readTimeData(oData) {
    var tData = {};
    var promise = new Promise(function (resolve) {
        var list = oData.results.bindings;
        for (var key in list) {
            var org = list[key];
            tData[org.org.value] = {
                name: org.name === undefined ? org.label.value : org.name.value,
                date: new Date(org.date.value),
                abbr: org.abb.value,
                comment: org.comment.value
            };
        }
        resolve(Object.values(tData));
    });

    return promise;
}

function fetchTimeData() {
    var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        SELECT DISTINCT ?org ?date ?name ?abb ?comment ?label \
        WHERE { \
        ?org rdf:type sto:StandardOrganization . \
        ?org sto:abbreviation ?abb . \
        ?org sto:formationDate ?date . \
        ?org  rdfs:comment  ?comment . \
        ?org rdfs:label ?label . \
        ?org sto:orgName ?orgName . \
    FILTER( langMatches( lang(?label), 'en' ) ) \
        FILTER( langMatches( lang (?comment), 'en' ) ) \
} ORDER BY ?date";
    return fetchData(url, query);
}

