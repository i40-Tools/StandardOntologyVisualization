function loadVenn(vennData) {

    console.log(vennData);

    var setData = getSets(vennData);
    showStats(setData);

    function showStats(d) {
        var content = "<table class='table-bordered property-table'><tr><td>Frameworks</td><td>Number of connected Concerns</td></tr>";
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

    var layout = d3.layout.venn()
        .size([width, height])
        .padding(0)
        .packingStragegy(d3.layout.venn.force)

    var svg = d3.select(".chart-container")
        .append("svg")
        .attr("id", "venn")
        .attr('width', width)
        .attr('height', height)
        .call(d3.behavior.zoom().on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }));

    var isFirstLayout = true;

    var globalData = [],
        generator = 0;

    function refresh(data) {
        if (data) {
            // we recalculate the layout for new data only
            layout.nodes(data)
        }

        var vennArea = svg.selectAll("g.venn-area")
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
            .attr('class', 'venn-area-path')
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


        vennArea.selectAll('path.venn-area-path').transition()
            .duration(isFirstLayout ? 0 : 800)
            .attr('opacity', 0.2)
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

        //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
        vennArea.selectAll('circle.inner').data(function (d) {
            return [d];
        }).transition()
            .duration(isFirstLayout ? 0 : 800)
            .attr('opacity', 0.1)
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
            .duration(800)
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
            .duration(isFirstLayout ? 0 : 800)
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

    return refresh(vennData)
}

function getSets(data){
    var temp = {};
    for(let i = 0; i < data.length; i++){
        var obj = data[i];
        if(temp[obj.set.toString()] !== undefined){
            temp[obj.set.toString()]++;

        }
        else{
            temp[obj.set.toString()] = 1;
        }
        if(obj.set.length > 1){
            for(var j=0; j < obj.set.length; j++){
                if(temp[obj.set[j]] !== undefined){
                    temp[obj.set[j]]++;
                }
                else{
                    temp[obj.set[j]] = 1;
                }
            }
        }
    }
    return temp;
}

