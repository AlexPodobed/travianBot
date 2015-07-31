'use strict';

console.info('content script loaded');

var matchUrl = Utils.matchUrl;
var socket = io('http://travian-podobed.rhcloud.com/');

matchUrl('build.php', '', Build.renderAddtoQueueBtn);
matchUrl('', '', function(){
    Build.init();
});
