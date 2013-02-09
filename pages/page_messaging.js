var PageMessaging = function() {

  var addChromeMessageListener,
      messageToChrome,
      addHandler,
      on,
      postMessage;

  if (typeof chrome !== "undefined") { // for Chrome

  }
  else { // for Firefox
    (function() {
      var pageOrigin = window.location.protocol+"//"+window.location.host;

      var subscribers = {};

      on = function(type, callback) {
        type = "on"+type;
        var subscriberList = subscribers[type] || [];
        subscriberList.push(callback);
        subscribers[type] = subscriberList;
      }

      window.addEventListener("message", function(event) {
        var messageWrapper;
        try {
          messageWrapper = JSON.parse(event.data);
        } catch(e) {
          messageWrapper = {};
        }
        var message = messageWrapper.message || {},
            deferredId = messageWrapper.id,
            $dfd = undefined,
            type = message.type,
            args = message.args;
        if (messageWrapper.fromPage || !message) return; // Not for us
        if (deferredId) {
          $dfd = Q.defer();
          $dfd.promise.then(function(response) {
            messageToChrome(messageWrapper.id, response);
          }, function(error) {
            messageToChrome(messageWrapper.id, {}, error);
          });
        }
        if (type) {
          var subscriberList = subscribers["on"+type] || [];
          subscriberList.forEach(function(callback) {
            callback(args, $dfd);
          });
        }
      }, false);

      messageToChrome = function(id, message, error) {
        message = message || {};
        var messageWrapper = { message: message, fromPage: true };
        if (id) messageWrapper.id = id;
        if (error) messageWrapper.error = error;
        //console.log("PageMessaging.messageToChrome: "+JSON.stringify(messageWrapper));
        document.defaultView.postMessage(JSON.stringify(messageWrapper), pageOrigin);
      },

      postMessage = function(message) {
        messageToChrome(null, message, null);
      }
    })();
  }
  return {
    messageToChrome: messageToChrome,
    on: on,
    postMessage: postMessage
  };
};

