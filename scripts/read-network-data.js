/**
 * Created by mayesha on 5/24/2018.
 */

var networkData = {
    nodes : null,
    links: null
};

function fetchNetworkData() {
    var query = "   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
                    PREFIX sto: <https://w3id.org/i40/sto#>\
                        SELECT ?firstStandardLabelString ?secondStandardLabelString ?firstStandard ?secondStandard ?firstStandardCommentString ?secondStandardCommentString\
                            WHERE {\
                            ?firstStandard sto:relatedTo+|^sto:relatedTo ?secondStandard .\
                            ?firstStandard  rdfs:label ?firstStandardLabel .\
                            ?secondStandard rdfs:label  ?secondStandardLabel .\
                            ?firstStandard  rdfs:comment ?firstStandardComment . \
                            ?secondStandard  rdfs:comment ?secondStandardComment . \
                        BIND (STR(?firstStandardLabel)  AS ?firstStandardLabelString) .\
                    BIND (STR(?secondStandardLabel)  AS ?secondStandardLabelString) .\
                    BIND (STR(?firstStandardComment)  AS ?firstStandardCommentString) .\
                    BIND (STR(?secondStandardComment)  AS ?secondStandardCommentString) .\
                    } ";
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
                group: 1
            };
            nodes[data.secondStandard.value] = {
                id: data.secondStandard.value,
                label: data.secondStandardLabelString.value,
                comment: data.secondStandardCommentString.value,
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