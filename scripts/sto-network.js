/**
 * Created by mayesha on 5/24/2018.
 */
function destroyChart(){
    clearSidebar();
    d3.select("#networks").remove();
}
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
            .selectAll("line")
            .data(graph.links)
            .enter().append("line");

        var startColor = "hsl(200,100%,70%)";
        var endColor = "hsl(200,100%,10%)";

        var colorScale = d3.scaleLinear()
            .domain([0, 20])
            .range([startColor, endColor])
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

        var text = g.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("fill", "black")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 5)
            .text("Nodes: " + graph.nodes.length)
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 20)
            .text("Links: " + graph.links.length);


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
            var content = "<h4>Standard Properties</h4><table class='table-bordered property-table'>";
            content += '<tr><td><b>Publisher</b></td><td>' + (d.publisher === null ? "N/A" : d.publisher) + '</td> </tr>';
            content += '<tr><td><b>Published Date</b></td><td>' + (d.publishDate === null ? "N/A" : d.publishDate) + '</td></tr>';
            content += '<tr><td><b>Developer</b></td><td>' + (d.developer === null ? "N/A" : d.developer) + '</td></tr>';
            content += '<tr><td><b>Official Resource</b></td><td>' + (d.officialResource === null? "N/A" : "<a href='" + d.officialResource + "'>Link to Resource</a>") + '</td></tr>';
            content += "</table>";
            console.log(content);
            $("#standardDetails").html(content);

        }

        function showMoleculeTable(id, label, links) {
            if(links.length){
                var content = "<h4>Related Standards</h4><table class='table-bordered property-table'>";
                for(var i = 0; i < links.length; i++){
                    content += "<tr><td><a href='" + links[i].id + "'>" + links[i].label + "</a></td></tr>";
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
                    return colorScale(d.weight);
                })
                .style("stroke", "#424242")
                .attr("cx", function (d) { return d.x+5; })
                .attr("cy", function(d) { return d.y-3; })
                .on("click", function (d) {
                    var info = "<h4>" + d.label + "</h4></br>" + d.comment + "</br></br><a href='" + d.id + "'>More information on " + d.label + "</a>";
                    showInfo(info);
                    showTable(d);

                    fetchMolecule(d.id, $('#togBtn').is(':checked')).then(readMoleculeData).then(function (links) {
                        showMoleculeTable(d.id, d.label, links);
                    });
                });

            label
                .attr("x", function(d) {
                    return d.x  - Math.sqrt(d.weight)/2 * (d.label.length);
                 })
                .attr("y", function (d) { return d.y; })
                .attr("font-size", function(d){
                    return Math.sqrt(d.weight) * 3;
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

    search_source = getUnique(search_source);

    $( "#search_box" ).autocomplete({
        source: search_source
    });

    run(networkData);

    function showMolecule(id, label, nodes) {
        nodes.push({id: id, label: label});
        var links=[];
        for(var key in nodes){
            links.push({
                source: id,
                target: nodes[key].id,
                value: 1
            });
        }

        $("#molecule").empty();

        var mol = d3.select("#molecule").append("svg")
            .attr("width", 200)
            .attr("height", 200);

        var mNode = mol.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 10)
            .attr("fill", "steelblue");

        var mLink = mol.selectAll("line")
            .data(links)
            .enter().append("line")
            .style("stroke", "#aaa");

        var mSimulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceCollide().radius(20))
            .force("r", d3.forceRadial(50))
            .force("center", d3.forceCenter(200 / 2, 200 / 2))
            .on("tick", mTicked);

        mSimulation.force("link")
            .links(links);

        function mTicked() {
            mNode
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            mLink
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }

    }

}