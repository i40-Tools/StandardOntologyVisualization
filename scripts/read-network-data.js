/**
 * Created by mayesha on 5/24/2018.
 */

var networkData = {
    nodes : null,
    links: null
};

function fetchStandards(inference) {
    var relation = inference ? "sto:relatedTo+|^sto:relatedTo" : "sto:relatedTo" ;
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?standard  ?property ?value ?name ?comment ?secondStandard\n" +
        "        WHERE\n" +
        "{\n" +
        "          ?standard a sto:Standard .\n" +
        "          ?prop rdf:type owl:DatatypeProperty .\n" +
        "          ?standard ?prop ?val .\n" +
        "          ?prop rdfs:label  ?propVal .\n" +
        "          ?standard rdfs:label ?sLabel .\n" +
        "          ?standard rdfs:comment ?sComment .\n" +
        "OPTIONAL {?standard "+ relation +" ?secondStandard } .\n" +
        "          BIND (STR(?propVal)  AS ?property) \n" +
        "          BIND (STR(?val)  AS ?value) \n" +
        "          BIND (STR(?sLabel)  AS ?name) \n" +
        "          BIND (STR(?sComment)  AS ?comment) \n" +
        "        }";
    return fetchData(url, query);
}

function readStandards(sData){
    var promise = new Promise(function (resolve) {
        var myData = sData.results.bindings;
        var nodes = {};
        var links = [];
        for(var key in myData){
            var data = myData[key];
            if(nodes[data.standard.value] !== undefined){
                nodes[data.standard.value][data.property.value] = data.value.value;
            }
            else{
                nodes[data.standard.value] = {};
                nodes[data.standard.value]['id'] = data.standard.value;
                nodes[data.standard.value][data.property.value] = data.value.value;
                nodes[data.standard.value]['label'] = data.name.value;
                nodes[data.standard.value]['comment'] = data.comment === undefined ?  "" : data.comment.value;
                nodes[data.standard.value]['links'] = [];
                nodes[data.standard.value]['isLinked'] = false;
            }
            if(data.secondStandard !== undefined){
                nodes[data.standard.value]['links'].push(data.secondStandard.value)
            }
        }
        for(var key in nodes){
            var data = nodes[key];
            data.links = getUnique(data.links);
            for(var i=0; i < data.links.length; i++){
                nodes[data.id]['isLinked'] = true;
                nodes[data.links[i]]['isLinked'] = true;
                links.push({
                    source: data.id,
                    target: data.links[i],
                    value: 1
                });
            }
        }
        networkData.nodes = Object.values(nodes);
        networkData.links = links;
        resolve(networkData);
    });
    return promise;
}
