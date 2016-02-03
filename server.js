var express = require('express');
var path = require('path');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

process.env.PWD = process.cwd();
app.use(express.static(path.join(process.env.PWD, 'public')));

port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('App listening on port', port);
});
