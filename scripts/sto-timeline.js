function drawTimeline(dates) {
    var margin = {top: 100, right: 40, bottom: 200, left: 40},
        width = 1400 - margin.left - margin.right,
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
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis
            .ticks(dates.length)
            .tickPadding(10));

    var rects = svg.selectAll('.time-span-rect')
        .data(dates)
        .enter().append('circle')
        .attr('class', 'time-span-rect')
        .attr('cx', function (d) {
            return x(d.date);
        })
        .attr('cy', function () {
            return 100 + Math.floor((Math.random() * height - 100) + 1)
        })
        .attr('r', 10)
        .style('fill', function () {
            return colorScale(Math.floor((Math.random() * 10) + 1))
        })
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.name + "<br/> (" + parseDate(d.date) + ")")
                .style("height", d.name.length)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
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
    }
}
