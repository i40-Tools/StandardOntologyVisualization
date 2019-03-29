function createMatrix(data) {
		
	var matrix = [];
	var nodes = data.nodes;
	var total_items = nodes.length;
	
	
	// Create rows for the matrix
	var unique_targets = [];
	var targets = [];
	data.links.forEach(function(link) {
		if (!unique_targets.includes(link.target) ) unique_targets.push(link.target);
		targets.push(link.target); 
	});
	var node_ids = [];
	nodes.forEach(function(node) {
		node.count = 0;
		if (!node_ids.includes(node.id) ) node_ids.push(node.id);
	});
	

	
	// create the matrix area
	 var margin = {
	  top: 350,
	  right: 0,
	  bottom: 0,
	  left: 200
	  },
	  width = unique_targets.length * 13,
	  height = data.nodes.length * 13;
	  
	var svg = d3.select("graph").append("svg")
		.attr("id", "matrix")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);

	function showStats(d) {
		var content = "<table class='table-bordered property-table'><tr><td>Frameworks</td><td>Number of Standards</td></tr>";
		for(var key in d){
			var count = d[key];
			content += '<tr><td><b>'+ key +'</b></td><td>' + count + '</td> </tr>';
		}
		content += "</table>";
		$(".details").html(content);
	}
	console.log(data);

	
	var matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(unique_targets.length));
	var opacityScale = d3.scaleLinear().domain([0, 10]).range([0.3, 1.0]).clamp(true);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
		
	var i;
	for (i = 0; i < nodes.length; i++) {  
		matrix[i] = unique_targets.map(function(d) {return d;});
		
		var j;
		for (j = 0; j < unique_targets.length; j++) {
			var point = {
				x: j,
				y: i,
				z: 0
			};
			matrix[i][j] = point;
		};
	};
	
	var setData = [];
	
	// Fill matrix with data from links and count how many times each item appears
	data.links.forEach(function(link) {
		var i;
		for (i = 0; i <= nodes.length; i++) {
			if (nodes[i].id == link.source) {
				break;
			}
		}
		
		if (i < nodes.length ) {
			var j = unique_targets.indexOf(link.target);
			matrix[i][j].z = link.value;
			
			if(setData[i] !== undefined){
				setData[i]++;
			}
			else{
				setData[i] = 1;
			}
			//matrix[j][i].z += link.value;
		}
	});
		
	//create the side panel
    showStats(setData);

    function showStats(d) {
        var content = "<table class='table-bordered property-table'><tr><td>Frameworks</td><td>Number of framed Concerns</td></tr>";
        for(var key in d){
            var count = d[key];
            content += '<tr><td><b>'+ nodes[key].label +'</b></td><td>' + count + '</td> </tr>';
        }
        content += "</table>";
        $(".details").html(content);
    }
	
	// Draw each row (translating the y coordinate)
	var rows = svg.selectAll(".row")
		.data(matrix)
		.enter().append("g")
		.attr("class", "row")
		.attr("transform", (d, i) => {
			return "translate(0," + matrixScale.bandwidth(1) * i + ")";
		})
		.attr("transform", (d, i) => {
			return "translate(0," + matrixScale.bandwidth(1) * i + ")";
		})
		;

	var squares = rows.selectAll(".cell")
		.data(d => d.filter(item => item.z > 0))
		.enter().append("rect")
		.attr("class", "cell")
		.attr("x", d => matrixScale.bandwidth()* d.x)
		.attr("y", "0")
		.attr("width", matrixScale.bandwidth())
		.attr("height", matrixScale.bandwidth())
		.style("fill-opacity", d => opacityScale(0))
		.style("fill", d => {
			return "#0083d2";
			//return nodes[nodes.indexOf(d.x)] == nodes[nodes.indexOf(d.y)] ? colorScale(nodes[nodes.indexOf(d.x)]) : "grey";
		})
		//.on("mouseover", mouseover)
		//.on("mouseout", mouseout)
		;
		
	var columns = svg.selectAll(".column")
		.data(matrix[0])
		.enter().append("g")
		.attr("class", "column")
		.attr("transform", (d, i) => {
			return "translate(" + matrixScale(i) + ", 0)rotate(-90)";
		})
		;
	rows.append("text")
		.attr("class", "label")
		.attr("x", matrixScale.bandwidth() / 2 - 8)
		.attr("y", 4)
		.attr("dy", ".32em")
		.attr("text-anchor", "end")
		.text((d, i) => replaceUnderscore(parseURI(nodes[i].id)))
		;
	columns.append("text")
		.attr("class", "label")
		.attr("y", 100)
		.attr("y", matrixScale.bandwidth() / 2 - 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "start")
		.text(
		(d, i) => replaceUnderscore(parseURI(unique_targets[i])));
	
	console.log(columns);
	console.log(unique_targets);
		/*
	// Precompute the orders.
	var orders = {
		name: d3.range(node_ids.length).sort((a, b) => {
			return d3.ascending(node_ids[a].name, node_ids[b].name);
		}),
		count: d3.range(node_ids.length).sort((a, b) => {
			return node_ids[b].count - node_ids[a].count;
		}),
		group: d3.range(node_ids.length).sort((a, b) => {
			return node_ids[b].group - node_ids[a].group;
		})
	};
	d3.select("#order").on("change", function() {
		changeOrder(this.value);
	});
	
	
	function changeOrder(value) {
		matrixScale.domain(orders[value]);
		var t = svg.transition().duration(2000);
		t.selectAll(".row")
			.delay((d, i) => matrixScale(i) * 4)
			.attr("transform", function(d, i) {
				return "translate(0," + matrixScale(i) + ")";
			})
			.selectAll(".cell")
			.delay(d => matrixScale(d.x) * 4)
			.attr("x", d => matrixScale(d.x));
		t.selectAll(".column")
			.delay((d, i) => matrixScale(i) * 4)
			.attr("transform", (d, i) => "translate(" + matrixScale(i) + ")rotate(-90)");
	}
		
	rows.append("line")
		.attr("x2", width);
	columns.append("line")
		.attr("x1", -width);
	var tooltip = d3.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
		
	function mouseover(p) {
		d3.selectAll(".row text").classed("active", (d, i) => {
			return i == p.y;
		});
		d3.selectAll(".column text").classed("active", (d, i) => {
			return i == p.x;
		});
		tooltip.transition().duration(200).style("opacity", .9);
		tooltip.html(capitalize_Words(node_ids[p.y].name) + " [" + intToGroup(node_ids[p.y].group) + "]</br>" +
				capitalize_Words(node_ids[p.x].name) + " [" + intToGroup(node_ids[p.x].group) + "]</br>" +
				p.z + " trabalhos relacionados")
			.style("left", (d3.event.pageX + 30) + "px")
			.style("top", (d3.event.pageY - 50) + "px");
	}
	
	function mouseout() {
		d3.selectAll("text").classed("active", false);
		tooltip.transition().duration(500).style("opacity", 0);
	}*/
}
            
/* utils */ 
		
var groupToInt = function(area) {
	if(area == "exatas"){
	  return 1;
	}else if (area == "educacao"){
	  return 2;
	}else if (area == "humanas"){
	  return 3;
	}else if (area == "biologicas"){
	  return 4;
	}else if (area == "linguagem"){
	  return 5;
	}else if (area == "saude"){
	  return 6;
	}
};
var intToGroup = function(area) {
	if(area == 1){
	  return "exatas";
	}else if (area == 2){
	  return "educacao";
	}else if (area == 3){
	  return "humanas";
	}else if (area == 4){
	  return "biologicas";
	}else if (area == 5){
	  return "linguagem";
	}else if (area == 6){
	  return "saude";
	}
};

function capitalize_Words(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function getSets(data){
    var sets = {};
    for(let i = 0; i < data.links.length; i++){
        var obj = data.links[i];
        if(sets[obj.source] !== undefined){
            sets[obj.source]++;
        }
        else{
            sets[obj.source] = 1;
        }

    }
    return sets;
}

  
function loadMatrixDiagram(query){
	destroyChart("#matrix");
	
	var queryString = "";
	$("#selectFrameworks input").each(function(index, input){
		if($(input).is(":checked")){
			queryString += "<" + $(input).val() + ">,"
		}
	});
	queryString = "<" + query + ">,";
	fetchClassificationsAndConcerns(queryString.slice(0, -1))
		.then(readClassificationAndConcerns)
		.then(createMatrix);
}

function loadMatrixDiagramFrameworksAndConcerns(query){
	destroyChart("#matrix");
	
	var queryString = "";
	$("#selectFrameworks input").each(function(index, input){
		if($(input).is(":checked")){
			queryString += "<" + $(input).val() + ">,"
		}
	});
	queryString = "<" + query + ">,";
	fetchFrameworksAndConcerns(queryString.slice(0, -1))
		.then(readClassificationAndConcerns)
		.then(createMatrix);
}


function loadMatrixDiagramConcernAndClassifications(query){
	destroyChart("#matrix");
	
	var queryString = "";
	$("#selectFrameworks input").each(function(index, input){
		if($(input).is(":checked")){
			queryString += "<" + $(input).val() + ">,"
		}
	});
	queryString = "<" + query + ">,";
	fetchConcernsAndClassifications(queryString.slice(0, -1))
		.then(readClassificationAndConcerns)
		.then(createMatrix);
}


function loadMatrixDiagramConcernAndFrameworks(query){
	destroyChart("#matrix");
	
	var queryString = "";
	$("#selectFrameworks input").each(function(index, input){
		if($(input).is(":checked")){
			queryString += "<" + $(input).val() + ">,"
		}
	});
	queryString = "<" + query + ">,";
	fetchConcernsAndFrameworks(queryString.slice(0, -1))
		.then(readClassificationAndConcerns)
		.then(createMatrix);
}