console.info("auto-builder module for content script loaded");

var Build = (function () {
    var buildQueue,
        activeVillageID,
        activeVillageName,
        isLoopActive,
        template;

    var getIdformUrl = Utils.getIdformUrl;
    template = {};

    function getActiveVillageDetails(){
      var $activeVillage = jQuery("#sidebarBoxVillagelist .sidebarBoxInnerBox .content a.active");
      activeVillageID = getIdformUrl($activeVillage.attr('href'), 'newdid');
      activeVillageName = $activeVillage.find('.name').text();
    }
    function getQueueList() {
        socket.emit('get-queue-list', {villageId: activeVillageID});
        socket.emit('get-info');
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
          socket.emit('remove-from-queue', {villageId: activeVillageID, buildId: buildToRemove.id});
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
      socket.emit('add-to-queue', obj);
      generateBuildingsList();
    }
    function renderAddtoQueueBtn() {
      getTemplate("greenBtn")
        .done(function (data) {
          var $btn = $(data.template({btnText: "add to smart queue"}));
          $btn.prop('disabled', true).addClass("tb-add-to-que-btn");
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
        toastr['warning']('You should go to /dorf2.php or /dorf1.php', 'Change location!');
      }else {
        var timeToWait = jQuery('.buildingList #timer1').text() || '00:00:00';
        isLoopActive = !isLoopActive;

        socket.emit('trigger-auto-building', {
          villageId: activeVillageID,
          isLoopActive: isLoopActive,
          timer: timeToWait
        });
      }
    }
    function addMessageListeners(){

      socket.on('remove-from-list', function (data) {
        console.log("remove-from-list",data, activeVillageID);
        if(data.villageId == activeVillageID){
          Utils.removeElementFromList(buildQueue, data.buildId);
          generateBuildingsList();
        }
      });

      socket.on('add-to-queue-all', function(data){
        if(data.villageId == activeVillageID){
          buildQueue   = data.buildList;
          generateBuildingsList();
          highlightFields();
        }
      });

      socket.on('get-info', function(data){
        console.log('get-info', data);
      });

      socket.on('get-queue-list', function(data){
        console.log('get-queue-list', data);
        buildQueue   = data.buildList;
        isLoopActive = data.isLoop;
        generateBuildingsList();
        highlightFields();
        $(".tb-add-to-que-btn").prop('disabled', false);
      });

      socket.on('auto-build-event', function(data){
        toastr[data.type](data.message, data.title);
      });

      socket.on('trigger-auto-building', function(data){
        console.log("trigger-auto-building", data, activeVillageID)
        if(data.villageId == activeVillageID){
          isLoopActive = data.isLoopActive;
          generateBuildingsList();
        }
      })
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
    };
}());

