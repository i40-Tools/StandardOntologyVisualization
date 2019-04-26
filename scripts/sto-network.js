/**
 * Created by mayesha on 5/24/2018.
 */
function loadNetwork(networkData){
    var width = $(".chart-container").width();
    var height = $(".chart-container").height();

    var svg = d3.select(".chart-container")
        .append("svg")
        .attr("id", "networks")
        .attr("class", "resizeW resizeH")
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox','0 0 '+ width +' '+ height)
        .attr('preserveAspectRatio','xMinYMin');

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(200))
        .force('charge', d3.forceManyBody()
            .strength(-1000)
            .theta(0.8)
            .distanceMax(1000)
         )
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2))
        .force("center", d3.forceCenter(width / 2, height / 2));


    function run(graph) {
        var g = svg.append("g")
            .attr("class", "everything")
            .style("fill", "#9d9d9d");

        var link = g.append("g")
            .style("stroke", "#aaa")
            .style("stroke-width", "5px")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link");

        var linkText = link
            .append("title")
            .text(function(d){return d.linkType});

        var startColor = "hsl(200,100%,70%)";
        var endColor = "hsl(200,100%,10%)";

        var colorScale = d3.scaleLinear()
            .domain([0, 20])
            .range([startColor, endColor])
            .interpolate(d3.interpolateHcl);

        var colorScaleGreen = d3.scaleLinear()
            .domain([0, 20])
            .range(["hsl(100,100%,90%)", "hsl(100,100%,5%)"])
            .interpolate(d3.interpolateHcl);

        var node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", function (d) {
                var class_name = d.label.replace(/[^A-Z0-9]+/ig, "-").toLowerCase();
                return class_name;
            })
            .attr("r", function(d) {
                d.weight = link.filter(function(l) {
                    return l.source == d.id || l.target == d.id
                }).size();
                var minRadius = 20;
                //return minRadius + (d.weight * 2);
                return minRadius ;
            })
            .style("stroke-width", "1px")
            .style('stroke','black')
            .on('mouseover',function() {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style('stroke-width',3)
            })
            .on('mouseout',function () {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style('stroke-width',1)
            });

        var title = node.append("svg:title")
            .text(function(d){
                return d.label;
            });


        var label = g.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .text(function(d) { return d.label; });


        showMetaInfo(graph.nodes.length, graph.links.length);


        //add zoom capabilities
        var zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        //Zoom functions
        function zoom_actions(){
            g.attr("transform", d3.event.transform)
        }

        zoom_handler(svg);

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function showTable(d) {
            var content = "<h4>Standard Properties</h4><table class='table-bordered property-table'><tr><td>Name</td><td>Value</td></tr>";
            for(var key in d){
                var prop = d[key];
                if(key.startsWith('has')){
                    content += '<tr><td><b>'+ formatProperty(key) +'</b></td><td>' + prop + '</td> </tr>';
                }
            }
            content += "</table>";
            $("#standardDetails").html(content);
        }

        function formatProperty(key){
            var clipped = key.substring(4);
            return clipped.charAt(0).toUpperCase() + clipped.substr(1);
        }

        function showLinks(links) {
            if(links.length){
                var content = "<h4>Related Standards</h4><table class='table-bordered property-table'><tr><td>Related To</td><td>Relation Type</td></tr>";
                for(var key in links){
                    var link = links[key];
					if (link.linkedToLabel !== undefined) {
					content += "<tr><td><a href='" + link.linkedTo + "'>" + link.linkedToLabel + "</a></td><td>" + link.linkLabel + "</td></tr>"; 						
					} else {
                    content += "<tr><td><a href='" + link.linkedTo + "'>" + replaceUnderscore(parseURI(link.linkedTo)) + "</a></td><td>" + link.linkLabel + "</td></tr>";
					}
				}
                content += "</table>";
                $("#relatedStandards").html(content);
            }
        }

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                // .attr("r", 32)
                .style("fill", function (d) {
                    if(d.isLinked){
                        if(d.nodeType !== undefined && d.nodeType === "concern") return colorScaleGreen(d.weight);
                        else return colorScale(d.weight)
                    }
                    else return "#f2d181";
                })
                .style("stroke", "#424242")
                .attr("cx", function (d) { return d.x+5; })
                .attr("cy", function(d) { return d.y-3; })
                .on("click", function (d) {
                    var info = "<h4>" + d.label + "</h4></br>" + d.comment + "</br></br><a href='" + d.id + "'>More information on " + d.label + "</a>";
                    showInfo(info);
                    showTable(d);
                    showLinks(d.links);
                });

            label
                .attr("x", function(d) {
                    return d.x  - Math.sqrt(d.weight)/2 * (d.label.length);
                 })
                .attr("y", function (d) { return d.y; })
                .attr("font-size", function(d){
                   // if(d.weight === 0) return 5;
                   // else return Math.sqrt(d.weight) * 3;
				    return 8;
                })
                .style("fill", function (d) {
                    if(d.weight > 6){
                        return "#9d9d9d"
                    }
                    else return "#333333"
                });
        }
    }

    var search_source = $.map(networkData.nodes, function(d){
        return d.label;
    });

    function showMetaInfo(numNodes, numLinks){
        $("#meta_nodes").text(numNodes);
        $("#meta_links").text(numLinks);
    }

    search_source = getUnique(search_source);

    $( "#search_box" ).autocomplete({
        source: search_source
    });

    run(networkData);

}