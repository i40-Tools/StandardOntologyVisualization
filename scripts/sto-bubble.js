/**
 * Created by mayesha on 1/11/2018.
 */

var find_node;
var blink_flag = true;
var b;

function drawBubbleChart(json, width, height) {
    var width = $(".chart-container").width();
    var height = $(".chart-container").height();
    var svg = d3.select(".chart-container")
            .append("svg")
            .attr("class", "resizeW resizeH")
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox','0 0 '+ width +' '+ height)
            .attr('preserveAspectRatio','xMinYMin'),
        margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var colorScheme = function (colorIndex) {
        var endColor;
        var startColor;

        // SPECTRUM_MAX indicates the max length of the HSL color spectrum
        // COLINDEX_MAX indicates the total number of 1st level groups in data
        // OFFSET is used to get the center value of spectral section

        var SPECTRUM_MAX = 360;
        var COLINDEX_MAX = 4;
        var OFFSET = ( SPECTRUM_MAX / COLINDEX_MAX ) / 2;

        var hue = ( ( SPECTRUM_MAX / COLINDEX_MAX) * colorIndex ) + OFFSET;
        startColor = "hsl(" + hue + ",100%,100%)";
        endColor = "hsl(" + hue + ",100%,30%)";

        return d3.scaleLinear()
            .domain([-1, 5])
            .range([startColor, endColor])
            .interpolate(d3.interpolateHcl);
    };

    var pack = d3.pack()
        .size([width,height])
        .padding(2);

    initializeBreadcrumbTrail();

    var root = d3.hierarchy(json)
        .sum(function (d) {
            return d.size;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    var focus = root,
        nodes = pack(root).descendants(),
        view;

    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("id", function (d, i) {
                return "node_" + i;
            }
        )
        .attr("class", function (d) {
            var name = d.data.name.replace(/[^A-Z0-9]+/ig, "-");
            name = name.toLowerCase();
            return d.parent ? d.children ? "node " + name  : "node node--leaf " + name : "node node--root " + name;
        })
        .attr("text-overflow", "ellipsis")
        .style("fill", function (d) {
            if (d.depth === 0) return "#ffffff";
            var scheme = colorScheme(d.data.colIndex);
            return scheme(d.depth);
        })
        .style("stroke", function (d) {
            if (d.depth === 0) return "#ffffff";
            return "#373c48";
        })
        .on("click", function (d) {
            if (focus !== d) zoom(d), d3.event.stopPropagation();
            var sequenceArray = d.ancestors().reverse();
            sequenceArray.shift();
            updateBreadcrumbs(sequenceArray);
            var info = "<h4>" + d.data.name + "</h4></br>" + d.data.comment + "</br></br><a href='" + d.data.id + "'>More information on " + d.data.name + "</a>";
            showInfo(info);
        });


    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("font-size", function (d) {
            if(!d.children){
                return Math.sqrt(d.r) * 5
            }
            return Math.sqrt(d.r) * 2.5

        })
        .style("fill-opacity", function (d) {
            return d.parent === root ? 1 : 0;
        })
        .style("display", function (d) {
            return d.parent === root ? "inline" : "none";
        })
        .tspans(function(d) {
            return d3.wordwrap(d.data.name, 10);  // break line after 15 characters
        }, function(d){return Math.sqrt(d.r) * 4})
        .append("svg:title")
        .text(function(d,i){
            return d.parent.data.name;
        });

    var node = g.selectAll("circle, text");

    svg
        .style("background", "white")
        .on("click", function () {
            zoom(root);
            updateBreadcrumbs([]);
        });

    zoomTo([root.x, root.y, root.r * 3 + margin]);

    function zoom(d) {
        var focus0 = focus;
        focus = d;

        $(".hidden-in-export").remove();

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 3 + margin]);
                return function (t) {
                    zoomTo(i(t));
                };
            });

        transition.selectAll(".node-label")
            .filter(function (d) {
                return d.parent === focus || d === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function (d) {
                if (!d.children){
                    return (d.parent === focus || d === focus) ? 1 : 0;
                }
                else{
                    return d.parent === focus ? 1 : 0;
                }
            })
            .on("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function (d) {
                if (!d.children){
                    if (d.parent !== focus && d !== focus){
                        this.style.display = "none";
                    }
                    else{
                        this.style.display = "inline";
                    }
                }
                else{
                    if (d.parent !== focus) this.style.display = "none";
                }
            });
    }

    function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function (d) {
            return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function (d) {
            return d.r * k;
        });
    }

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    b = {
        w: (width) / 3, h: (height) / 22, s: 2, t: 5
    };


    function initializeBreadcrumbTrail() {
        // Add the svg area.
        var trail = d3.select("#sequence").append("svg:svg")
            .attr("width", width)
            .attr("height", 50)
            .attr("id", "trail")
            .attr("class", "resizeW");
    }

    // Generate a string that describes the points of a breadcrumb polygon.
    function breadcrumbPoints(d, i) {
        var points = [];
        points.push("0,0");
        points.push(b.w + ",0");
        points.push(b.w + b.t + "," + (b.h / 2));
        points.push(b.w + "," + b.h);
        points.push("0," + b.h);
        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
            points.push(b.t + "," + (b.h / 2));
        }
        return points.join(" ");
    }

    function clearTrail(nodeArray, d){
        for(var index in nodeArray){
            if(d === nodeArray[index]){
                updateBreadcrumbs(nodeArray.slice(0, index + 1));
            }
        }
    }

    // Update the breadcrumb trail to show the current sequence and percentage.
    function updateBreadcrumbs(nodeArray) {

        // Data join; key function combines name and depth (= position in sequence).
        var trail = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function(d) { return d.data.name + d.depth; });

        // Remove exiting nodes.
        trail.exit().remove();

        // Add breadcrumb and label for entering nodes.
        var entering = trail.enter().append("svg:g");

        entering.append("svg:polygon")
            .attr("points", breadcrumbPoints)
            .style("fill", function(d) {
                if (d.depth === 0) return "#e8e8e8";
                var scheme = colorScheme(d.data.colIndex);
                return scheme(d.depth);
            })
            .attr("class", "breadcrumb")
            .on("click", function (d) {
                zoom(d);
                clearTrail(nodeArray, d);
            });

        entering.append("svg:text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "12pt")
            .attr("class", "breadcrumb")
            .text(function(d) { return d.data.name; })
            .on("click", function (d) {
                zoom(d);
                clearTrail(nodeArray, d);
            });

        // Merge enter and update selections; set position for all nodes.
        entering.merge(trail).attr("transform", function(d, i) {
            return "translate(" + i * (b.w + b.s) + ", 0)";
        });

        // Make the breadcrumb trail visible, if it's hidden.
        d3.select("#trail")
            .style("visibility", "");

    }

    var search_source = $.map(nodes, function(d){
        return d.data.name;
    });

    search_source = getUnique(search_source);
    console.log(search_source);


    $( "#search_box" ).autocomplete({
        source: search_source
    });

    // find gene in clustergram
    find_node = function(text){
        $(".hidden-in-export").remove();
        console.log("Inside find_node for " + text);
        var class_name = text.replace(/[^A-Z0-9]+/ig, "-");
        class_name = class_name.toLowerCase();
        var colArray = [];
        var sel = d3.selectAll("." + class_name)
            .each(function (d) {
                var r = d3.select(this).attr("r");
                var t = getTranslation(d3.select(this).attr("transform"));
                drawHalo(d3.select(this.parentNode), r, t[0], t[1]);
            })

        // function blink() {
        //     if(blink_flag){
        //         d3.selectAll("." + class_name).transition()
        //             .duration(1000)
        //             .style("fill", "rgb(255,255,0)")
        //             .transition()
        //             .duration(1000)
        //             .style("fill", "rgb(255,255,255)")
        //             .on("end", blink)
        //     }
        //     else{
        //         var counter = 0;
        //         d3.selectAll("." + class_name)
        //             .each(function (d,i) {
        //                 d3.select(this).style("fill", colArray[counter]);
        //                 counter = counter + 1;
        //             })
        //     }
        // }
        // blink();
    };

    function drawHalo(container, radius, x, y) {
        if (container===undefined){
            return null;
            // there is no element to add the halo to;
            // this means the node was not rendered previously
        }


        var haloGroupElement = container
            .append("g")
            .classed("hidden-in-export", true);


        var el = haloGroupElement
            .append("circle",":first-child")
            .classed("searchResultA", true)
            .attr("r", radius)
            .attr("cx", x)
            .attr("cy", y);


        haloGroupElement.attr("animationRunning",true);


        haloGroupElement.node().addEventListener("webkitAnimationEnd", function(){
            var test=haloGroupElement.selectAll(".searchResultA");
            test.classed("searchResultA", false)
                .classed("searchResultB", true)
                .attr("animationRunning",false);
            haloGroupElement.attr("animationRunning",false);
        });
        haloGroupElement.node().addEventListener("animationend", function(){
            var test=haloGroupElement.selectAll(".searchResultA");
            test.classed("searchResultA", false)
                .classed("searchResultB", true)
                .attr("animationRunning",false);
            haloGroupElement.attr("animationRunning",false);
        });

        return haloGroupElement;
    };



}

function getTranslation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    var matrix = g.transform.baseVal.consolidate().matrix;

    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
}

function getUnique(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    return Object.keys(temp);
}

function search_chart(){
    // get the searched node name
    blink_flag = true;
    console.log("inside search chart");
    var text = $('#search_box').val();
    find_node(text);
}

function reset_flag() {
    blink_flag = false;
    $('#search_box').val('');
}