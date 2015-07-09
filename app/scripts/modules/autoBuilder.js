console.info("auto-builder module loaded");

var Build = (function () {
  var buildQueue;
  var $div;
  var activeVillageID;


  function sendMessage(event, data) {
    chrome.extension.sendMessage({
      type: event,
      data: data || {}
    });
  }

  function listenEvent(callback){
    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
      if(request.type === 'tb-send-queue-list'){
        console.log('build list recived');
        buildQueue = request.data;
        callback();
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
  function getQueueList() {
    sendMessage("tb-get-queue-list", {})
  }

  function createBtn() {
    var btn = jQuery('<button>');
    btn.text("add to smart queue");
    btn.addClass('tb-btn');
    return btn;
  }

  function generateBuildingsList() {
    var $span = jQuery("<span>"),
      $ul = jQuery("<ul>"),
      $li = jQuery("<li>");

    if ($div) $div.remove();
    $div = jQuery("<div>");
    activeVillageID = getIdformUrl(jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active").attr('href'), 'newdid');
    console.log(buildQueue)
    if (buildQueue.length) {
      buildQueue.filter(function (el) {
        return el.villageId == activeVillageID
      }).map(function (buildObj) {
        var li = $li.clone().text(buildObj.name);
        var span = $span.clone().text('x');
        span.on('click', function () {
          removeFromQueue(buildObj.id)
        });
        $ul.append(li.append(span));
      });
      $div.addClass("tb-buildings-list");
      $div.addClass("sidebarBox").append($ul);

      $div.insertAfter('#sidebarBoxQuestachievements');
    }

  }

  function removeFromQueue(id) {

    for(var i = 0; i < buildQueue.length; i++){
      if (buildQueue[i].id == id) {
        buildQueue.splice(i, 1);
        break;
      }
    }

    console.log(buildQueue)
    //localStorage.setItem('build_queue', JSON.stringify(buildQueue));
    sendMessage("tb-remove-from-queue", buildQueue);
    generateBuildingsList();
  }



  function addToQueue() {
    console.log('added to queue');

    var id = getIdformUrl(location.search, "id");
    var name = jQuery.trim(jQuery(".titleInHeader").contents()[0].wholeText) + " (" + jQuery.trim(jQuery(".titleInHeader span").text()) + "+1)";
    var buildObj = {
      id: id,
      name: name,
      villageId: activeVillageID,
    };

    buildQueue.push(buildObj);

    sendMessage("tb-add-to-queue", buildObj);
    generateBuildingsList();
  }

  function renderAddtoQueueBtn() {
    var btn = createBtn();
    btn.on('click', addToQueue);

    jQuery("#contract .contractLink").append(btn);
  }


  function init() {
    getQueueList();
    listenEvent(generateBuildingsList);
  }

  function PoC(){

    var Iterator = function(items) {
      this.index = 0;
      this.items = items;
    }

    Iterator.prototype = {
      first: function() {
        this.reset();
        return this.next();
      },
      next: function() {
        return this.items[this.index++];
      },
      hasNext: function() {
        return this.index < this.items.length;
      },
      reset: function() {
        this.index = 0;
      },
      size: function(){
        return this.items.length
      }
    }


    var arr = [{
      "time": "0:01:02",
      "name": "id_21"
    }, {
      "time": "0:01:30",
      "name": "id_22"
    }, {
      "time": "0:02:20",
      "name": "id_23"
    }];


    function parseStringToDate(str) {
      var timeArr,
        h, m, s;

      timeArr = str.split(':');
      h = +timeArr[0];
      m = +timeArr[1];
      s = +timeArr[2];

      return h * 60 * 60 * 1000 + m * 60 * 1000 + s * 1000;;
    }

    var iterator = new Iterator(arr);

    function getData(str, callback){
      console.log(str, new Date());

      callback.apply(this, arguments);
    }


    var iteration = 0;
    function initRecurcive() {
      if (iterator.hasNext()) {
        var currentObj = iterator.next();
        var timeToWait = parseStringToDate(currentObj.time);

        getData(currentObj.name, function(){
          setTimeout(initRecurcive, timeToWait);
        });
      } else{
        console.log("finish");
        return;
      }
    }

  }


  return {
    renderAddtoQueueBtn: renderAddtoQueueBtn,
    generateList: generateBuildingsList,
    init: init
  }
}());