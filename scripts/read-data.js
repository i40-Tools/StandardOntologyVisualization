/**
 * Created by mayes on 1/24/2018.
 */

var final_data = {
    "name": "flare",
    "children": []
};

var colIndex = 0;

function checkSuffix(header) {
    return !header.includes("_name");
}

function readData(){
    var original_headers = data.head.vars;
    var myData = data.results.bindings;
    var headers = original_headers.filter(checkSuffix);
    console.log(headers);

    for(var i in myData){
        var obj = myData[i];
        var standard = {
            "id" : parseURI(obj[headers[0]].value),
            "name" : obj[headers[0] + "_name"] !== undefined ? obj[headers[0] + "_name"].value : addSpace(parseURI(obj[headers[0]].value))
        };
        var classification = {
            "id" : parseURI(obj[headers[1]].value),
            "name" : obj[headers[1] + "_name"] !== undefined ? obj[headers[1] + "_name"].value : addSpace(parseURI(obj[headers[1]].value))
        };
        var initiative = {
            "id" : parseURI(obj[headers[2]].value),
            "name" :  obj[headers[2] + "_name"] !== undefined ? obj[headers[2] + "_name"].value : addSpace(parseURI(obj[headers[2]].value))
        };
        pushInitiative(initiative, classification, standard);
    }
    return final_data;
}

function pushInitiative(initiative, classification, standard){
    if(final_data.children.length === 0){
        final_data.children.push({"name" : initiative.name, "id" : initiative.id, "colIndex": colIndex, "children":[]});
        pushClassification(classification, 0, standard);
        colIndex++;
    }
    else{
        for(var k in final_data.children){
            var flag = 0;
            var intv = final_data.children[k];
            if(intv.id === initiative.id){
                //exists already!
                flag = 1;
                pushClassification(classification, k, standard)
            }
        }
        //didn't find it
        if(flag === 0){
            final_data.children.push({"name" : initiative.name, "id" : initiative.id, "colIndex": colIndex, "children":[]});
            pushClassification(classification, final_data.children.length - 1, standard);
            colIndex++;
        }
    }
}

function pushClassification(classification, parentIndex, standard){
    var intv = final_data.children[parentIndex];
    if(intv.children.length === 0){
        intv.children.push({"name" : classification.name, "id" : classification.id, "colIndex": intv.colIndex, "children":[]});
        pushStandard(standard, parentIndex, 0)
    }
    else{
        for(var k in intv.children){
            var flag = 0;
            var clsf = intv.children[k];
            if(clsf.id === classification.id){
                //exists already!
                flag = 1;
                pushStandard(standard, parentIndex, k)
            }
        }
        //didn't find it
        if(flag === 0){
            intv.children.push({"name" : classification.name, "id" : classification.id, "colIndex": intv.colIndex, "children":[]});
            pushStandard(standard, parentIndex, intv.children.length - 1)
        }
    }
}

function pushStandard(standard, grandparentIndex, parentIndex){
    var clsf = final_data.children[grandparentIndex].children[parentIndex];
    clsf.children.push({"name" : standard.name, "id" : standard.id, "colIndex": clsf.colIndex, size: 100});
}



function parseURI(string){
    return string.split('#')[1];
}

function addSpace(string){
    return string.replace(/([A-Z])/g, ' $1');
}