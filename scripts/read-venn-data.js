function fetchVennData(queryString){
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
    return fetchData(url, query);
}

function fetchFrameworks(){
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
    return fetchData(url, query);
}

function fetchDetails(standard){
    var query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT DISTINCT ?detail WHERE {<" + standard + "> rdfs:comment ?detail}";
    return fetchData(url, query);
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