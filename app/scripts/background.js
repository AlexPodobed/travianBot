'use strict';

console.info("background script initialized");

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});
chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});



function sendMessage(event, data) {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
      if(tabs[0] && tabs[0].id){
        chrome.tabs.sendMessage(tabs[0].id, {
          type: event,
          data: data
        });
      }else {
        console.log('error with tabs');
      }
    });
}
function getBuildList(){
    return JSON.parse(localStorage.getItem('build_list')) || [];
}
function setBuildList(arr){
    var arrToStr = JSON.stringify(arr);
    localStorage.setItem('build_list', arrToStr);
}



// TODO: now is hardcoded, need to get it from content script
var rootUrl = "http://tx3.travian.co.uk/";
var buildList = getBuildList();

console.log(buildList);


chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case "tb-add-to-queue":
            buildList.push(request.data);
            setBuildList(buildList);
            break;
        case "tb-remove-from-queue":
            Utils.removeElementFromList(buildList,request.data.id);
            setBuildList(buildList);
            break;
        case "tb-get-queue-list":
            sendMessage("tb-send-queue-list", buildList);
            break;
        case "tb-start-auto-building":
            autoBuilder.init();
            break;
    }
    return true;
});


var autoBuilder = (function(){
  var parseStringToDate = Utils.parseStringToDate;
  var iterator = Utils.Iterator(buildList);

  function getBuildingDetails(id){
    console.log(rootUrl+'build.php?id='+ id);
    return jQuery.get(rootUrl+'build.php?id='+ id);
  }

  function build(url){
    return jQuery.get(rootUrl + url);
  }

  function initRecurcive() {

    if (iterator.hasNext()) {
      var currentObj = iterator.next();

      console.log("Iterator Index:",iterator.index, iterator)

      getBuildingDetails(currentObj.id)
        .success(function(res){

          console.log('1st AJAX: success');
          var fixedResponse = Utils.addUrlToImg(res,rootUrl);
          var $res = jQuery(fixedResponse);
          var $btn = $res.find("#contract button:first");

          if($btn.hasClass("green build")){
            var timeToWait = parseStringToDate($res.find("#contract .clocks").text());
            var buildIrl = $btn.attr('onclick').split("'")[1];

            build(buildIrl).success(function () {
              console.log(currentObj.name,currentObj.id, timeToWait, new Date());
              // TODO: remove from localStorage and on View

              buildList.shift();
              iterator.index -= 1;
              setBuildList(buildList);
              sendMessage("tb-remove-from-list", currentObj.id);

              //removeFromQueue(currentObj.id);
              setTimeout(initRecurcive, timeToWait+2000);
            });

          }else{
            console.log('smtng went wrong',$btn);
            // TODO: think about make some delay and continue from this point
          }
        });
    } else {
      console.log("finish");
      return;
    }
  }

  return {
    init: initRecurcive
  }
})();



















//  Long-Lived Connections

/*
chrome.runtime.onConnect.addListener(function (port) {

    if (port.name == "my-channel") {
        port.onMessage.addListener(function (msg) {
            // do some stuff here
            console.log(msg)
        });

        setTimeout(function () {
            port.postMessage({lala: "value"});
        }, 2e3)
    }
});
*/


