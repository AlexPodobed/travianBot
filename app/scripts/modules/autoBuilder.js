
var autoBuilderConstructor = function(buildingObj, rootUrl, villageId){
  // dependencies: @buildingObj, @rootUrl
  console.log(buildingObj)
  var buildList = buildingObj.buildQueue;
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
      //TODO: check why button is not green
      deferred.reject({
        message: "something went wrong",
        res: $res
      });
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
    buildList.shift();
    iterator.index -= 1;
    setBuildList(buildList);
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
  }
  function startRecursive() {
    if (iterator.hasNext() && buildingObj.isLoop) {
      var currentObj = iterator.next();

      console.log("Iterator Index:", iterator.index, iterator)

      getBuildingDetails(currentObj)
        .success(function (res) {

          checkBuildingsDetails(res)
            .done(function (response) {
              build(response.url)
                .success(function () {
                  console.log('built'); // remove it
                  removeBuiltField(currentObj);
                  notifyUser('success', currentObj.villageName, currentObj.name + " successfully started building");
                  timerId = setTimeout(startRecursive, response.timer + 2000);
                  console.log(new Array(80).join("-"));  // remove it
                });
            })
            .fail(function (error) {
              console.log('error with building field', error);   // remove it
              notifyUser('error', currentObj.villageName, currentObj.name + " smtng was wrong");
              stopRecursive();
              // TODO: think about make some delay and continue from this point
            });
        });

    } else {
      notifyUser('info', 'auto-build', "FINISHED");
      stopRecursive();
      console.log("finish", iterator.hasNext(), buildingObj.isLoop);  // remove it
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
