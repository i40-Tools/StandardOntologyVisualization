/**
 * Created by mayesha on 5/24/2018.
 */
function loadNetwork(networkData){
    var svg = d3.select("#network"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

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
            .selectAll("line")
            .data(graph.links)
            .enter().append("line");

        const color = d3.scaleOrdinal(d3.schemeCategory20c);

        var node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", function(d) {
                d.weight = link.filter(function(l) {
                    return l.source == d.id || l.target == d.id
                }).size();
                var minRadius = 20;
                return minRadius + (d.weight * 2);
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
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged)
            //     .on("end", dragended));

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

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                // .attr("r", 32)
                .style("fill", function (d) {
                    return color(d.weight);
                })
                .style("stroke", "#424242")
                .attr("cx", function (d) { return d.x+5; })
                .attr("cy", function(d) { return d.y-3; })
                .on("click", function (d) {
                    var info = "<h4>" + d.label + "</h4></br>" + d.comment + "</br></br><a href='" + d.id + "'>More information on " + d.label + "</a>";
                    showInfo(info);
                });

            label
                .attr("x", function(d) {
                    return d.x  - Math.sqrt(d.weight)/2 * (d.label.length);
                 })
                .attr("y", function (d) { return d.y; })
                .attr("font-size", function(d){
                    return Math.sqrt(d.weight) * 3;
                })
                .style("fill", "#333");
        }
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
//  simulation.fix(d);
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
//  simulation.fix(d, d3.event.x, d3.event.y);
    }

    function dragended(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
        if (!d3.event.active) simulation.alphaTarget(0);
        //simulation.unfix(d);
    }

    run(networkData)

}