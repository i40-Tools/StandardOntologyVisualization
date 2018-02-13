/**
 * Created by mayes on 1/24/2018.
 */

var final_data = {
    "name": "flare",
    "children": []
};

var colIndex = 0;

function readData(){
    var myData = data.results.bindings;

    for(var i in myData){
        var obj = myData[i];
        var standard = obj.std.value.split('#')[1];
        var classification = parse(obj.classification.value);
        var initiative = parse(obj.initiative.value);

        pushInitiative(initiative, classification, standard);
    }
    return final_data;
}

function pushInitiative(initiative, classification, standard){
    if(final_data.children.length === 0){
        final_data.children.push({"name" : initiative, "colIndex": colIndex, "children":[]});
        pushClassification(classification, 0, standard)
        colIndex++;
    }
    else{
        for(var k in final_data.children){
            var flag = 0;
            var intv = final_data.children[k];
            if(intv.name === initiative){
                //exists already!
                flag = 1;
                pushClassification(classification, k, standard)
            }
        }
        //didn't find it
        if(flag === 0){
            final_data.children.push({"name" : initiative, "colIndex": colIndex, "children":[]});
            pushClassification(classification, final_data.children.length - 1, standard);
            colIndex++;
        }
    }
}

function pushClassification(classification, parentIndex, standard){
    var intv = final_data.children[parentIndex];
    if(intv.children.length === 0){
        intv.children.push({"name" : classification, "colIndex": intv.colIndex, "children":[]});
        pushStandard(standard, parentIndex, 0)
    }
    else{
        for(var k in intv.children){
            var flag = 0;
            var clsf = intv.children[k];
            if(clsf.name === classification){
                //exists already!
                flag = 1;
                pushStandard(standard, parentIndex, k)
            }
        }
        //didn't find it
        if(flag === 0){
            intv.children.push({"name" : classification, "colIndex": intv.colIndex, "children":[]});
            pushStandard(standard, parentIndex, intv.children.length - 1)
        }
    }
}

function pushStandard(standard, grandparentIndex, parentIndex){
    var clsf = final_data.children[grandparentIndex].children[parentIndex];
    clsf.children.push({"name" : standard, "colIndex": clsf.colIndex, size: 100});
}



function parse(string){
    var uri = string.split('#')[1];
    // insert a space before all caps
    return uri.replace(/([A-Z])/g, ' $1');
}

function match(element) {
    return element > 10;
}