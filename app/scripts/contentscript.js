'use strict';

console.log('\'Allo \'Allo! Content a');

// One-Time Requests (Fire event 'dom-loaded')

window.addEventListener("load", function() {
  chrome.extension.sendMessage({
    type: "dom-loaded",
    data: {
      myProperty: "value"
    }
  });
}, true);







//  Long-Lived Connections


var port = chrome.runtime.connect({name: "my-channel"});

port.postMessage({myProperty: "value"});
port.onMessage.addListener(function(msg) {
  console.log('From background:',msg)
});