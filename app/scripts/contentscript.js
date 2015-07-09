'use strict';

console.info('content script loaded');

function matchUrl(pathname, search, callback){
    var expression1 = (pathname) ? (location.pathname.indexOf(pathname) >= 0) : true ;
    var expression2 = (search) ? (location.search.indexOf(search) >= 0) : true ;

    if(expression1 && expression2){
        callback.apply(null, arguments)
    }
}


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
