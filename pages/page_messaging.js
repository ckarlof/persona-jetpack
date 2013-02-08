var PageMessaging = function() {

  var addChromeMessageListener,
      messageToChrome,
      addHandler,
      on;

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
        var messageWrapper = JSON.parse(event.data),
            message = messageWrapper.message,
            deferredId = messageWrapper.id,
            $dfd = undefined,
            type = message.type,
            args = message.args;
                    console.log("message", messageWrapper);
        if (messageWrapper.fromPage || !message) return;
        if (deferredId) {
          $dfd = $.Deferred();
          $dfd.then(function(response) {
            messageToChrome(messageWrapper.id, response);
          }, function(error) {
            messageToChrome(messageWrapper.id, {}, error);
          });
        }
        else if (type) {
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
      }
    })();
  }
  return {
    messageToChrome: messageToChrome,
    on: on
  };
};

