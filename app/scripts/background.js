'use strict';

console.info("background script initialized");

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.pageAction.show(tabId);
});

var i = 0;
var temp_arr = [];



function sendMessage(event, data) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: event,
        data: data
      });
    });
}

// One-Time Requests (listening for event names 'dom-loaded')
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

    switch (request.type) {
        case "tb-add-to-queue":
            // TODO: add implimentation of saving recived data to localStorage
            temp_arr.push(request.data);
            console.log(temp_arr)
            break;
        case "tb-remove-from-queue":
            console.log('remove element, array:', request.data)
            temp_arr = request.data;
        case "tb-get-queue-list":
            sendMessage("tb-send-queue-list", temp_arr);
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


