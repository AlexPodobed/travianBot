'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
  chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action', 1);
var i = 0;

// One-Time Requests (listening for event names 'dom-loaded')

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

  switch(request.type) {
    case "dom-loaded":
      console.log(request.data.myProperty + i++);
      break;
  }
  return true;
});



//  Long-Lived Connections

chrome.runtime.onConnect.addListener(function(port) {

  if(port.name == "my-channel"){
    port.onMessage.addListener(function(msg) {
      // do some stuff here
      console.log(msg)
    });

    setTimeout(function () {
      port.postMessage({lala: "value"});
    }, 2e3)
  }
});




