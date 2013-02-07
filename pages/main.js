var pageMessaging = PageMessaging();
pageMessaging.addHandler("test", function(args, $promise) {
  console.log("HERE", args, $promise);
  $promise.reject("BOOOOOO");
});
