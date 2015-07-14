'use strict';

console.info('content script loaded');

var matchUrl = Utils.matchUrl;

matchUrl('build.php', '', Build.renderAddtoQueueBtn);
matchUrl('', '', function(){
    Build.init();
});
