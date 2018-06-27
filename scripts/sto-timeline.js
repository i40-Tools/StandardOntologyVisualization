var line_size = 0;

function drawTimeline(dates) {
    var search_source = $.map(dates, function(d){
        return d.abbr;
    });
    search_source = getUnique(search_source);
    $( "#search_box" ).autocomplete({
        source: search_source
    });

    var margin = {top: 50, right: 100, bottom: 50, left: 0},
        width = $('.chart-container').width(),
        height = $('.chart-container').height();

    line_size = height - margin.top - margin.bottom;

    var x = d3.scaleTime()
        .domain([new Date(1870, 1, 1), new Date(2008, 1, 1) - 1])
        .rangeRound([0, width]);

    var xAxis = d3.axisBottom(x);

    var parseDate = d3.timeFormat("%Y-%m-%d");

    var HEIGHT_LEVELS = 8.0;

    var svg = d3.select(".chart-container")
        .append("svg")
        .attr("class", "resizeW resizeH")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", zoom))
        .append("g")
        .attr("transform", "translate(-" + margin.top + "," + margin.top + ")");

    var x_axis = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height/2 - margin.top) + ")")
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
            return "tCircle_" + d.abbr;
        })
        .attr('cx', function (d) {
            return x(d.date);
        })
        .attr('cy', function (d,i) {
            var mod = i % HEIGHT_LEVELS;
            switch(mod){
                case 0: return line_size;
                case 1: return 0;
                case 2: return 7/8 * line_size;
                case 3: return 1/8 * line_size;
                case 4: return 6/8 * line_size;
                case 5: return 2/8 * line_size;
                case 6: return 5/8 * line_size;
                case 7: return 3/8 * line_size;
            }
            // var size = 0;
            // if (mod < HEIGHT_LEVELS / 2) size = ((HEIGHT_LEVELS - mod) / HEIGHT_LEVELS) * line_size;
            // else size = ((HEIGHT_LEVELS - mod - 1) / HEIGHT_LEVELS) * line_size;
            // return size;
        })
        .attr('r', 8)
        .style('fill', "#0a5c9a")
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.abbr === undefined || d.abbr === "" ? d.name : d.name + " (" + d.abbr + ")")
                .style("height", d.name.length)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (d) {
            d3.selectAll(".highlight-circle").classed("highlight-circle", false);
            d3.selectAll(".highlight-text").classed("highlight-text", false);
            d3.select(this).classed("highlight-circle", true);
            d3.select("#tLine_" + d.abbr).classed("highlight-circle", true);
            d3.select("#tLabel_" + d.abbr).classed("highlight-text", true);
            var abbr = d.abbr;
            if(abbr === "") abbr = d.name;
            var info = "<h4>" + d.name + "</h4></br><b>Formed on: </b>" + parseDate(d.date) + "</br></br>" + d.comment + "</br></br><a href='" + d.id + "'>More information on " + abbr + "</a>";
            showInfo(info);
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
            return line_size/2;
        })
        .style("stroke", "#454545");

    var labels = svg.selectAll('.circle-container')
        .insert('text', ':first-child')
        .attr("id", function (d, i) {
            return "tLabel_" + d.abbr;
        })
        .attr("x", function (d) {
            var circleX = d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cx');
            return parseInt(circleX) + 10;
        })
        .attr("y", function (d, i) {
            var circleY = d3.select(this.parentNode).selectAll(".time-span-rect").node().getAttribute('cy');
            // if(parseInt(circleY) > height/2) return parseInt(circleY) + 30;
            // else
                return parseInt(circleY);
        })
        .attr("font-size", function () {
            return 14;
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
