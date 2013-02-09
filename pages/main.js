var addonProxy = PageMessaging();
var personaProxy = new PersonaProxy(addonProxy);

function PersonaProxy(addonProxy) {
  this.addonProxy =  addonProxy;
}

PersonaProxy.prototype.request = function(args) {
  args = $.extend(this.requestArgs || {}, args || {});
  args.oncancel = this.oncancel.bind(this);
  console.log("request args", args);
  navigator.id.request(args);
}

PersonaProxy.prototype.watch = function(args) {
  args = $.extend({}, args);
  args = $.extend(args,{
    onlogin: this.onlogin.bind(this),
    onlogout: this.onlogout.bind(this)
  });
  navigator.id.watch(args);
}

PersonaProxy.prototype.oncancel = function() {
  console.log("PersonaProxy.oncancel");
  this.addonProxy.postMessage({ type: 'cancel' });
};

PersonaProxy.prototype.onlogin = function(assertion) {
  console.log("PersonaProxy.onlogin", assertion);
  this.addonProxy.postMessage({ type: 'login', args: assertion });
}

PersonaProxy.prototype.onlogout = function() {
  console.log("PersonaProxy.onlogout");
  this.addonProxy.postMessage({ type: 'logout' });
}

addonProxy.on('watch', function(args) {
  personaProxy.watch(args);
  console.log("received watch", args);
});

addonProxy.on('request', function(args) {
  // cache request args until user actually clicks the button
  personaProxy.requestArgs = args;
  console.log("received request", args);
});

$("#login-btn").click(function(e) {
  e.preventDefault();
  personaProxy.request();
});
