const personaAdapter = require("./persona_adapter");

var promise = personaAdapter.getAssertion("http://localhost:8080/main.html");
promise.
  then(function(message) {

  }).
  then(null, function(error) {

  });