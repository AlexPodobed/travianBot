'use strict';

console.info('content script loaded');

var matchUrl = Utils.matchUrl;
var socket = io('http://localhost:80');

matchUrl('build.php', '', Build.renderAddtoQueueBtn);
matchUrl('', '', function(){
    Build.init();
});
