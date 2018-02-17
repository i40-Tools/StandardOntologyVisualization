/**
 * Created by mayesha on 1/11/2018.
 */

function drawChart(json) {
    var svg = d3.select("#chart"),
        margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

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
        .size([diameter - margin, diameter - margin])
        .padding(2);

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
        .attr("id", function(d,i){ return d.data.id})
        .attr("class", function (d) {
            return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
        })
        .attr("text-overflow", "ellipsis")
        .style("fill", function (d) {
            if (d.depth === 0) return "#e8e8e8";
            var scheme = colorScheme(d.data.colIndex);
            return scheme(d.depth);
        })
        .style("stroke", "#373c48")
        .on("click", function (d) {
            if (focus !== d) zoom(d), d3.event.stopPropagation();
        });


    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("font-size", function (d) {
            if(!d.children){
                return Math.sqrt(d.r) * 5
            }
            return Math.sqrt(d.r) * 3

        })
        .attr("text-overflow", "ellipsis")
        .style("text-overflow", "ellipsis")
        .style("fill-opacity", function (d) {
            return d.parent === root ? 1 : 0;
        })
        .style("display", function (d) {
            return d.parent === root ? "inline" : "none";
        })
        .tspans(function(d) {
            return d3.wordwrap(d.data.name, 15);  // break line after 15 characters
        }, function(d){return Math.sqrt(d.r) * 2.5})
        .on("click", function (d) {
            window.open(d.parent.data.id);
        });

    var node = g.selectAll("circle, text");

    svg
        .style("background", "white")
        .on("click", function () {
            zoom(root);
        });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus;
        focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function (t) {
                    zoomTo(i(t));
                };
            });

        transition.selectAll("text")
            .filter(function (d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function (d) {
                return d.parent === focus ? 1 : 0;
            })
            .on("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
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
}