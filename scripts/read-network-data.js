/**
 * Created by mayesha on 5/24/2018.
 */

var networkData = {
    nodes : null,
    links: null
};

function fetchMolecule(standard, inference) {
    if(inference){
        var query = "   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX sto: <https://w3id.org/i40/sto#> \
                    SELECT ?secondStandardLabelString ?secondStandard \
            WHERE { \
            <" + standard + "> sto:relatedTo+|^sto:relatedTo ?secondStandard . \
            ?secondStandard rdfs:label  ?secondStandardLabel . \
            BIND (STR(?secondStandardLabel)  AS ?secondStandardLabelString) . \
        } ";
    }
    else{
        var query = "   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX sto: <https://w3id.org/i40/sto#> \
                    SELECT ?secondStandardLabelString ?secondStandard \
            WHERE { \
            <" + standard + "> sto:relatedTo ?secondStandard . \
            ?secondStandard rdfs:label  ?secondStandardLabel . \
            BIND (STR(?secondStandardLabel)  AS ?secondStandardLabelString) . \
        } ";
    }


    return fetchData(url, query);
}

function fetchNetworkData() {
    var query = "   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
        "                    PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "                    PREFIX sr: <http://www.openrdf.org/config/repository/sail#>\n" +
        "                    PREFIX st: <http://semweb.mmlab.be/ns/stoptimes#>\n" +
        "                        SELECT \t?firstStandardLabelString \n" +
        "?secondStandardLabelString \n" +
        "?firstStandard \n" +
        "?secondStandard \n" +
        "?firstStandardCommentString \n" +
        "?secondStandardCommentString\n" +
        "?firstStandardOR\n" +
        "?secondStandardOR\n" +
        "?firstStandardPD\n" +
        "?secondStandardPD\n" +
        "?firstStandardPublisher\n" +
        "?secondStandardPublisher\n" +
        "?firstStandardDev\n" +
        "?secondStandardDev\n" +
        "WHERE {\n" +
        "  ?firstStandard sto:relatedTo+|^sto:relatedTo ?secondStandard .\n" +
        "  ?firstStandard  rdfs:label ?firstStandardLabel .\n" +
        "  ?secondStandard rdfs:label  ?secondStandardLabel .\n" +
        "  ?firstStandard  rdfs:comment ?firstStandardComment . \n" +
        "  ?secondStandard  rdfs:comment ?secondStandardComment . \n" +
        "  OPTIONAL {?firstStandard  sto:hasOfficialResource ?firstStandardOR}  \n" +
        "  OPTIONAL {?secondStandard  sto:hasOfficialResource ?secondStandardOR}\n" +
        "  OPTIONAL {?firstStandard  sto:hasPublicationDate ?firstStandardDateVal}\n" +
        "  OPTIONAL {?secondStandard  sto:hasPublicationDate ?secondStandardDateVal} \n" +
        "  OPTIONAL {?firstStandard  sto:hasPublisher ?pub1 . ?pub1 rdfs:label ?firstStandardPublisherLabel . }  \n" +
        "  OPTIONAL {?secondStandard  sto:hasPublisher ?pub2 . ?pub2 rdfs:label ?secondStandardPublisherLabel}\n" +
        "  OPTIONAL {?firstStandard  sto:hasDeveloper ?dev1 . ?dev1 rdfs:label ?firstStandardDevLabel}  \n" +
        "  OPTIONAL {?secondStandard  sto:hasDeveloper ?dev2 . ?dev2 rdfs:label ?secondStandardDevLabel}\n" +
        "  BIND (STR(?firstStandardLabel)  AS ?firstStandardLabelString) .\n" +
        "  BIND (STR(?secondStandardLabel)  AS ?secondStandardLabelString) .\n" +
        "  BIND (STR(?firstStandardComment)  AS ?firstStandardCommentString) .\n" +
        "  BIND (STR(?secondStandardComment)  AS ?secondStandardCommentString) .\n" +
        "  BIND (STR(?firstStandardPublisherLabel)  AS ?firstStandardPublisher) .\n" +
        "  BIND (STR(?secondStandardPublisherLabel)  AS ?secondStandardPublisher) .\n" +
        "  BIND (STR(?firstStandardDevLabel)  AS ?firstStandardDev) .\n" +
        "  BIND (STR(?secondStandardDevLabel)  AS ?secondStandardDev) .\n" +
        "  BIND (STR(?firstStandardDateVal)  AS ?firstStandardPD) .\n" +
        "  BIND (STR(?secondStandardDateVal)  AS ?secondStandardPD) .\n" +
        "} ";
    return fetchData(url, query);
};

function fetchNonInferenceData() {
    var query = "   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
        "                    PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "                    PREFIX sr: <http://www.openrdf.org/config/repository/sail#>\n" +
        "                    PREFIX st: <http://semweb.mmlab.be/ns/stoptimes#>\n" +
        "                        SELECT \t?firstStandardLabelString \n" +
        "?secondStandardLabelString \n" +
        "?firstStandard \n" +
        "?secondStandard \n" +
        "?firstStandardCommentString \n" +
        "?secondStandardCommentString\n" +
        "?firstStandardOR\n" +
        "?secondStandardOR\n" +
        "?firstStandardPD\n" +
        "?secondStandardPD\n" +
        "?firstStandardPublisher\n" +
        "?secondStandardPublisher\n" +
        "?firstStandardDev\n" +
        "?secondStandardDev\n" +
        "WHERE {\n" +
        "  ?firstStandard sto:relatedTo ?secondStandard .\n" +
        "  ?firstStandard  rdfs:label ?firstStandardLabel .\n" +
        "  ?secondStandard rdfs:label  ?secondStandardLabel .\n" +
        "  ?firstStandard  rdfs:comment ?firstStandardComment . \n" +
        "  ?secondStandard  rdfs:comment ?secondStandardComment . \n" +
        "  OPTIONAL {?firstStandard  sto:hasOfficialResource ?firstStandardOR}  \n" +
        "  OPTIONAL {?secondStandard  sto:hasOfficialResource ?secondStandardOR}\n" +
        "  OPTIONAL {?firstStandard  sto:hasPublicationDate ?firstStandardDateVal}\n" +
        "  OPTIONAL {?secondStandard  sto:hasPublicationDate ?secondStandardDateVal} \n" +
        "  OPTIONAL {?firstStandard  sto:hasPublisher ?pub1 . ?pub1 rdfs:label ?firstStandardPublisherLabel . }  \n" +
        "  OPTIONAL {?secondStandard  sto:hasPublisher ?pub2 . ?pub2 rdfs:label ?secondStandardPublisherLabel}\n" +
        "  OPTIONAL {?firstStandard  sto:hasDeveloper ?dev1 . ?dev1 rdfs:label ?firstStandardDevLabel}  \n" +
        "  OPTIONAL {?secondStandard  sto:hasDeveloper ?dev2 . ?dev2 rdfs:label ?secondStandardDevLabel}\n" +
        "  BIND (STR(?firstStandardLabel)  AS ?firstStandardLabelString) .\n" +
        "  BIND (STR(?secondStandardLabel)  AS ?secondStandardLabelString) .\n" +
        "  BIND (STR(?firstStandardComment)  AS ?firstStandardCommentString) .\n" +
        "  BIND (STR(?secondStandardComment)  AS ?secondStandardCommentString) .\n" +
        "  BIND (STR(?firstStandardPublisherLabel)  AS ?firstStandardPublisher) .\n" +
        "  BIND (STR(?secondStandardPublisherLabel)  AS ?secondStandardPublisher) .\n" +
        "  BIND (STR(?firstStandardDevLabel)  AS ?firstStandardDev) .\n" +
        "  BIND (STR(?secondStandardDevLabel)  AS ?secondStandardDev) .\n" +
        "  BIND (STR(?firstStandardDateVal)  AS ?firstStandardPD) .\n" +
        "  BIND (STR(?secondStandardDateVal)  AS ?secondStandardPD) .\n" +
        "} ";
    return fetchData(url, query);
};

function readNetworkData(nData) {
    var promise = new Promise(function (resolve) {
        var myData = nData.results.bindings;
        var nodes = {};
        var links = [];
        for(var key in myData){
            var data = myData[key];
            nodes[data.firstStandard.value] = {
                id: data.firstStandard.value,
                label: data.firstStandardLabelString.value,
                comment: data.firstStandardCommentString.value,
                officialResource: data.firstStandardOR !== undefined ? data.firstStandardOR.value : null,
                publishDate: data.firstStandardPD !== undefined ? data.firstStandardPD.value : null,
                publisher: data.firstStandardPublisher !== undefined ? data.firstStandardPublisher.value : null,
                developer: data.firstStandardDev !== undefined ? data.firstStandardDev.value : null,
                group: 1
            };
            nodes[data.secondStandard.value] = {
                id: data.secondStandard.value,
                label: data.secondStandardLabelString.value,
                comment: data.secondStandardCommentString.value,
                officialResource: data.secondStandardOR !== undefined ? data.secondStandardOR.value : null,
                publishDate: data.secondStandardPD !== undefined ? data.secondStandardPD.value : null,
                publisher: data.secondStandardPublisher !== undefined ? data.secondStandardPublisher.value : null,
                developer: data.secondStandardDev !== undefined ? data.secondStandardDev.value : null,
                group: 1
            };
            var link = {
                source: data.firstStandard.value,
                target: data.secondStandard.value,
                value: 1
            };
            links.push(link);
        }
        networkData.nodes = Object.values(nodes);
        networkData.links = links;
        resolve(networkData);
    });
    return promise;
}

function readMoleculeData(mData) {
    var promise = new Promise(function (resolve) {
        var myData = mData.results.bindings;
        var links = [];
        for(var key in myData){
            var data = myData[key];
            links.push({
                id: data.secondStandard.value,
                label: data.secondStandardLabelString.value
            });
        }
        resolve(links);
    });
    return promise;
}