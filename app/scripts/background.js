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
var rootUrl = "http://tx3.travian.com/";
var buildHash = getBuildList();
var autoBuildCtrl = {};

console.log(buildHash);




chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case "tb-add-to-queue":
            Utils.addToQueueAndSave(request,buildHash);
            break;

        case "tb-remove-from-queue":
            Utils.removeFromQueueAndSave(request, buildHash);
            break;

        case "tb-get-queue-list":
            var currentVillage = buildHash[request.data.villageId];
            sendMessage("tb-send-queue-list", {
                buildList   : (currentVillage) ? currentVillage.buildQueue : [],
                isLoopActive: (currentVillage) ? currentVillage.isLoop : false
            });
            break;

      case "tb-trigger-auto-building":
            Utils.triggerAutoBuilding(autoBuildCtrl, request, buildHash, rootUrl);
            break;
    }
    return true;
});
