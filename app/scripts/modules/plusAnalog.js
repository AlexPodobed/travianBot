console.info('plus analog');

var plusAnalog = (function(){
  var $sidebarBoxActiveVillage = jQuery("#sidebarBoxActiveVillage");

  function checkGoldClub(){
    return !$sidebarBoxActiveVillage.find(".header > button").hasClass("gold");
  }


  return {
    checkGoldClub: checkGoldClub
  }
}());