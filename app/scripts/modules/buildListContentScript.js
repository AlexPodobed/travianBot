console.info("auto-builder module for content script loaded");

var Build = (function () {
    var buildQueue,
        activeVillageID,
        activeVillageName,
        $div, isLoopActive;


    var sendMessage = Utils.sendMessage;
    var onMessage = Utils.onMessage;
    var getIdformUrl = Utils.getIdformUrl;


    function getActiveVillageDetails(){
      var $activeVillage = jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active");
      activeVillageID = getIdformUrl($activeVillage.attr('href'), 'newdid');
      activeVillageName = $activeVillage.find('.name').text();
    }

    function getQueueList() {
        sendMessage("tb-get-queue-list", {villageId: activeVillageID});
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



        if (buildQueue.length) {
            buildQueue.map(function (buildObj, index) {
                var li = $li.clone().text(index+1 + "." +buildObj.name);
                var span = $span.clone().text('x');
                span.on('click', function () {
                    removeFromQueue(buildObj.id)
                });
                $ul.append(li.append(span));
            });

            var btn = createBtn(isLoopActive ? 'stop' :'start');
            btn.on('click', triggerAutoBuilding.bind(btn));

            $div.addClass("tb-buildings-list");
            $div.addClass("sidebarBox").append($ul, btn);

            $div.insertAfter('#sidebarBoxQuestachievements');
        }

    }
    function removeFromQueue(id) {
        var buildToRemove = Utils.removeElementFromList(buildQueue,id);

        if(buildToRemove){
          sendMessage("tb-remove-from-queue", {villageId: activeVillageID, buildId: buildToRemove.id});
          generateBuildingsList();
        }
    }
    function addToQueue(){
      var buildId = getIdformUrl(location.search, "id");
      var buildName = jQuery.trim(jQuery(".titleInHeader").contents()[0].wholeText) + " (" + jQuery.trim(jQuery(".titleInHeader span").text()) + "+1)";

      var obj = {
        "villageId": activeVillageID,
        "villageName": activeVillageName,
        "buildDetails": {
          id: buildId,
          name: buildName
        }
      };
      buildQueue.push(obj.buildDetails);
      sendMessage("tb-add-to-queue", obj);
      generateBuildingsList();
    }
    function renderAddtoQueueBtn() {
        var btn = createBtn("add to smart queue");
        btn.on('click', addToQueue);

        jQuery("#contract .contractLink").append(btn);
    }
    function renderAddToQueBtnForNewBuilding(){

    }
    function addToQueueNewBuilding(){
        // TODO: check if add btn green, add url to buildObj and send to BG script
        //
    }
    function highlightFields(){
        Utils.matchUrl("dorf1", '' , function(){
            var getResourceFuildhash = Utils.getResourceFuildhash();

            buildQueue.map(function(build, index){
                var appropriateFieldId = getResourceFuildhash[build.id];
                var orderNumber = jQuery('<span class="tb-order-number">').text(index+1);
                jQuery("#village_map > div").eq(appropriateFieldId)
                    .addClass("tb-in-queue")
                    .append(orderNumber);
            });
        });
        Utils.matchUrl("dorf2", '' , function(){
            buildQueue.map(function(build, index){
                var buildField = jQuery("#levels .colorLayer").filter('.aid'+build.id);

                if(buildField.size()){
                    var orderNumber = jQuery('<span class="tb-order-number">').text(index+1);
                    buildField.addClass("tb-in-queue").append(orderNumber)
                }

            });
        });
    }
    function triggerAutoBuilding(){
      if(location.pathname.indexOf('dorf') < 0){
        toastr['warning']("You should go to /dorf2.php or /dorf1.php", "Change location!");
      }else {
        var timeToWait = jQuery(".buildingList #timer1").text() || "00:00:00";
        isLoopActive = !isLoopActive;
        console.log(isLoopActive)
        jQuery(this).text(isLoopActive ? 'stop' :'start');
        sendMessage("tb-trigger-auto-building", {
          villageId: activeVillageID,
          isLoopActive: isLoopActive,
          timer: timeToWait
        });
      }
    }

    function init() {
        getActiveVillageDetails();
        getQueueList();
        onMessage('tb-send-queue-list', function (request) {
          console.log("init: ",request)
            buildQueue   = request.data.buildList;
            isLoopActive = request.data.isLoopActive;
            generateBuildingsList();
            highlightFields();
        });

        onMessage('tb-remove-from-list', function (request) {
          Utils.removeElementFromList(buildQueue,request.data.id);
          generateBuildingsList();
        });

        onMessage('tb-auto-build-event', function(request){
            toastr[request.data.type](request.data.message, request.data.title);
        })
    }

    return {
        renderAddtoQueueBtn: renderAddtoQueueBtn,
        generateList: generateBuildingsList,
        init: init
    }
}());

