function fetchVennData(queryString, isConcern){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
        "SELECT DISTINCT ?standard ?framework ?standardId\n" +
        "WHERE\n" +
        "{\n" +
        "  \t?standardId a sto:Standard .   \n" +
        "\t?standardId sto:hasClassification ?classificationId . \n" +
        "\t?classificationId sto:isDescribedin ?frameworkId . \n" +
        "  \t?standardId rdfs:label ?standardLabel .\n" +
        "    ?frameworkId rdfs:label ?frameworkLabel .\n" +
        "  \tBIND(STR(?standardLabel) AS ?standard) \n" +
        "    BIND(STR(?frameworkLabel) AS ?framework) \n" +
        "    FILTER ( ?frameworkId IN (" + queryString + ") )\n" +
        "}";
    if(isConcern){
        query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
            "SELECT DISTINCT ?standard ?framework ?standardId\n" +
            "WHERE\n" +
            "{\n" +
            "  \t?standardId a sto:Concern .   \n" +
            "\t?classificationId sto:frames ?standardId .\n" +
            "\t?classificationId sto:isDescribedin ?frameworkId . \n" +
            "  \t?standardId rdfs:label ?standardLabel .\n" +
            "    ?frameworkId rdfs:label ?frameworkLabel .\n" +
            "  \tBIND(STR(?standardLabel) AS ?standard) \n" +
            "    BIND(STR(?frameworkLabel) AS ?framework) \n" +
            "    FILTER ( ?frameworkId IN (" + queryString + ") )\n" +
            "}";
    }
    return fetchData(url, query);
}

function fetchVennCls(queryString, isConcern){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
        "SELECT DISTINCT ?standard ?classification ?standardId\n" +
        "WHERE\n" +
        "{  " +
        "    ?standardId a sto:Standard .   \n" +
        "    ?standardId sto:hasClassification ?classificationId . \n" +
        "    ?standardId rdfs:label ?standardLabel .\n" +
        "    ?classificationId rdfs:label ?classificationLabel .\n" +
        "    BIND(STR(?standardLabel) AS ?standard) \n" +
        "    BIND(STR(?classificationLabel) AS ?classification) \n" +
        "    FILTER ( ?classificationId IN (" + queryString + ") )\n" +
        "}";
    if(isConcern){
        query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
            "SELECT DISTINCT ?standard ?classification ?standardId\n" +
            "WHERE" +
            "        {  \n" +
            "    ?standardId a sto:Concern .   \n" +
            "    ?classificationId sto:frames ?standardId . \n" +
			"{"+
			" ?classificationId a sto:StandardClassification . "+
			"} UNION {" +
			" ?classificationId a ?subclass . " +
			" ?subclass rdfs:subClassOf sto:StandardClassification . "+
			"}" +
            "    ?standardId rdfs:label ?standard .\n" +
            "    ?classificationId rdfs:label ?classification .\n" +
            "    FILTER ( ?classificationId IN (" + queryString + ") )\n" +
            "}";
    }
    return fetchData(url, query);
}

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

function fetchClassifications(){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT (SAMPLE(?classificationId) as ?resource) (?classificationLabel AS ?label)\n" +
        "WHERE\n" +
        "{\n" +
        "    {\n" +
        "        ?classificationId a sto:StandardClassification .  \n" +
        "    } \n" +
        "    UNION \n" +
        "    {\n" +
        "         ?classification rdfs:subClassOf sto:StandardClassification . \n" +
        "         ?classificationId a ?classification .\n" +
        "    }\n" +
        "?classificationId rdfs:label ?classificationLabel .\n" +
        "}\n" +
        "GROUP BY ?classificationLabel ORDER BY ?classificationLabel";
    return fetchData(url, query);
}


function fetchDetails(standard){
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT DISTINCT ?detail WHERE {<" + standard + "> rdfs:comment ?detail}";
    return fetchData(url, query);
}


function fetchConcerns(){
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
        "?classification sto:alignesWith ?classification2 .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        "sto:alignesWith rdfs:label ?relation2 .\n" +
        "}\n" +
        "}";
    return fetchData(url, query);
}

var networkData = {
    nodes : null,
    links: null
};


function readConcerns(cData){
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
                if(nodes[data.links[i].linkedTo] !== undefined){
                    nodes[data.id]['isLinked'] = true;
                    nodes[data.links[i].linkedTo]['isLinked'] = true;
                    links.push({
                        source: data.id,
                        target: data.links[i].linkedTo,
                        linkType: data.links[i].linkLabel,
                        value: 1
                    });
                }
            }
        }
        networkData.nodes = Object.values(nodes);
        networkData.links = links;
        resolve(networkData);
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

function readVennData(vData){
    var promise = new Promise(function (resolve) {
        var myData = vData.results.bindings;
        var dictionary = {};
        for(var key in myData){
            var data = myData[key];
            if(dictionary[data.standard.value] === undefined){
                dictionary[data.standard.value] = {
                    frameworks : [data.framework.value],
                    id: data.standardId.value
                }
            }
            else{
                dictionary[data.standard.value].frameworks.push(data.framework.value)
            }
        }
        var vennData = [];
        for(var key in dictionary){
            var value = dictionary[key];
            vennData.push({
                set: value.frameworks,
                r: 10,
                name: key,
                id: value.id
            })
        }
        resolve(vennData);
    });
    return promise;
}

function readClassifications(cData){
    var promise = new Promise(function (resolve) {
        var myData = cData.results.bindings;
        var classifications = [];
        for(var key in myData){
            var data = myData[key];
            classifications.push({
                id: data.resource.value,
                name: data.label.value
            });
        }
        resolve(classifications);
    });
    return promise;
}

