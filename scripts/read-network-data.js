/**
 * Created by mayesha on 5/24/2018.
 */

var networkData = {
    nodes : null,
    links: null
};

function fetchRelations(){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
        "\n" +
        "SELECT ?relation  WHERE {\n" +
        "?relation rdfs:subPropertyOf* sto:relatedTo .\n" +
        "}";
    return fetchData(url, query);
}

function buildRelationProperty(data, inference){
    var promise = new Promise(function (resolve) {
        var rData = data.results.bindings;
        var relationProp = "";
        for (var key in rData) {
            var relation = rData[key].relation.value;
            if (inference) {
                relationProp = relationProp + "(<" + relation + ">+|^<" + relation + ">)|";
            }
            else {
                relationProp = relationProp + "<" + relation + ">|";
            }
        }
        resolve(relationProp.slice(0, -1));
    });
    return promise;
}

function fetchStandards(relationProp) {
    console.log(relationProp.toString());
    // var relation = inference ? "sto:relatedTo+|^sto:relatedTo" : "sto:relatedTo" ;
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "\n" +
        "SELECT ?standard  ?property ?value ?name ?comment ?secondStandard ?relation ?relationLabel\n" +
        "        WHERE\n" +
        "{\n" +
        "          ?standard a sto:Standard .\n" +
        "          ?prop rdf:type owl:DatatypeProperty .\n" +
        "          ?standard ?prop ?val .\n" +
        "          ?prop rdfs:label  ?propVal .\n" +
        "          ?standard rdfs:label ?sLabel .\n" +
        "          ?standard rdfs:comment ?sComment .\n" +
        "  OPTIONAL {\n" +
        "    ?standard " + relationProp + " ?secondStandard .\t\n" +
        "    \t\t\t?standard ?relation ?secondStandard .\t\n" +
        "    \t\t\t?relation rdfs:label ?relationLabel .\t\n" +
        "  }" +
        "          BIND (STR(?propVal)  AS ?property) \n" +
        "          BIND (STR(?val)  AS ?value) \n" +
        "          BIND (STR(?sLabel)  AS ?name) \n" +
        "          BIND (STR(?sComment)  AS ?comment) \n" +
        "        }";
    return fetchData(url, query);
}

function getUniqueLinks(links) {
    var map = {};
    for(var key in links){
        var link = links[key];
        map[link.linkedTo + link.linkType] = link;
    }
    return Object.values(map);
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
                nodes[data.standard.value]['links'].push({
                    linkedTo : data.secondStandard.value,
                    linkType : data.relation.value,
                    linkLabel : data.relationLabel.value,
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
