function init(){
    var origins = ['Enfield','Greenwich','Hackney','Hammersmith+and+Fulham','Haringey','Harrow','Havering','Hillingdon','Hounslow','Islington','Kensington+and+Chelsea','Kingston+upon+Thames','Lambeth','Lewisham','Merton','Newham','Redbridge','Richmond+upon+Thames','Southwark','Sutton','Tower+Hamlets','Waltham+Forest','Wandsworth','Westminster,City+of+London'];
    var dest = "Barking+and+Dagenham|Barnet|Bexley|Brent|Bromley|Camden|Croydon|Ealing|Enfield|Greenwich|Hackney|Hammersmith+and+Fulham|Haringey|Harrow|Havering|Hillingdon|Hounslow|Islington|Kensington+and+Chelsea|Kingston+upon+Thames|Lambeth|Lewisham|Merton|Newham|Redbridge|Richmond+upon+Thames|Southwark|Sutton|Tower+Hamlets|Waltham+Forest|Wandsworth|Westminster,City+of+London";
    var key = "AIzaSyA2bdjQuDxeFbDps4sCDbUpTRmonhpCCPY"

    var url = "https://maps.googleapis.com/maps/api/distancematrix/json?region=uk&key=" + key + "&destinations=" + dest;

    var res = [];

    for(var index in origins){
        console.log(origins[index]);
        var obj = {
            "origin" : origins[index],
            "data" : {}
        };
        $.ajax({
            url: url + "&origins=" + origins[index],
            crossDomain: true,
            dataType: 'json',
            async: false,
            jsonp: false,
            success: function(data) {
                obj.data = data.rows[0].elements;
            },
            type: 'GET'
        });
        res.push(obj);
    }

    setTimeout(function(){ console.log(JSON.stringify(res)) }, 10000);
}