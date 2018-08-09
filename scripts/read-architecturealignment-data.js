function fetchArchitectureAlignmentData(queryString){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
        "SELECT DISTINCT ?standard ?framework\n" +
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
		
    var getStandardsQuery = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
        "SELECT DISTINCT (?standardLabel AS ?resource) (?classificationLabel AS ?category) \n" +
        "WHERE\n" +
        "{\n" +
        //"  \t?standardId a sto:Standard .   \n" +
        "\t?standardId sto:hasClassification ?classificationId . \n" +
        "  \t?standardId rdfs:label ?standardLabel .\n" +
        "  \t?classificationId rdfs:label ?classificationLabel .\n" +
        "  \tFILTER ( ?classificationId IN (" + queryString + ") )\n" +
        "}";
		
	var getAlignmentsQuery = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n" +
         "SELECT (?concernLabel as ?resource) (?classificationLabel AS ?category)\n" +
       "WHERE\n" +
        "{\n" +
        "\t?concern a sto:Concern .   \n" +
        "\t?concern ^sto:frames ?classificationId . \n" +
        "\t?concern rdfs:label ?concernLabel .\n" +
        "\t?classificationId rdfs:label ?classificationLabel .\n" +
        "\tFILTER ( ?classificationId IN (" + queryString + ") )\n" +
        "}";
    return fetchData(url, getAlignmentsQuery);
}

function fetchFrameworks(){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#> \n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT (SAMPLE(?classificationId) as ?resource) (?classificationLabel AS ?label)\n" +
        "WHERE\n" +
        "{\n" +
        "  \t{\n" +
        "  \t?classificationId a sto:StandardClassification .  \n" +
        "  \t} UNION {  \n" +
        "  \t?classification rdfs:subClassOf sto:StandardClassification .  \n" +
        "  \t?classificationId a ?classification .  \n" +
        "  \t}  \n" +
        "  \t?classificationId rdfs:label ?classificationLabel .\n" +
        
        //"    BIND(str(?framework) AS ?frameworkL)\n" +
        "}\n" +
        "GROUP BY ?classificationLabel ORDER BY ?classificationLabel";
    return fetchData(url, query);
}

function readFrameworks(fData){
    var promise = new Promise(function (resolve) {
        var myData = fData.results.bindings;
        var frameworks = [];
        for(var key in myData){
            var data = myData[key];
            frameworks.push({
                id: data.resource.value,
                name: data.label.value
            });
        }
        resolve(frameworks);
    });
    return promise;
}

function readArchitectureAlignmentData(vData){
    var promise = new Promise(function (resolve) {
        var myData = vData.results.bindings;
        var dictionary = {};
        for(var key in myData){
            var data = myData[key];
            if(dictionary[data.resource.value] === undefined){
                dictionary[data.resource.value] = {
                    frameworks : [data.category.value]
                }
            }
            else{
                dictionary[data.resource.value].frameworks.push(data.category.value)
            }
        }
        var architectureData = [];
        for(var key in dictionary){
            var value = dictionary[key];
            architectureData.push({
                set: value.frameworks,
                r: 10,
                name: key
            })
        }
        resolve(architectureData);
    });
    return promise;
}