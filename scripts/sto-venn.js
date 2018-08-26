function loadVenn(vennData) {

    var width = 600,
        height = 600,
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

    var layout = d3.layout.venn()
        .size([width, height])
        .padding(0)
        .packingStragegy(d3.layout.venn.force)

    svg = d3.select(".chart-container")
        .append("svg")
        .attr("id", "venn")
        .attr('width', width)
        .attr('height', height),
        isFirstLayout = true;

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

        //we need to rebind data so that parent data propagetes to child nodes (otherwise, updating parent has no effect on child.__data__ property)
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
};
