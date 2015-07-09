console.info("auto-builder module loaded");

var Build = (function () {
    var buildQueue;
    var $div;
    var activeVillageID;


    var sendMessage = Utils.sendMessage;
    var onMessage = Utils.onMessage;
    var getIdformUrl = Utils.getIdformUrl;


    function listenEvent(callback) {
        onMessage('tb-send-queue-list', function (request) {
            buildQueue = request.data;
            callback();
        });
    }

    function getQueueList() {
        sendMessage("tb-get-queue-list", {})
    }

    function createBtn(text) {
        var btn = jQuery('<button>');
        btn.text(text);
        btn.addClass('tb-btn');
        return btn;
    }

    function generateBuildingsList() {
        var $span = jQuery("<span>"),
            $ul = jQuery("<ul>"),
            $li = jQuery("<li>");



        if ($div) $div.remove();
        $div = jQuery("<div>");
        activeVillageID = getIdformUrl(jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active").attr('href'), 'newdid');

        if (buildQueue.length) {
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

            var btn = createBtn('start');
            btn.on('click', startAutoBuilding.bind(btn));

            $div.addClass("tb-buildings-list");
            $div.addClass("sidebarBox").append($ul, btn);

            $div.insertAfter('#sidebarBoxQuestachievements');
        }

    }
    function removeFromQueue(id) {
        for (var i = 0; i < buildQueue.length; i++) {
            if (buildQueue[i].id == id) {
                buildQueue.splice(i, 1);
                break;
            }
        }
        sendMessage("tb-remove-from-queue", buildQueue);
        generateBuildingsList();
    }
    function addToQueue() {
        console.log('added to queue');

        var id = getIdformUrl(location.search, "id");
        var name = jQuery.trim(jQuery(".titleInHeader").contents()[0].wholeText) + " (" + jQuery.trim(jQuery(".titleInHeader span").text()) + "+1)";
        var buildObj = {
            id: id,
            name: name,
            villageId: activeVillageID,
        };

        buildQueue.push(buildObj);

        sendMessage("tb-add-to-queue", buildQueue);
        generateBuildingsList();
    }
    function renderAddtoQueueBtn() {
        var btn = createBtn("add to smart queue");
        btn.on('click', addToQueue);

        jQuery("#contract .contractLink").append(btn);
    }


    function init() {
        getQueueList();
        onMessage('tb-send-queue-list', function (request) {
            buildQueue = request.data;
            generateBuildingsList();
        });
    }


    function startAutoBuilding(){
        console.log(buildQueue)

        var parseStringToDate = Utils.parseStringToDate;
        var iterator = Utils.Iterator(buildQueue);

        /*function getData(str, callback) {
            console.log(str, new Date());
            callback.apply(this, arguments);
        }*/

        function getBuildingDetails(id){
            return jQuery.get('/build.php?id='+ id)
        }

        function initRecurcive() {
            // TODO: move to backgroundScript
            if (iterator.hasNext()) {
                var currentObj = iterator.next();
                console.log("Iterator Index:",iterator.index)
                getBuildingDetails(currentObj.id)
                    .success(function(res){
                        console.log('1st AJAX: success')
                        var $res = jQuery(res);
                        var $btn = $res.find("#contract button:first");

                        if($btn.hasClass("green build")){
                            var timeToWait = parseStringToDate($res.find("#contract .clocks").text());
                            var buildIrl = $btn.attr('onclick').split("'")[1];

                            jQuery.get("/"+buildIrl, function(){
                                console.log(currentObj.name, timeToWait, new Date());
                                // TODO: remove from localStorage and on View
//                                removeFromQueue(currentObj.id);
                                setTimeout(initRecurcive, timeToWait+2000);
                            })
                        }else{
                            console.log('smtng went wrong',$btn);
                            // TODO: think about make some delay and continue from this point
                        }
                    });

                /*
                getData(currentObj.name, function () {
                    setTimeout(initRecurcive, timeToWait);
                });*/
            } else {
                console.log("finish");
                return;
            }
        }

        initRecurcive();
    }

    function PoC() {

        var arr = [
            {
                "time": "0:00:02",
                "name": "id_21"
            },
            {
                "time": "0:00:03",
                "name": "id_22"
            },
            {
                "time": "0:00:5",
                "name": "id_23"
            }
        ];
        var parseStringToDate = Utils.parseStringToDate;
        var iterator = Utils.Iterator(arr);

        function getData(str, callback) {
            console.log(str, new Date());
            callback.apply(this, arguments);
        }


        function initRecurcive() {
            if (iterator.hasNext()) {
                var currentObj = iterator.next();
                var timeToWait = parseStringToDate(currentObj.time);

                getData(currentObj.name, function () {
                    setTimeout(initRecurcive, timeToWait);
                });
            } else {
                console.log("finish");
                return;
            }
        }
        initRecurcive();
    }


    return {
        renderAddtoQueueBtn: renderAddtoQueueBtn,
        generateList: generateBuildingsList,
        init: init
    }
}());