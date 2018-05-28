// var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
var url = 'https://dydra.com/mtasnim/sto/sparql';

function fetchData(url, query) {
    var promise = new Promise(function (resolve) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function (response) {
            var fetched_data = JSON.parse(response.target.response);
            if (fetched_data !== undefined) {
                resolve(fetched_data);
            }
        };
        xhr.send('query=' + query);
    });
    //Returns Promise object
    return promise;
};

function showInfo(html) {
    $("#sidebar-text").css('visibility', 'visible');
    $("#sidebar-text").html(html);
}

function adjustSize() {
    d3.selectAll('.resizeW').attr('width', $('.chart-container').width());
    d3.selectAll('.resizeH').attr('height', $('.chart-container').height());
    b.w = $('.chart-container').width() / 3;
    b.h = $('.chart-container').height() / 28;
}

function adjustTimeLine() {
    d3.selectAll('.resizeW').attr('width', $('.chart-container').width());
    d3.selectAll('.resizeH').attr('height', $('.chart-container').height());
    line_size = $('.chart-container').height() - 100;
}

function getUnique(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    return Object.keys(temp);
}

find_node = function(text, pageName){
    console.log("inside find_node " + pageName + " with " + text);
    if(pageName === "chart"){
        $(".hidden-in-export").remove();
        var class_name = text.replace(/[^A-Z0-9]+/ig, "-");
        class_name = class_name.toLowerCase();
        d3.selectAll("." + class_name)
            .each(function (d) {
                var r = d3.select(this).attr("r");
                var t = getTranslation(d3.select(this).attr("transform"));
                drawHalo(d3.select(this.parentNode), r, t[0], t[1]);
            })
    }
    else if(pageName === "map"){
        var marker = marker_list[text];
        marker.enablePermanentHighlight();
    }
    else if(pageName === "timeline"){
        $(".highlight-circle").removeClass('highlight-circle');
        $(".highlight-text").removeClass('highlight-text');
        var circle_name = "tCircle_" + text;
        var text_name = "tLabel_" + text;
        d3.select("#" + circle_name).classed('highlight-circle', true);
        d3.select("#" + text_name).classed('highlight-text', true);
    }



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

function search_chart(pageName){
    // get the searched node name
    var text = $('#search_box').val();
    find_node(text, pageName);
}