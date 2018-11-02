var Chart = function({data, type}){
    this.json = data;
    this.type = type;
    this.data = {};
    this.prepareData();
    this.draw();
};

Chart.prototype.prepareData = function() {
    var processed_data;
    switch(this.type) {
        case "hierarchy":
            processed_data = dataToD3Hierarchy();
            break;
        case "locations":
            break;
        case "timeline":
            break;
        case "relation":
            break;
        case "overlap":
            break;
    }
    this.data[this.type] = processed_data;
};

Chart.prototype.draw = function() {

    switch(this.type) {
        case "hierarchy":
            this.drawHierarchicalChart();
            break;
        case "locations":
            break;
        case "timeline":
            break;
        case "relation":
            break;
        case "overlap":
            break;
    }
};

Chart.prototype.drawHierarchicalChart = function(){

};

Chart.prototype.dataToD3Hierarchy = function(){
    var headers = this.json.head.vars;
    var results = this.json.results.bindings;

    for(var i in results){
        for(var j in headers){
            (results[i][headers[j]]).value
        }
    }
};

