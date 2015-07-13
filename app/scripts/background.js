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
var buildList = getBuildList();
var autoBuilding = {
  status: false
};
var autoBuilder = autoBuilderConstructor(buildList,rootUrl, autoBuilding);
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
                isLoopActive: autoBuilding.status
            });
            break;
        case "tb-trigger-auto-building":
            autoBuilding.status = request.data.isLoopActive;
            if(autoBuilding.status){
                autoBuilder.notifyUser("info", 'auto-building', 'started');
                autoBuilder.start(request.data.timer);
            } else {
                autoBuilder.notifyUser("info", 'auto-building', 'stopped');
                autoBuilder.stop();
            }
            break;
    }
    return true;
});



