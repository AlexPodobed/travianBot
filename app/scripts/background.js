'use strict';

console.info("background script initialized");

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});
chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});


function sendMessage(event, data) {
    chrome.tabs.query({active:true,currentWindow: true}, function (tabs) {
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
var isAutoBuildingLoop = false;

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
            sendMessage("tb-send-queue-list", {
                buildList: buildList,
                isLoopActive: isAutoBuildingLoop
            });
            break;
        case "tb-trigger-auto-building":
            isAutoBuildingLoop = request.data.isLoopActive;
            console.log(isAutoBuildingLoop)
            if(isAutoBuildingLoop){
                sendMessage('tb-auto-build-event', {
                    type: "info",
                    title: "auto-building",
                    message: "Started"
                });
                autoBuilder.startRecursive();
            } else {
                autoBuilder.stopRecurcive();
            }

            break;
    }
    return true;
});


var autoBuilder = (function(){
  var parseStringToDate = Utils.parseStringToDate;
  var iterator = Utils.Iterator(buildList);
  var timerId;

  function getBuildingDetails(build){
    console.log(rootUrl+'build.php?id='+ build.id);
    return jQuery.get(rootUrl+'build.php?newdid='+build.villageId+'&id='+ build.id);
  }

  function build(url){
    return jQuery.get(rootUrl + url);
  }

  function stopRecurcive(){
      isAutoBuildingLoop = false;
      iterator.reset();
      clearTimeout(timerId);
      sendMessage("tb-send-queue-list", {
          buildList: buildList,
          isLoopActive: isAutoBuildingLoop
      });
  }

  function startRecursive() {

    if (iterator.hasNext() && isAutoBuildingLoop) {
      var currentObj = iterator.next();

      console.log("Iterator Index:",iterator.index, iterator)

      getBuildingDetails(currentObj)
        .success(function(res){

          console.log('1st AJAX: success');
          var fixedResponse = Utils.addUrlToImg(res,rootUrl);
          var $res = jQuery(fixedResponse);
          var $btn = $res.find("#contract button:first");

          if($btn.hasClass("green build")){
            var timeToWait = parseStringToDate($res.find("#contract .clocks").text());
            var buildIrl = $btn.attr('onclick').split("'")[1];

            build(buildIrl).success(function () {
              console.log(currentObj.name,currentObj.id, timeToWait, new Date().toGMTString());

              buildList.shift();
              iterator.index -= 1;
              setBuildList(buildList);sendMessage('tb-auto-build-event', {
                    type: "success",
                    title: currentObj.villageName,
                    message: currentObj.name + " successfully started building"
                });
              sendMessage("tb-remove-from-list", currentObj.id);
              console.log(new Array(80).join("-"));

              timerId = setTimeout(startRecursive, timeToWait+2000);
            });

          }else{
            // this case is works when we don't have enough resources for building
            // or previous building is not finished.
              sendMessage('tb-auto-build-event', {
                  type: "error",
                  title: currentObj.villageName,
                  message: currentObj.name + " smtng was wrong"
              });
            stopRecurcive();
            // TODO: think about make some delay and continue from this point
          }
        });
    } else {
        sendMessage('tb-auto-build-event', {
            type: "info",
            title: "auto-build",
            message: "FINISHED"
        });
      stopRecurcive();
      console.log("finish", iterator.hasNext(), isAutoBuildingLoop);
      return;
    }
  }

  function init(){
      isAutoBuildingLoop = true;
      startRecursive();
  }

  return {
    init: init,
    stopRecurcive: stopRecurcive,
    startRecursive: startRecursive,
    getIterator: function(){
        return iterator;
    }
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


