
var autoBuilderConstructor = function(buildHash, rootUrl, villageId){
  console.log(buildHash[villageId]);
  var buildList = buildHash[villageId].buildQueue;
  var buildingObj = buildHash[villageId];
  var villageName = buildHash[villageId].name;
  var parseStringToDate = Utils.parseStringToDate;
  var iterator = Utils.Iterator(buildList);
  var timerId;

  function getBuildingDetails(build){
    console.log(rootUrl+'build.php?newdid='+villageId+'&id='+ build.id);
    return jQuery.get(rootUrl+'build.php?newdid='+villageId+'&id='+ build.id);
  }
  function checkBuildingsDetails(res){
    var deferred = jQuery.Deferred();

    console.log('1st AJAX request: success, checkBuildingsDetails applying');  // remove it
    var fixedResponse = Utils.addUrlToImg(res,rootUrl);
    var $res = jQuery(fixedResponse);
    var $btn = $res.find("#contract button:first");

    if($btn.hasClass("green build")){
      var timeToWait = parseStringToDate($res.find("#contract .clocks").text());
      var buildIrl = $btn.attr('onclick').split("'")[1];

      deferred.resolve({timer: timeToWait, url: buildIrl});
    } else {
      var errorObj = {
        message: " something went wrong",
      };
      if($btn.val() === "Exchange resources"){
        errorObj.message = " not enough resources";
      }else if($btn.val() === "Construct with master builder"){
        errorObj.message = " not finished upgrading";
      } else if($res.find("#contract >span.none").size()){
        errorObj.message = " has been fully upgraded";
      }

      deferred.reject(errorObj);
    }
    return deferred.promise();
  }
  function build(url){
    return jQuery.get(rootUrl + url);
  }
  function notifyUser(type, title, message){
    sendMessage('tb-auto-build-event', {
      type: type,
      title: title,
      message: message
    });
  }
  function removeBuiltField(currentObj){
      iterator.index -= 1;
      Utils.removeElementFromList(buildList,currentObj.id);
      setBuildList(buildHash);
      sendMessage("tb-remove-from-list", currentObj.id);
  }

  function stopRecursive(){
    buildingObj.isLoop = false;
    iterator.reset();
    clearTimeout(timerId);
    sendMessage("tb-send-queue-list", {
      buildList: buildList,
      isLoopActive: buildingObj.isLoop
    });
    setBuildList(buildHash);
  }
  function errorHandler(){
    stopRecursive();
    notifyUser('error', villageName, " ajax error");
  }

  function startRecursive() {
    if (iterator.hasNext() && buildingObj.isLoop) {
      var currentObj = iterator.next();

      console.log("Iterator Index:", iterator.index, iterator);

      getBuildingDetails(currentObj)
        .success(function (res) {
          checkBuildingsDetails(res)
            .done(function (response) {
              build(response.url)
                .success(function () {
                  console.log('built'); // remove it
                  removeBuiltField(currentObj);
                  notifyUser('success', villageName, currentObj.name + " successfully started building");
                  timerId = setTimeout(startRecursive, response.timer + 2000);
                  console.log(new Array(80).join("-"));  // remove it
                })
                .error(errorHandler)
            })
            .fail(function (error) {
              console.log('error with building field', error);   // remove it
              notifyUser('error', villageName, currentObj.name + error.message);
              stopRecursive();
              // TODO: think about make some delay and continue from this point
            });
        })
        .error(errorHandler);

    } else {
      notifyUser('info', 'auto-build', "FINISHED");
      stopRecursive();
      console.log("finish", villageName ,iterator.hasNext());  // remove it
      return;
    }
  }
  function start(delay){
    var time = Utils.parseStringToDate(delay);
    timerId = setTimeout(startRecursive, time);
  }
  return {
    stop: stopRecursive,
    start: start,
    notifyUser: notifyUser
  }
};
