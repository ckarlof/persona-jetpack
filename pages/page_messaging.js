var PageMessaging = function() {

  var addChromeMessageListener,
      messageToChrome,
      addHandler;

  if (typeof chrome !== "undefined") { // for Chrome

  }
  else { // for Firefox
    (function() {
      var pageOrigin = window.location.protocol+"//"+window.location.host;

      var handlers = {};

      addHandler = function(type, callback) {
        handlers[type] = callback;
      };

      window.addEventListener("message", function(event) {
        var messageWrapper = JSON.parse(event.data),
            message = messageWrapper.message;
        if (messageWrapper.fromPage || !handlers[messageWrapper.type]) return;
        var $dfd = $.Deferred();
        $dfd.then(function(message) {
          messageToChrome(messageWrapper.id, message);
        }, function(error) {
          messageToChrome(messageWrapper.id, {}, error);
        });
        handlers[message.type](messageWrapper.message, $dfd);
      }, false);

      messageToChrome = function(id, message, error) {
        message = message || {};
        var messageWrapper = { message: message, id: id, fromPage: true };
        if (error) messageWrapper.error = error;
        //console.log("PageMessaging.messageToChrome: "+JSON.stringify(messageWrapper));
        document.defaultView.postMessage(JSON.stringify(messageWrapper), pageOrigin);
      }
    })();
  }
  return {
    messageToChrome: messageToChrome,
    addHandler: addHandler
  };
};

