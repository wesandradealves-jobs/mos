function urlQueryObj() {
    var result = {}, keyValuePairs = location.search.slice(1).split("&");
    keyValuePairs.forEach(function(keyValuePair) {
        keyValuePair = keyValuePair.split('=');
        if ( keyValuePair[1] ) {
	        result[decodeURIComponent(keyValuePair[0])] = JSON.parse(decodeURIComponent(keyValuePair[1])) || '';
        }
    });
    return result;
}
