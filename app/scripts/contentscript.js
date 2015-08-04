'use strict';

console.info('content script loaded');

var matchUrl = Utils.matchUrl;
var socket = io('ws://travian-podobed.rhcloud.com:8000');

matchUrl('build.php', '', Build.renderAddtoQueueBtn);
matchUrl('', '', function(){
    Build.init();
});
