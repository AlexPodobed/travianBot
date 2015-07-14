'use strict';

console.info("background script initialized");
// some stuff for debugging
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});
chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});


// init dependencies
var sendMessage  = Utils.sendMessageFromBG;
var getBuildList = Utils.getBuildList;
var setBuildList = Utils.setBuildList;
// TODO: now is hardcoded, need to get it from content script
var rootUrl = "http://tx3.travian.co.uk/";
var buildHash = getBuildList();
var autoBuilding = {
  status: false
};

var autoBuildCtrl = {

};

//var autoBuilder = autoBuilderConstructor(buildList,rootUrl, autoBuilding);
console.log(buildHash);


chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {


        case "tb-add-to-queue":
            console.log(request.data);
            var currentVillage = buildHash[request.data.villageId];

            if(!currentVillage){
              console.log('didnt exist');
              currentVillage = {
                name: request.data.villageName,
                isLoop: false,
                buildQueue: []
              };
              buildHash[request.data.villageId] = currentVillage;
            }

            currentVillage.buildQueue.push(request.data.buildDetails);
            setBuildList(buildHash);
            break;


        case "tb-remove-from-queue":
            var currentBuildQueue = buildHash[request.data.villageId].buildQueue;
            Utils.removeElementFromList(currentBuildQueue,request.data.buildId);
            setBuildList(buildHash);
            break;


        case "tb-get-queue-list":
            sendMessage("tb-send-queue-list", {
                buildList   : (buildHash[request.data.villageId]) ? buildHash[request.data.villageId].buildQueue : [],
                isLoopActive: (buildHash[request.data.villageId]) ? buildHash[request.data.villageId].isLoop : false
            });
            break;



      case "tb-trigger-auto-building":
	      // TODO: implement autobuilding for all villages seperatly (probably better to use pattern "Mediator")


            var currentVillageId = request.data.villageId;
            var currentBuildControls = autoBuildCtrl[currentVillageId];
            buildHash[currentVillageId].isLoop = request.data.isLoopActive;

            if(!currentBuildControls){
              console.log('autoBuildCtrl: created new')
              currentBuildControls = {
                instance: autoBuilderConstructor(buildHash, rootUrl, currentVillageId)
              };
              autoBuildCtrl[currentVillageId] = currentBuildControls;
            }
            if(buildHash[currentVillageId].isLoop){
              autoBuildCtrl[currentVillageId].instance.notifyUser("info", 'auto-building', 'started');
              autoBuildCtrl[currentVillageId].instance.start(request.data.timer);
            } else {
              autoBuildCtrl[currentVillageId].instance.notifyUser("info", 'auto-building', 'stopped');
              autoBuildCtrl[currentVillageId].instance.stop();
            }

            /*autoBuilding.status = request.data.isLoopActive;
            if(autoBuilding.status){
                autoBuilder.notifyUser("info", 'auto-building', 'started');
                autoBuilder.start(request.data.timer);
            } else {
                autoBuilder.notifyUser("info", 'auto-building', 'stopped');
                autoBuilder.stop();
            }*/
            break;
    }
    return true;
});


//var autoBuilder = autoBuilderConstructor(buildList,rootUrl, autoBuilding);
