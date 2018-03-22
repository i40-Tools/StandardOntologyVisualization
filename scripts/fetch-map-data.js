function fetchMapData() {
    var url = 'http://vocol.iais.fraunhofer.de/sto/fuseki/dataset/query';
    var query = "SELECT ?subject ?object WHERE { \
            ?subject <https://w3id.org/i40/sto#hasHeadquaterIn> ?object . \
    }";
    var promise = new Promise(function (resolve) {
        var data, xhr;
        xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function (response) {
            var fetched_data = JSON.parse(response.target.response);
            if (fetched_data !== undefined) {
                console.log("map fetched data");
                console.log(fetched_data);
                resolve(fetched_data);
            }
        };
        xhr.send('query=' + query);
    });
    //Returns Promise object
    return promise;
};

function parseCountryUri(string) {
    var country = string.split('#')[1];
    return country.replace("_", " ");
}

function readMapData(data) {
    var promise = new Promise(function (resolve) {
        var countryData = data.results.bindings;
        var countryList = [];
        for (var i in countryData) {
            var obj = countryData[i];
            var mapData = {
                "country" : parseCountryUri(obj.object.value),
                "initiative" : obj.subject.value
            };
            countryList.push(mapData);
        }
        resolve(countryList);
    });
    return promise;
}