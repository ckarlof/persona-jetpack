const pagemod = require("page-mod");
const data = require("self").data;

var messaging = require("./messaging");

var personaLoginPageUrl;
var personaPageMod = null;

exports.getAssertion = function(url) {
  const { defer } = require('sdk/core/promise');
  var deferred = defer();
  if (personaPageMod) personaPageMod.destroy();
  personaLoginPageUrl = url;
  personaPageMod = pagemod.PageMod({ include: url,
                      contentScriptFile: data.url("content_script_messaging.js"),
                      onAttach: function(worker) {
                        var messenger = messaging.registerPageModWorker(worker);
                        messenger.toPage({ type: "test", data: { foo: "bar" }}, deferred);
                      }
                   });
  require('tabs').open({url: personaLoginPageUrl});
  return deferred.promise;
};