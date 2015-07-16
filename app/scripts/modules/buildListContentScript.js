console.info("auto-builder module for content script loaded");




var Build = (function () {
    var buildQueue,
        activeVillageID,
        activeVillageName,
        isLoopActive,
        template;

    var sendMessage = Utils.sendMessage;
    var onMessage = Utils.onMessage;
    var getIdformUrl = Utils.getIdformUrl;
    template = {};

    function getActiveVillageDetails(){
      var $activeVillage = jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active");
      activeVillageID = getIdformUrl($activeVillage.attr('href'), 'newdid');
      activeVillageName = $activeVillage.find('.name').text();
    }
    function getQueueList() {
        sendMessage("tb-get-queue-list", {villageId: activeVillageID});
    }
    function getTemplate(name){
      var deferred = jQuery.Deferred();

      if(template[name]){
        deferred.resolve({template: template[name]});
      }else{
        Utils.getTemplate(name)
          .success(function (temp) {
            template[name] = Handlebars.compile(temp);
            deferred.resolve({template: template[name]});
          })
      }
      return deferred;
    }
    function generateBuildingsList() {
        getTemplate("sidebarBox")
          .done(function (data) {
            var $sidebar = jQuery(data.template({buildings: buildQueue, btnText: isLoopActive ? 'stop' :'start'}));

            $sidebar.find(".tb-trigger-autobuild").on('click', triggerAutoBuilding);
            $sidebar.on('click', '.tb-remove-build-item', function () {
              removeFromQueue(jQuery(this).data("build-id"))
            });

            jQuery('#tb-build-list').remove();
            jQuery('#sidebarBoxQuestachievements').after($sidebar)
          });
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
      getTemplate("greenBtn")
        .done(function (data) {
          var $btn = $(data.template({btnText: "add to smart queue"}));
          $btn.on('click', addToQueue);

          jQuery("#contract .contractLink button:first").before($btn);
        });
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
        generateBuildingsList();
        sendMessage("tb-trigger-auto-building", {
          villageId: activeVillageID,
          isLoopActive: isLoopActive,
          timer: timeToWait
        });
      }
    }
    function addMessageListeners(){
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
      });
    }

    function init() {
        getActiveVillageDetails();
        getQueueList();
        addMessageListeners();
    }

    return {
        renderAddtoQueueBtn: renderAddtoQueueBtn,
        generateList: generateBuildingsList,
        init: init
    }
}());

