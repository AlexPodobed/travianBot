console.info("auto-builder module loaded");

var Build = (function () {
    var buildQueue = JSON.parse(localStorage.getItem('build_queue')) || [];
    var $div;
    var activeVillageID;


    chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request)
        switch (request.type) {
            case "tb-send-queue-list":
                console.log(request.data);
                break;
        }
        return true;
    });

    function sendMessage(event, data) {
        chrome.extension.sendMessage({
            type: event,
            data: data || {}
        });
    }


    function getQueueList(){
        sendMessage("tb-get-queue-list", {})
    }

    function createBtn() {
        var btn = jQuery('<button>');
        btn.text("add to smart queue");
        btn.addClass('tb-btn');
        return btn;
    }

    function generateBuildingsList() {
        activeVillageID = getIdformUrl(jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active").attr('href'), 'newdid');

        var $span = jQuery("<span>"),
            $ul = jQuery("<ul>"),
            $li = jQuery("<li>");

        if ($div) {
            $div.remove();
        }
        $div = jQuery("<div>")

        if(buildQueue.length){
            buildQueue.filter(function (el) {
                return el.villageId == activeVillageID
            }).map(function (buildObj) {
                var li = $li.clone().text(buildObj.name);
                var span = $span.clone().text('x');
                span.on('click', function () {
                    removeFromQueue(buildObj.id)
                });
                $ul.append(li.append(span));
            });
            $div.addClass("tb-buildings-list");
            $div.addClass("sidebarBox").append($ul);

            $div.insertAfter('#sidebarBoxQuestachievements');
        }

    }

    function removeFromQueue(id) {
        buildQueue.forEach(function (q, i) {
            if (q.id == id) {
                buildQueue.splice(i, 1);
                return;
            }
        });
        localStorage.setItem('build_queue', JSON.stringify(buildQueue));
        generateBuildingsList();
    }

    function getIdformUrl(str, match) {
        var query = str.substring(1).split("&"),
            id;

        query.map(function (keyVal) {
            var param = keyVal.split('=');
            if (param[0] === match) {
                id = param[1];
            }
        });
        return id;
    }

    function addToQueue() {
        console.log('added to queue');
        var buildObj = {};
        var id = getIdformUrl(location.search, "id");
        var name = jQuery.trim(jQuery(".titleInHeader").contents()[0].wholeText) + " (" + jQuery.trim(jQuery(".titleInHeader span").text()) + "+1)";

        buildObj.id = id;
        buildObj.name = name;
        buildObj.villageId = activeVillageID;

        buildQueue.push(buildObj);

        localStorage.setItem('build_queue', JSON.stringify(buildQueue));
        sendMessage("tb-add-to-queue", buildObj);
        generateBuildingsList();
        getQueueList();
    }

    function renderAddtoQueueBtn() {
        var btn = createBtn();
        btn.on('click', addToQueue);

        jQuery("#contract .contractLink").append(btn);
    }

    function init() {
        console.log('build init');
        renderAddtoQueueBtn();
    }

    return {
        renderAddtoQueueBtn: renderAddtoQueueBtn,
        generateList: generateBuildingsList
    }
}());