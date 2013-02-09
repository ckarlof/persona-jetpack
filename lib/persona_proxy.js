const pagemod = require("page-mod");
const data = require("self").data;
const messaging = require("./messaging");
const _ = require("./underscore");
const { defer } = require('sdk/core/promise');

const PROXY_URL = "http://localhost:8080/main.html";

var deferred = null;

pagemod.PageMod({ include: PROXY_URL,
                  contentScriptWhen: "end",
                  contentScriptFile: data.url("content_script_messaging.js"),
                  onAttach: function(worker) {
                    var personaProxy = messaging.registerPageModWorker(worker);
                    deferred = deferred || defer();
                    worker.on('detach', function() {
                      console.log('detaching');
                      deferred = null;
                    });
                    deferred.resolve(personaProxy);
                  }
                });

function getPersonaProxy() {
  if (deferred) return deferred.promise;
  deferred = defer();
  require('tabs').open({ url: PROXY_URL });
  return deferred.promise;
}

var externalCallbacks = {};

messaging.on('login', function(assertion) {
  if (externalCallbacks.onlogin) externalCallbacks.onlogin(assertion);
});

messaging.on('logout', function() {
  if (externalCallbacks.onlogout) externalCallbacks.onlogout();
});

messaging.on('cancel', function() {
  if (externalCallbacks.oncancel) externalCallbacks.oncancel();
});

messaging.on('error', function(error) {
  if (externalCallbacks.onerror) externalCallbacks.onerror(error);
});

var oncancel,
    onlogin,
    onlogout,
    onerror;

exports.request = function(args) {
  externalCallbacks.oncancel = args.oncancel || function() {};
  args = _.omit(args, 'oncancel');
  getPersonaProxy().then(function(proxy) {
    proxy.postMessage({ type: "request", args: args });
  },
  function(error) {
    if(externalCallbacks.onerror) externalCallbacks.onerror(error);
  });
};

exports.watch = function(args) {
  externalCallbacks.onlogin = args.onlogin || function() {};
  externalCallbacks.onlogout = args.onlogout || function() {};
  externalCallbacks.onerror = args.error || function() {};
  args = _.omit(args, ['onlogin', 'onlogout', 'onerror']);
  // TODO: make sure we can call watch multiple times
  // TODO: cache args, so on page refresh we can resend watch to the page
  getPersonaProxy().then(function(proxy) {
    proxy.postMessage({ type: "watch", args: args });
  },
  function(error) {
    if(externalCallbacks.onerror) externalCallbacks.onerror(error);
  });
}