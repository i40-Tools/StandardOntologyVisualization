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

function fetchConcerns(){
    var query = "PREFIX sto: <https://w3id.org/i40/sto#>\n" +
        "PREFIX sto_iot: <https://w3id.org/i40/sto/iot#>\n" +
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
        "?classification sto_iot:alignsWith ?classification2 .\n" +
        "?classification2 rdfs:label ?cl2_label .\n" +
        "sto_iot:alignsWith rdfs:label ?relation2 .\n" +
        "}\n" +
        "}";
    return fetchData(url, query);
}

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
