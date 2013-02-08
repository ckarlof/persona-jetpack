var ContentScriptMessaging = function() {

  var addChromeMessageListener,
      messageToChrome;
  console.log("running content script messaging");
  if (typeof chrome !== "undefined") { // for Chrome
    addChromeMessageListener = function(callback) {
      chrome.extension.onMessage.addListener(callback);
    }

    messageToChrome = function(message, callback) {
      callback = callback || function() {};
      chrome.extension.sendMessage(message, callback);
    }
  }
  else { // for Firefox
    (function() {
      self.on("message", function(json) {
        //console.log(json);
        var messageWrapper = JSON.parse(json);
        messageToPage(messageWrapper);
      });

      addChromeMessageListener = function(callback) {
      //    chrome.extension.onMessage.addListener(callback);
      }

      messageToPage = function(messageWrapper, callback) {
        document.defaultView.postMessage(JSON.stringify(messageWrapper), document.location.protocol+"//"+document.location.host);
      }

      messageToChrome = function(messageWrapper) {
        self.postMessage(messageWrapper);
      }

      // listen to page
      // TODO: refactor this magic string
      //const RESOURCE_ORIGIN = 'resource://jid1-ueqrmxmswk4fra-at-jetpack';
      document.defaultView.addEventListener('message', function(event) {
        //if (event.origin !== RESOURCE_ORIGIN) return;
        var data = JSON.parse(event.data);
        if (data.fromPage) { // only respond to messages from the page, not to the responses sent by this module
          //console.log("ContentScriptMessaging: message from page: "+event.data);
          delete data.fromPage
          messageToChrome(data);
        }
      });
    })();
  }
  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};

ContentScriptMessaging();
