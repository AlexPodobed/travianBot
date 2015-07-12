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
    function removeElementFromList(arr, id){
      for (var i = 0; i < arr.length; i++) {
        var el;
        if (arr[i].id == id) {
          el = arr[i];
          arr.splice(i, 1);
          break;
        }
      }
      return el;
    }
    function addUrlToImg(res, url){
      var mapObj = {
        "hero_image":  url + "hero_image",
        "img/x.gif": url + "img/x.gif"
      };
      var result = res.replace(/hero_image|img\/x\.gif/gi, function(matched){
        return mapObj[matched];
      });

      return result;
    }
    function getResourceFuildhash(){
        return {1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9, 11: 10, 12: 11, 13: 12, 14: 13, 15: 14, 16: 15, 17: 16, 18: 17}
    }

    return {
        matchUrl: matchUrl,
        sendMessage: sendMessage,
        onMessage: onMessage,
        getIdformUrl: getIdformUrl,
        Iterator: Iterator,
        parseStringToDate: parseStringToDate,
        removeElementFromList:removeElementFromList,
        addUrlToImg:addUrlToImg,
        getResourceFuildhash: getResourceFuildhash
    }
})();
