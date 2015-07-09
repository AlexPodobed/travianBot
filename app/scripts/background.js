'use strict';

console.info("background script initialized");

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});



function sendMessage(event, data) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: event,
        data: data
      });
    });
}

function getBuildList(){
    return JSON.parse(localStorage.getItem('build_list')) || [];
}
function setBuildList(arr){
    var arrToStr = JSON.stringify(arr);
    localStorage.setItem('build_list', arrToStr);
}


var i = 0;
var temp_arr = getBuildList();

console.log(temp_arr);

// One-Time Requests (listening for event names 'dom-loaded')
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

    switch (request.type) {
        case "tb-add-to-queue":
            setBuildList(request.data);
            break;
        case "tb-remove-from-queue":
            setBuildList(request.data);
            break;
        case "tb-get-queue-list":
            sendMessage("tb-send-queue-list", getBuildList());
            break;

    }
    return true;
});


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


