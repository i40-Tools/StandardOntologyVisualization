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