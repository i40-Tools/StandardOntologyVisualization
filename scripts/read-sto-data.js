/**
 * Created by mayes on 1/24/2018.
 */

var final_data = {
    "name": "flare",
    "children": []
};

var colIndex = 0;

function checkSuffix(header) {
    !header.includes("_");
}

function fetchStoData() {
    var query = "PREFIX rami: <https://w3id.org/i40/rami#> \
    PREFIX sto: <https://w3id.org/i40/sto#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        PREFIX dct: <http://purl.org/dc/terms/>    \
        SELECT DISTINCT  ?std_name ?classification_name ?initiative_name ?std ?classification ?initiative ?std_comment ?classification_comment ?initiative_comment   \
        WHERE {    \
        ?classification sto:isDescribedin ?initiative .    \
        ?std sto:hasClassification ?classification .    \
    OPTIONAL{ ?std rdfs:label ?sto } .    \
    OPTIONAL{ ?classification rdfs:label ?cto } .    \
    OPTIONAL{ ?initiative rdfs:label ?ito } .    \
    OPTIONAL{ ?std rdfs:comment ?std_comment } .    \
    OPTIONAL{ ?classification rdfs:comment ?classification_comment } . \
    OPTIONAL{ ?initiative rdfs:comment ?initiative_comment } . \
    FILTER( langMatches( lang(?sto), 'en' ) ) \
    FILTER( langMatches( lang(?std_comment), 'en' ) ) \
    BIND(CONCAT(str(?sto)) as ?std_name) .    \
    BIND(CONCAT(str(?cto)) as ?classification_name) .    \
    BIND(CONCAT(str(?ito)) as ?initiative_name)    \
    }";
    return fetchData(url, query);
};

function readStoData(data) {
    var promise = new Promise(function (resolve) {
        var original_headers = data.head.vars;
        var myData = data.results.bindings;
        var headers = ["std", "classification", "initiative"];

        for (var i in myData) {
            var obj = myData[i];
            var standard = {
                "id": obj[headers[0]].value,
                "name": obj[headers[0] + "_name"] !== undefined ? obj[headers[0] + "_name"].value : addSpace(parseURI(obj[headers[0]].value)),
                "comment": obj[headers[0] + "_comment"] !== undefined ? obj[headers[0] + "_comment"].value : addSpace(parseURI(obj[headers[0]].value))
            };
            var classification = {
                "id": obj[headers[1]].value,
                "name": obj[headers[1] + "_name"] !== undefined ? obj[headers[1] + "_name"].value : addSpace(parseURI(obj[headers[1]].value)),
                "comment": obj[headers[1] + "_comment"] !== undefined ? obj[headers[1] + "_comment"].value : addSpace(parseURI(obj[headers[1]].value))
            };
            var initiative = {
                "id": obj[headers[2]].value,
                "name": obj[headers[2] + "_name"] !== undefined ? obj[headers[2] + "_name"].value : addSpace(parseURI(obj[headers[2]].value)),
                "comment": obj[headers[2] + "_comment"] !== undefined ? obj[headers[2] + "_comment"].value : addSpace(parseURI(obj[headers[2]].value))
            };
            pushInitiative(initiative, classification, standard);
        }
        resolve(final_data);
    });

    return promise;
}

function pushInitiative(initiative, classification, standard) {
    if (final_data.children.length === 0) {
        final_data.children.push({
            "name": initiative.name,
            "comment":initiative.comment,
            "id": initiative.id,
            "colIndex": colIndex,
            "children": []
        });
        pushClassification(classification, 0, standard);
        colIndex++;
    }
    else {
        var flag = 0;
        for (var k in final_data.children) {
            var intv = final_data.children[k];
            if (intv.id === initiative.id) {
                //exists already!
                flag = 1;
                pushClassification(classification, k, standard)
            }
        }
        //didn't find it
        if (flag === 0) {
            final_data.children.push({
                "name": initiative.name,
                "comment":initiative.comment,
                "id": initiative.id,
                "colIndex": colIndex,
                "children": []
            });
            pushClassification(classification, final_data.children.length - 1, standard);
            colIndex++;
        }
    }
}

function pushClassification(classification, parentIndex, standard) {
    var intv = final_data.children[parentIndex];
    if (intv.children.length === 0) {
        intv.children.push({
            "name": classification.name,
            "comment":classification.comment,
            "id": classification.id,
            "colIndex": intv.colIndex,
            "children": []
        });
        pushStandard(standard, parentIndex, 0)
    }
    else {
        var flag = 0;
        for (var k in intv.children) {
            var clsf = intv.children[k];
            if (clsf.id === classification.id) {
                //exists already!
                flag = 1;
                pushStandard(standard, parentIndex, k)
            }
        }
        //didn't find it
        if (flag === 0) {
            intv.children.push({
                "name": classification.name,
                "comment":classification.comment,
                "id": classification.id,
                "colIndex": intv.colIndex,
                "children": []
            });
            pushStandard(standard, parentIndex, intv.children.length - 1)
        }
    }
}

function pushStandard(standard, grandparentIndex, parentIndex) {
    var clsf = final_data.children[grandparentIndex].children[parentIndex];
    var flag = 0;
    for (var k in clsf.children) {
        var std = clsf.children[k];
        if (std.id === standard.id) {
            //exists already!
            flag = 1;
        }
    }
    //didn't find it
    if (flag === 0) {
        clsf.children.push({
            "name": standard.name,
            "comment": standard.comment,
            "id": standard.id,
            "colIndex": clsf.colIndex,
            size: 100
        });
    }
}