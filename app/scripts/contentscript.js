'use strict';

console.info('content script loaded');

var matchUrl = Utils.matchUrl;

matchUrl('build.php', '', Build.renderAddtoQueueBtn);
matchUrl('', '', function(){
    Build.init();
});
// One-Time Requests (Fire event 'dom-loaded')

/*
window.addEventListener("load", function() {
  chrome.extension.sendMessage({
    type: "dom-loaded",
    data: {
      myProperty: "value"
    }
  });
}, true);
*/



//  Long-Lived Connections

/*

var port = chrome.runtime.connect({name: "my-channel"});
// send message
port.postMessage({myProperty: "value"});

// listen for message
port.onMessage.addListener(function(msg) {
  console.log('From background:',msg)
});*/
