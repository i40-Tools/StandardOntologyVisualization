
function fetchFrameworks(isConcern){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT ?frameworkId (SAMPLE(?frameworkL) AS ?frameworkLabel)\n" +
        "WHERE\n" +
        "{\n" +
        "  \t?frameworkId a sto:StandardizationFramework .  \n" +
        "  \t?frameworkId rdfs:label ?framework .\n" +
        "  \t?class sto:isDescribedin ?frameworkId .\n" +
        "  \t?standard sto:hasClassification ?class . \n" +
        "    BIND(str(?framework) AS ?frameworkL)\n" +
        "}\n" +
        "GROUP BY ?frameworkId";
    if(isConcern){
        query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
            "SELECT DISTINCT ?frameworkId ?frameworkLabel\n" +
            "WHERE\n" +
            "{\n" +
            "  \t?frameworkId rdfs:label ?frameworkLabel .\n" +
            "  \t?class sto:isDescribedin ?frameworkId .\n" +
            "  \t?class sto:frames ?concern .\n" +
            "}";
    }
    return fetchData(url, query);
}


function fetchDetails(standard){
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT DISTINCT ?detail WHERE {<" + standard + "> rdfs:comment ?detail}";
    return fetchData(url, query);
}


function fetchClassificationsAndConcerns(queryString){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?cl_label ?cl_comment ?framework ?classification2 ?relation2 ?classification ?cl2_label\n" +
        "WHERE\n" +
        "{\n" +
        "?classification rdfs:label ?cl_label .\n" +
        "?classification sto:isDescribedin ?frameworkId .\n" +
        "?frameworkId rdfs:label ?framework .\n" +
        "OPTIONAL { ?classification rdfs:comment ?cl_comment . }\n" +
        "OPTIONAL {\n" +
        "?classification sto:frames ?classification2 .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        "sto:frames rdfs:label ?relation2 .\n" +
        "}\n" +
        " FILTER ( ?frameworkId IN (" + queryString + ") )\n" +
        "} ";
    return fetchData(url, query);
}

function fetchFrameworksAndConcerns(queryString){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?cl_label ?cl_comment ?framework ?classification2 ?relation2 ?classification ?cl2_label\n" +
        "WHERE\n" +
        "{\n" +
        //"?classification rdfs:label ?cl_label .\n" +
        "?cls sto:isDescribedin ?classification .\n" +
        "?classification rdfs:label ?cl_label .\n" +
        "OPTIONAL { ?classification rdfs:comment ?cl_comment . }\n" +
        "OPTIONAL {\n" +
        "?cls sto:frames ?classification2 .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        "sto:frames rdfs:label ?relation2 .\n" +
        "}\n" +
        " FILTER ( ?classification IN (" + queryString + ") )\n" +
        "} ";
    return fetchData(url, query);
}

function fetchConcernsAndClassifications(queryString){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?cl_label ?cl_comment ?framework ?classification2 ?relation2 ?classification ?cl2_label\n" +
        "WHERE\n" +
        "{\n" +
        "?classification rdfs:label ?cl_label .\n" +
        "?classification2 sto:isDescribedin ?frameworkId .\n" +
        "?frameworkId rdfs:label ?framework .\n" +
        "sto:frames rdfs:label ?relation2 .\n" +
        "OPTIONAL { ?classification rdfs:comment ?cl_comment . }\n" +
        "?classification2 sto:frames ?classification .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        " FILTER ( ?frameworkId IN (" + queryString + ") )\n" +
        "} ";
    return fetchData(url, query);
}


function fetchConcernsAndFrameworks(queryString){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?cl_label ?cl_comment ?framework ?classification2 ?relation2 ?classification ?cl2_label\n" +
        "WHERE\n" +
        "{\n" +
        "?classification rdfs:label ?cl_label .\n" +
        "?cls sto:isDescribedin ?classification2 .\n" +
        "?cls rdfs:label ?framework .\n" +
        "sto:frames rdfs:label ?relation2 .\n" +
        "OPTIONAL { ?classification2 rdfs:comment ?cl_comment . }\n" +
        "?cls sto:frames ?classification .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        " FILTER ( ?classification2 IN (" + queryString + ") )\n" +
        "} ";
    return fetchData(url, query);
}

var networkData = {
    nodes : null,
    links: null
};

// here
function readClassificationAndConcerns(cData){
    var promise = new Promise(function (resolve) {
        var myData = cData.results.bindings;
        var nodes = {};
        var links = [];
        var clsCount = 0;
        var cnCount = 0;
        for(var key in myData){
            var data = myData[key];
            if(data.classification !== undefined){
                clsCount++;
                if(nodes[data.classification.value] === undefined){
                    nodes[data.classification.value] = {};
                    nodes[data.classification.value]['id'] = data.classification.value;
                    nodes[data.classification.value]['label'] = data.cl_label.value;
                    nodes[data.classification.value]['comment'] = data.cl_comment === undefined ?  "" : data.cl_comment.value;
                    nodes[data.classification.value]['links'] = [];
                    nodes[data.classification.value]['isLinked'] = false;
                    nodes[data.classification.value]['nodeType'] = 'class';
                }
            }
            if(data.concern !== undefined){
                if(nodes[data.concern.value] === undefined){
                    nodes[data.concern.value] = {};
                    nodes[data.concern.value]['id'] = data.concern.value;
                    nodes[data.concern.value]['label'] = data.co_label === undefined ? "" : data.co_label.value;
                    nodes[data.concern.value]['comment'] = data.co_comment === undefined ?  "" : data.co_comment.value;
                    nodes[data.concern.value]['nodeType'] = 'concern';
                    nodes[data.concern.value]['links'] = [];
                }

                if(data.classification !== undefined){
                    nodes[data.classification.value]['links'].push({
                        linkedTo : data.concern.value,
                        linkType : data.relation1.value,
                        linkLabel : data.relation1.value
                    })
                }
            }
            if(data.classification2 !== undefined){
                nodes[data.classification.value]['links'].push({
                    linkedTo : data.classification2.value,
                    linkedToLabel : data.cl2_label.value,
                    linkType : data.relation2.value,
                    linkLabel : data.relation2.value
                })
            }
        }
        for(var key in nodes){
            var data = nodes[key];
            data.links = getUniqueLinks(data.links);
            for(var i=0; i < data.links.length; i++){
                //if(nodes[data.links[i].linkedTo] !== undefined){
                    nodes[data.id]['isLinked'] = true;
                    //nodes[data.links[i].linkedTo]['isLinked'] = true;
                    links.push({
                        source: data.id,
                        target: data.links[i].linkedTo,
                        linkType: data.links[i].linkLabel,
                        value: 1
                    });
                //}
            }
        }
        networkData.nodes = Object.values(nodes);
        networkData.links = links;
        resolve(networkData);
		
		console.log(networkData);
    });
    return promise;
}



function readFrameworks(fData){
    var promise = new Promise(function (resolve) {
        var myData = fData.results.bindings;
        var frameworks = [];
        for(var key in myData){
            var data = myData[key];
            frameworks.push({
                id: data.frameworkId.value,
                name: data.frameworkLabel.value
            });
        }
        resolve(frameworks);
    });
    return promise;
}

function getUniqueLinks(links) {
    var map = {};
    for(var key in links){
        var link = links[key];
        map[link.linkedTo + link.linkType] = link;
    }
    return Object.values(map);
}

