function loadVenn(vennData) {

    console.log(vennData);

    var setData = getSets(vennData);
    showStats(setData);

    function showStats(d) {
        var content = "<table class='table-bordered property-table'><tr><td>Frameworks</td><td>Number of Standards</td></tr>";
        for(var key in d){
            var count = d[key];
            content += '<tr><td><b>'+ key +'</b></td><td>' + count + '</td> </tr>';
        }
        content += "</table>";
        $(".details").html(content);
    }

    var margin = {
        width : 20,
        height : 100
    };

    var width = $('.chart-container').width() - margin.width,
        height = $('.chart-container').height() - margin.height,
        colors = d3.scale.category10();

    var setChar = 'ABCDEFGHIJKLMN',
        charFn = i => setChar[i],
        setLength = 4,
        sets = d3.range(setLength).map(function (d, i) {
            return setChar[i]
        });

    var opts = {
        dataLength: 180,
        setLength: 4,
        duration: 800,
        circleOpacity: 0.2,
        innerOpacity: 0.1
    };


    // Build simple getter and setter Functions
    for (var key in opts) {
        loadVenn[key] = getSet(key, loadVenn).bind(opts);
    }

    function getSet(option, component) {
        return function (_) {
            if (!arguments.length) {
                return this[option];
            }
            this[option] = _;
            return component;
        };
    }

    function refreshInput() {
        var sel = d3.select(this),
            name = sel.attr("name"),
            value = sel.property("value")
        loadVenn[name](value);
        if (name == 'dataLength' || name == 'setLength') {
            if (name == 'setLength') {
                globalData = [] // we reshuffle everything
            }
            return refresh(vennData)
        }
        refresh();
    }

    //set input value accorging to options and handle change of input
    d3.selectAll('#inputs input')
        .each(function () {
            var sel = d3.select(this),
                name = sel.attr("name");
            sel.property("value", loadVenn[name]())
        })
        .on('input', refreshInput)
		
// sba: from venn
    var layout = d3.layout.venn()
        .size([width, height])
        .padding(0)
        .packingStragegy(d3.layout.venn.force)

	/*
    var svg = d3.select(".chart-container")
        .append("svg")
        .attr("id", "venn")
        .attr('width', width)
        .attr('height', height)
        .call(d3.behavior.zoom().on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }));
	*/
	
	// sba: 
	var margin = {
			top: 285,
			right: 0,
			bottom: 10,
			left: 285
		};
	
	var svg = d3.select(".chart-container")
        .append("svg")
		.attr("class", "background")
        .attr("id", "matrix")
		.attr("width", width - margin.right)
		.attr("height", height - margin.top)
		.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		//.call(d3.behavior.zoom().on("zoom", function () {
        //    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        //}))
		;
	svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);
	
	// sba: from venn
    var isFirstLayout = true;

    var globalData = [],
        generator = 0;

    function refresh(data) {
        if (data) {
            // we recalculate the layout for new data only
            layout.nodes(data)
        }

        var vennArea = svg.selectAll("g.venn")
            .data(layout.sets().values(), function (d) {
                return d.__key__;
            });

        var vennEnter = vennArea.enter()
            .append('g')
            .attr("class", function (d) {
                return "venn-area venn-" +
                    (d.sets.length == 1 ? "circle" : "intersection");
            })
            .attr('fill', function (d, i) {
            return "none"
        });

        vennEnter.append('path')
            .attr('class', 'matrix-area-path')
            .attr('stroke', function (d, i) {
                return colors(i)
            })
            .attr('stroke-width', '5');

        vennEnter.append('circle')
            .attr('class', 'inner');

        vennEnter.append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em");


        vennArea.selectAll('path.matrix-area-path').transition()
            .duration(isFirstLayout ? 0 : loadVenn.duration())
            .attr('opacity', loadVenn.circleOpacity())
            .attrTween('d', function (d) {
                return d.d
            });
        //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
        vennArea.selectAll("text.label").data(function (d) {
            return [d];
        })
            .text(function (d) {
                return (d.sets.length == 1 ? d.__key__ : "");
            })
            .style("stroke", "#000000")
            .attr("x", function (d) {
                return d.center.x
            })
            .attr("y", function (d) {
                return d.center.y
            });

        //we need to rebind data so that parent data propagates to child nodes (otherwise, updating parent has no effect on child.__data__ property)
        vennArea.selectAll('circle.inner').data(function (d) {
            return [d];
        }).transition()
            .duration(isFirstLayout ? 0 : loadVenn.duration())
            .attr('opacity', loadVenn.innerOpacity())
            .attr("cx", function (d) {
                return d.center.x
            })
            .attr("cy", function (d) {
                return d.center.y
            })
            .attr('r', function (d) {
                return d.innerRadius
            });

        vennArea.exit().transition()
            .duration(loadVenn.duration())
            .attrTween('d', function (d) {
                return d.d
            })
            .remove();

        // need this so that nodes always on top
        var circleContainer = svg.selectAll("g.venn-circle-container")
            .data(layout.sets().values(), function (d) {
                return d.__key__;
            });

        circleContainer.enter()
            .append('g')
            .attr("class", "venn-circle-container")
            .attr('fill', function (d, i) {
                return colors(i)
            });
        circleContainer.exit().remove();

        var points = circleContainer.selectAll("circle.node")
            .data(function (d) {
                return d.nodes
            }, function (d) {
                return d.name
            });

        var pointsEnter = points.enter()
            .append('circle')
            .attr('r', 0)
            .attr('class', 'node')
            .call(layout.packer().drag);

        points.transition()
            .duration(isFirstLayout ? 0 : loadVenn.duration())
            .attr('class', "venn-node")
            .attr('opacity', 0.2)
            .attr('stroke', 'black')
            .attr('r', function (d) {
                return d.r
            });

        pointsEnter
            .append('title')
            .text(function (d) {
                return d.name;
            });

        pointsEnter
            .on("click", function(d){
                fetchDetails(d.id).then(function(resp){
                    var detail = resp.results.bindings[0].detail.value;
                    var info = "<h4>" + d.name + "</h4></br>" +
                                detail + "</br></br>" +
                                "<b>Part of Framework(s):</b> " + d.set.toString() + "</br></br>" +
                                "<a href='" + d.id + "'>More information on " + d.name + "</a>";
                    clearSidebar();
                    showInfo(info);
                })
            });

        points.exit().transition()
            .attr('r', 0)
            .remove();

        isFirstLayout = false;

        //set the force ticker
        layout.packingConfig({
            ticker: function () {
                points.attr("cx", function (d) {
                    return d.x
                })
                    .attr("cy", function (d) {
                        return d.y
                    })

            }
        });
        //start the force layout
        layout.packer().start();
        return loadVenn
    }


	// sba: new:

	//[...] //transform the data

	var matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(vennData.length));
	var opacityScale = d3.scaleLinear().domain([0, 10]).range([0.3, 1.0]).clamp(true);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

	// Draw each row (translating the y coordinate) 
		var rows = svg.selectAll(".row")
			.data(vennData)
			.enter().append("g")
			.attr("class", "row")
			.attr("transform", (d, i) => {
				return "translate(0," + matrixScale(i) + ")";
			});


	var squares = rows.selectAll(".cell")
			//.data(d => d.filter(item => item.set.length > 0))
			.enter().append("svg")
			.attr("class", "cell")
			.attr("id", d => matrixScale(d.id))
			.attr("width", matrixScale.bandwidth())
			.attr("height", matrixScale.bandwidth())
			.style("fill-opacity", d => opacityScale(d.set.length)).style("fill", d => {
				return nodes[d.id].group == nodes[d.set[0]].group ? colorScale(nodes[d.id].group) : "grey";
			})
			//.on("mouseover", mouseover)
			//.on("mouseout", mouseout)
			;
	
	var columns = svg.selectAll(".column")
        .data(vennData)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", (d, i) => {
            return "translate(" + matrixScale(i) + ")rotate(-90)";
        });
		
	rows.append("text")
        .attr("class", "label")
        //.attr("id", -5)
        .attr("y", matrixScale.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        //.text((d, i) => console.log(d.name))
        .text((d, i) => d.name )
		;
  
    columns.append("text")
        .attr("class", "label")
        .attr("y", 100)
        .attr("y", matrixScale.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text((d, i) => d.name );

	// Precompute the orders.
	var orders = {
		name: d3.range(total_items).sort((a, b) => {
			return d3.ascending(nodes[a].name, nodes[b].name);
		}),
		count: d3.range(total_items).sort((a, b) => {
			return nodes[b].count - nodes[a].count;
		}),
		group: d3.range(total_items).sort((a, b) => {
			return nodes[b].group - nodes[a].group;
		})
	};
	d3.select("#order").on("change", function() {
		changeOrder(this.value);
	});

	//*
	
    return refresh(vennData)
}

function getSets(data){
    var sets = {};
    for(let i = 0; i < data.length; i++){
        var obj = data[i];
        if(sets[obj.set.toString()] !== undefined){
            sets[obj.set.toString()]++;
        }
        else{
            sets[obj.set.toString()] = 1;
        }

    }
    return sets;
}




function createMatrix(data) {
	 var margin = {
	  top: 285,
	  right: 0,
	  bottom: 0,
	  left: 285
	  },
	  width = 700,
	  height = 700;
	  
	var svg = d3.select("graph").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);

	
	// sba: core
	//var data = getSets(vennData);
	//showStats(data);

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
	
	var matrix = [];
	var nodes = data.nodes;
	var total_items = nodes.length;
	var matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(total_items));
	var opacityScale = d3.scaleLinear().domain([0, 10]).range([0.3, 1.0]).clamp(true);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
		
	// Create rows for the matrix
	var unique_targets = [];
	data.links.forEach(function(link) {
		if (!unique_targets.includes(link.target) ) unique_targets.push(link.target);
		
		//unique_targets.length += 1; 
	});
	var unique_nodes = [];
	nodes.forEach(function(node) {
		if (!unique_nodes.includes(node.id) ) unique_nodes.push(node.id);
	});
	
	var i;
	for (i = 0; i < nodes.length; i++) {  
		matrix[i] = unique_targets.map(function(d) {return d;});
		
		var j;
		for (j = 0; j < unique_targets.length; j++) {
			var point = {
				x: nodes[i].id,
				y: unique_targets[j],
				z: 0
			};
			matrix[i][j] = point;
		};
		/*
		var i;
		for (i = 0; i < unique_targets.length; i++ ) {
			var point = {
				x: node.id,
				y: unique_targets[i],
				z: 0
			};
            matrix[node.id][unique_targets[i]] = point;
		
		}
		*/
	};
	
	
	// Fill matrix with data from links and count how many times each item appears
	data.links.forEach(function(link) {
		var j = unique_targets.indexOf(link.target);
		var i = unique_nodes.indexOf(link.source);
		matrix[i][j].z += link.value;
		//matrix[link.target][link.source].z += link.value;
		//nodes[i].count += link.value;
		//nodes[j].count += link.value;
	});
	// Draw each row (translating the y coordinate)
	var rows = svg.selectAll(".row")
		.data(matrix)
		.enter().append("g")
		.attr("class", "row")
		.attr("transform", (d, i) => {
			return "translate(0," + matrixScale(i) + ")";
		});
	var squares = rows.selectAll(".cell")
		.data(d => d.filter(item => item.z > 0))
		.enter().append("rect")
		.attr("class", "cell")
		.attr("x", d => matrixScale(d.x))
		.attr("width", matrixScale.bandwidth())
		.attr("height", matrixScale.bandwidth())
		.style("fill-opacity", d => opacityScale(d.z)).style("fill", d => {
			return nodes[unique_nodes.indexOf(d.x)] == nodes[unique_nodes.indexOf(d.y)] ? colorScale(nodes[unique_nodes.indexOf(d.x)]) : "grey";
		})
		//.on("mouseover", mouseover)
		//.on("mouseout", mouseout);
		;
	var columns = svg.selectAll(".column")
		.data(matrix)
		.enter().append("g")
		.attr("class", "column")
		.attr("transform", (d, i) => {
			return "translate(" + matrixScale(i) + ")rotate(-90)";
		});
	rows.append("text")
		.attr("class", "label")
		.attr("x", -5)
		.attr("y", matrixScale.bandwidth() / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "end")
		.text((d, i) => capitalize_Words(unique_nodes[i]));
	columns.append("text")
		.attr("class", "label")
		.attr("y", 100)
		.attr("y", matrixScale.bandwidth() / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "start")
		.text((d, i) => capitalize_Words(unique_targets[i]));
	// Precompute the orders.
	/*var orders = {
		name: d3.range(total_items).sort((a, b) => {
			return d3.ascending(nodes[a].name, nodes[b].name);
		}),
		count: d3.range(total_items).sort((a, b) => {
			return nodes[b].count - nodes[a].count;
		}),
		group: d3.range(total_items).sort((a, b) => {
			return nodes[b].group - nodes[a].group;
		})
	};
	d3.select("#order").on("change", function() {
		changeOrder(this.value);
	});
	*/
	
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
		tooltip.html(capitalize_Words(nodes[p.y].name) + " [" + intToGroup(nodes[p.y].group) + "]</br>" +
				capitalize_Words(nodes[p.x].name) + " [" + intToGroup(nodes[p.x].group) + "]</br>" +
				p.z + " trabalhos relacionados")
			.style("left", (d3.event.pageX + 30) + "px")
			.style("top", (d3.event.pageY - 50) + "px");
	}
	
	function mouseout() {
		d3.selectAll("text").classed("active", false);
		tooltip.transition().duration(500).style("opacity", 0);
	}
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
  

destroyChart("#matrix");
var queryString = "";
$("#selectFrameworks input").each(function(index, input){
	if($(input).is(":checked")){
		queryString += "<" + $(input).val() + ">,"
	}
});