const personaProxy = require("./persona_proxy");

function onlogin(assertion) {
  console.log("assertion", assertion);
}

function onlogout() {
  console.log("logout");
}

function onerror(error) {
  console.log("ERROR: "+ error);
}

function oncancel() {
  console.log("on cancel");
}

personaProxy.watch({ onlogin: onlogin, onlogout: onlogout, onerror: onerror});
personaProxy.request({ siteName: "PICL FTW", oncancel: oncancel });
