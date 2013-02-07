var Messaging = function() {
  var addContentMessageListener,
      messageToContent,
      revealedModule = {};

  if (typeof chrome !== "undefined") { // Chrome specific messaging to content scripts
    // callback is expected to be of the form: function
    // Format: { request: { message: <message data> },
    //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
    //           sendResponse: callback function with single parameter to respond to content scripts }
    addContentMessageListener = function(callback) {
      chrome.extension.onMessage.addListener(callback);
    };

    messageToContent = function(target, message) {
      chrome.tabs.sendMessage(target.tab.id, message);
    };
  }
  else if (typeof require === "function") { // Firefox specific messaging to page mod workers
    (function() {
      const { defer } = require('sdk/core/promise');

      var deferreds = {};

      var idCounter = 0;

      var chomeMessageListener = null;

      function getDeferredId() {
        idCounter += 1;
        return idCounter;
      }

      // callback is expected to be of the form: function
      // Format: { request: { message: <message data> },
      //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
      //           sendResponse: callback function with single parameter to respond to content scripts }
      addContentMessageListener = function(callback) {
        //commandHandlerCallback = callback;
      }

      messageToContent = function(target, message, deferred) {
        var deferredId = getDeferredId();
        deferreds[deferredId] = deferred;
        target.postMessage(JSON.stringify({ id: deferredId, message: message }));
      }

      // TODO: need to implement unregister?
      revealedModule.registerPageModWorker = function(worker) {
        worker.on('message', function (messageWrapper) {
          //console.log("Message from pageMod: "+JSON.stringify(messageWrapper));
          var message = messageWrapper.message,
              error = messageWrapper.error,
              deferredId = messageWrapper.id,
              deferred = deferreds[deferredId];

          if (!deferred) return;
          delete deferreds[deferredId];
          if (error) deferred.reject(error);
          else deferred.resolve(message);
        });
        return {
          toPage: function(message, deferred) {
            messageToContent(worker, message, deferred);
          }
        }
      }
    })();
  }
  else {
    throw "Can't initialize Messaging. Can't find 'chrome' or 'require'.";
  }

  revealedModule.addContentMessageListener = addContentMessageListener;
  revealedModule.messageToContent = messageToContent;

  return revealedModule;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Messaging();
}

