const pagemod = require("page-mod");
const data = require("self").data;
const messaging = require("./messaging");
const timers = require("timers");
const { defer } = require('sdk/core/promise');

const PROXY_URL = "http://localhost:8080/main.html";

var personaProxy = null; // todo: keep track of this, so if we only keep one tab open at a time

function getPersonaProxy() {
  var deferred = defer();
  if (personaProxy) {
    deferred.resolve(personaProxy);
  }
  else {
    pagemod.PageMod({ include: PROXY_URL,
                      contentScriptWhen: "end",
                      contentScriptFile: data.url("content_script_messaging.js"),
                      onAttach: function(worker) {
                        personaProxy = messaging.registerPageModWorker(worker);
                        worker.on('detach', function() {
                          personaMessenger = null;
                        });
                        deferred.resolve(personaProxy);
                        //personaProxy.postMessage({ type: "watch", args: { loggedInUser: "foo" }});
                        //timers.setTimeout(function() { deferred.resolve(personaProxy) }, 0);
                      }
                    });
    require('tabs').open({ url: PROXY_URL });
  }
  return deferred.promise;
}

exports.request = function(args) {
};

// navigator.id.watch({
//   loggedInUser: 'bob@example.org',
//   onlogin: function(assertion) {
//     // A user has logged in! Here you need to:
//     // 1. Send the assertion to your backend for verification and to create a session.
//     // 2. Update your UI.
//   },
//   onlogout: function() {
//     // A user has logged out! Here you need to:
//     // Tear down the user's session by redirecting the user or making a call to your backend.
//   }
// });
exports.watch = function(args) {
  // TODO: make sure we can call watch multiple times
  getPersonaProxy().then(function(proxy) {
    proxy.on('login', function(args) {
      args.onlogin(args.assertion);
    });
    proxy.on('logout', function() {
      args.onlogout();
    });
    personaProxy.postMessage({ type: "watch", args: { loggedInUser: args.loggedInUser }}, null);
  },
  function(error) {
    args.onerror(error);
  });
}