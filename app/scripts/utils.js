console.info('utils fired');

var Utils = (function(){

    function matchUrl(pathname, search, callback){
        var expression1 = (pathname) ? (location.pathname.indexOf(pathname) >= 0) : true ;
        var expression2 = (search) ? (location.search.indexOf(search) >= 0) : true ;

        if(expression1 && expression2){
            callback.apply(null, arguments)
        }
    }
    function sendMessage(event, data) {
        chrome.extension.sendMessage({
            type: event,
            data: data || {}
        });
    }
    function onMessage(eventType, callback){
        chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
            if(request.type === eventType){
                callback(request)
            }
            return true;
        });
    }
    function getIdformUrl(str, match) {
        var query = str.substring(1).split("&"),
            id;

        query.map(function (keyVal) {
            var param = keyVal.split('=');
            if (param[0] === match) {
                id = param[1];
            }
        });
        return id;
    }
    function Iterator(arr){
        function Iterator (items) {
            this.index = 0;
            this.items = items;
        };

        Iterator.prototype = {
            first: function () {
                this.reset();
                return this.next();
            },
            next: function () {
                return this.items[this.index++];
            },
            hasNext: function () {
                return this.index < this.items.length;
            },
            reset: function () {
                this.index = 0;
            },
            size: function () {
                return this.items.length
            }
        };

        return new Iterator(arr);
    }
    function parseStringToDate(str) {
        var timeArr,
            h, m, s;

        timeArr = str.split(':');
        h = +timeArr[0];
        m = +timeArr[1];
        s = +timeArr[2];

        return h * 60 * 60 * 1000 + m * 60 * 1000 + s * 1000;
    }


    return {
        matchUrl: matchUrl,
        sendMessage: sendMessage,
        onMessage: onMessage,
        getIdformUrl: getIdformUrl,
        Iterator: Iterator,
        parseStringToDate: parseStringToDate
    }
})();
