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
    $("#sidebar-info").css('visibility', 'visible');
    $("#sidebar-info").html(html);
}