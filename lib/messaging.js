var Messaging = function() {
  var addContentMessageListener,
      messageToContent,
      on,
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
      var deferredMap = {},
          idCounter = 0;

      function getDeferredId() {
        idCounter += 1;
        return idCounter;
      }

      var subscribers = {};

      on = function(type, callback) {
        type = "on"+type;
        var subscriberList = subscribers[type] || [];
        subscriberList.push(callback);
        subscribers[type] = subscriberList;
      }

      contentScriptMessageHandler= function(messageWrapper) {
        //console.log("Message from pageMod: "+JSON.stringify(messageWrapper));
        var message = messageWrapper.message,
            error = messageWrapper.error,
            deferredId = messageWrapper.id,
            deferred = deferredMap[deferredId],
            type = message.type,
            args = message.args;

        if (deferred) {
          delete deferredMap[deferredId];
          if (error) deferred.reject(error);
          else deferred.resolve(message);
          return;
        }
        else if (type) {
          let subscriberList = subscribers["on"+type] || [];
          subscriberList.forEach(function(callback) {
            callback(args);
          })
        }
      }

      messageToContent = function(target, message, deferred) {
        var args = { message: message };
        if (deferred) {
          var deferredId = getDeferredId();
          deferredMap[deferredId] = deferred;
          args.id = deferredId;
        }
        //console.log(JSON.stringify(args));
        target.postMessage(JSON.stringify(args));
      }

      // TODO: need to implement unregister?
      revealedModule.registerPageModWorker = function(worker) {
        worker.on('message', contentScriptMessageHandler);
        return {
          postMessage: function(message, deferred) {
            messageToContent(worker, message, deferred);
          },
          on: on
        }
      }
    })();
  }
  else {
    throw "Can't initialize Messaging. Can't find 'chrome' or 'require'.";
  }

  revealedModule.addContentMessageListener = addContentMessageListener;
  revealedModule.messageToContent = messageToContent;
  revealedModule.on = on;

  return revealedModule;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Messaging();
}

