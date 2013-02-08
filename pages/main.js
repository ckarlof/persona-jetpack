var proxy = PageMessaging();

var personaAdapter;

function PersonaAdapter(args, $deferred) {
  this.args = args;
  this.$deferred = $deferred;
}

PersonaAdapter.prototype.request = function() {
  var args = $.extend({}, this.args);
  args.oncancel = this.oncancel.bind(this);
  navigator.id.watch({
    onlogin: this.onlogin.bind(this),
    onlogout: this.onlogout.bind(this)
  });
  navigator.id.request(args);
}

PersonaAdapter.prototype.oncancel = function() {
  console.log("PersonaAdapter.oncancel");
//  this.$deferred.reject({ type: "cancelled" });
};

PersonaAdapter.prototype.onlogin = function(assertion) {
  console.log("PersonaAdapter.onlogin", assertion);
  this.$deferred.resolve({ assertion: assertion });
}

PersonaAdapter.prototype.onlogout = function() {
  console.log("PersonaAdapter.onlogout");
}

proxy.on('watch', function(args) {
  // TODO: pick up here and do the right thing
  alert("foo");
  console.log("received watch", args);
});

// pageMessaging.addHandler("request", function(args, $deferred) {
//   personaAdapter = new PersonaAdapter(args, $deferred);
// });

$("#login-btn").click(function(e) {
  e.preventDefault();
  personaAdapter.request();
});
