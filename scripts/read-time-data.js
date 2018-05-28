function readTimeData(oData) {
    var tData = {};
    var promise = new Promise(function (resolve) {
        var list = oData.results.bindings;
        for (var key in list) {
            var org = list[key];
            tData[org.org.value] = {
                id: org.org.value,
                name: org.name === undefined ? org.label === undefined ? org.abb.value : org.label.value : org.name.value,
                date: new Date(org.date.value),
                abbr: org.abb === undefined ? "" : org.abb.value,
                comment: org.comment.value
            };
        }
        resolve(Object.values(tData));
    });

    return promise;
}

function fetchTimeData() {
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        SELECT DISTINCT ?org ?date ?name ?abb ?comment ?label \
        WHERE { \
        ?org rdf:type sto:StandardOrganization . \
        ?org sto:formationDate ?date . \
        OPTIONAL {?org sto:abbreviation ?abb} . \
    OPTIONAL {?org  rdfs:comment  ?comment} . \
    OPTIONAL {?org rdfs:label ?label} . \
    OPTIONAL {?org sto:orgName ?name }. \
    FILTER( !bound(?label) || langMatches( lang(?label), 'en' ) ) \
    FILTER( !bound(?comment) ||langMatches( lang (?comment), 'en' ) ) \
    FILTER( !bound(?name) ||langMatches( lang (?name), 'en' ) ) \
} ORDER BY ?date";
    return fetchData(url, query);
}

