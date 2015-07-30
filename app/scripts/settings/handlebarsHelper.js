Handlebars.registerHelper('list', function(items, options) {
  var out = "<ul>";
  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li><a>" + (i+1) + ". " + options.fn(items[i]) + "</a></li>";
  }
  return out + "</ul>";
});

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});