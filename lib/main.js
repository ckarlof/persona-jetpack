const personaProxy = require("./persona_proxy");

function onlogin(assertion) {
	console.log("assertion", assertion);
}

function onlogout() {

}

function onerror(error) {
	console.log("ERROR: "+ error);
}

personaProxy.watch({ onlogin: onlogin, onlogout: onlogout, onerror: onerror });
// promise.
//   then(function(message) {
//     console.log("Success "+ message);
//   }).
//   then(null, function(error) {
//     console.log("Fail " + error);
//   });