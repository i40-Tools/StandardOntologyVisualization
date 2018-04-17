function drawTimeline(dates) {
    var margin = {top: 100, right: 600, bottom: 200, left: 0},
        width = $(window).width() - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

    var x = d3.scaleTime()
        .domain([new Date(1870, 1, 1), new Date(2008, 1, 1) - 1])
        .rangeRound([0, width]);

    var xAxis = d3.axisBottom(x);

    var parseDate = d3.timeFormat("%Y-%m-%d");


    var svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", zoom))
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(xAxis
            .ticks(dates.length)
            .tickPadding(10));

    var rects = svg.selectAll('.time-span-rect')
        .data(dates)
        .enter()
        .append("g")
        .attr("class", "circle-container")
        .append('circle')
        .attr('class', 'time-span-rect')
        .attr('id', function (d, i) {
            return "circle_" + i;
        })
        .attr('cx', function (d) {
            return x(d.date);
        })
        .attr('cy', function (d,i) {
            if(i % 4 === 0) return height;
            else if(i % 4 === 1) return (3 * height/4);
            else if(i % 4 === 2) return height/4;
            else return 0;
        })
        .attr('r', 10)
        .style('fill', "#0a5c9a")
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.name)
                .style("height", d.name.length)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (d, i) {
            d3.selectAll(".highlight-circle").classed("highlight-circle", false);
            d3.selectAll(".highlight-text").classed("highlight-text", false);
            d3.select(this).classed("highlight-circle", true);
            d3.select("#tLine_" + d.abbr).classed("highlight-circle", true);
            d3.select("#tLabel_" + d.abbr).classed("highlight-text", true);
            $("#sidebar-info").css('visibility', 'visible');
            $("#sidebar-info").html("<h4>" + d.name + "</h4></br><b>Formed on: </b>" + parseDate(d.date) + "</br></br>" + d.comment);
        });

    var line = svg.selectAll('.circle-container')
        .insert('line', ':first-child')
        .attr('id', function (d, i) {
            return "tLine_" + d.abbr;
        })
        .attr("x1", function () {
            return d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cx');
        })
        .attr("x2", function () {
            return d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cx');
        })
        .attr("y1", function () {
            return d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cy');
        })
        .attr("y2", function () {
            return height/2;
        })
        .style("stroke", "#454545");

    var labels = svg.selectAll('.circle-container')
        .insert('text', ':first-child')
        .attr("id", function (d, i) {
            return "tLabel_" + d.abbr;
        })
        .attr("x", function (d) {
            var circleX = d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cx');
            return parseInt(circleX) - 15;
        })
        .attr("y", function (d, i) {
            var circleY = d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cy');
            if(parseInt(circleY) > height/2) return parseInt(circleY) + 30;
            else return parseInt(circleY) - 20;
        })
        .attr("font-size", function () {
            return 20;
        })
        .text(function (d) {
            return d.abbr;
        });


    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function zoom() {
        // re-scale y axis during zoom; ref [2]
        x_axis.transition()
            .duration(50)
            .call(xAxis.scale(d3.event.transform.rescaleX(x)));

        // re-draw circles using new y-axis scale; ref [3]
        var new_xScale = d3.event.transform.rescaleX(x);
        rects.attr("cx", function (d) {
            return new_xScale(d.date);
        });
        line.attr("x1", function (d) {
            return new_xScale(d.date);
        });
        line.attr("x2", function (d) {
            return new_xScale(d.date);
        });
        labels.attr("x", function (d) {
            return parseInt(new_xScale(d.date)) + 10;
        });
    }
}
