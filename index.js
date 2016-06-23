var http = require('http'),
express = require('express'),
path = require('path'),
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();
var bodyParser = require('body-parser')
//app.set('port', process.env.PORT || 3001); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json 
app.use(bodyParser.json())

app.use(bodyParser.text({ type: 'text/plain' }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/*var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
    console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
    }
  var db = mongoClient.db("nayaDb");  //E
  collectionDriver = new CollectionDriver(db); //F
});*/



// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/nayaDb", function(err, database) {
  if(err) throw err;

  db = database;
  collectionDriver = new CollectionDriver(db);

  // Start the application after the database connection is ready
  app.listen(3001);
  console.log("Listening on port 3001");
});


app.use('/static',express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});


app.post('/projects/:projectId/user/:userId', function(req, res) { 
   //res.send('<html><body><h1>Hello World</h1></body></html>');
   var object = req.body;
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;

   collectionDriver.push(collection, entity, object, function(err,docs) {
    if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
 });


app.get('/projects/user/token/:token', function(req, res) { //I
 var params = req.params;
 var token = params.token;
 var callback = function(error,doc) {
   if (error) { res.send(400, error); }
   if(!doc) { res.send(400, {error: 'Token Invalid'}); }

   var collection = "projects";

  collectionDriver.findByUser(collection, doc._id, function(error, objs) { //J
    if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
}

collectionDriver.getUserFromToken(token, callback);

});

app.get('/projects/manager/token/:token', function(req, res) { //I
 var params = req.params;
 var token = params.token;
 var callback = function(error,doc) {
   if (error) { res.send(400, error); }
   if(!doc) { res.send(400, {error: 'Token Invalid'}); }

   var collection = "projects";

  collectionDriver.findByManager(collection, doc._id, function(error, objs) { //J
    if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
}

collectionDriver.getUserFromToken(token, callback);

});



app.get('/tasks/project/id/:id', function(req, res) { //I
 var params = req.params;
 var projectId = params.id;
 collectionDriver.getTasksByProject(projectId, function(err,docs) {
  if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
});

app.get('/tasks/employee/id/:id', function(req, res) { 
  var params = req.params;
  var employeeId = params.id;
  collectionDriver.getTasksByEmployee(employeeId, function(err,docs) {
    if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
});


app.get('/users/glevel/:level', function(req, res) { //I
 var params = req.params;
 var collection = "users";
 var level = params.level;
       collectionDriver.genericGet(collection,{ level: { $gte: parseInt(level) } },{}, function(error, objs) { //J
        if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
     });

app.get('/users/llevel/:level', function(req, res) { //I
 var params = req.params;
 var collection = "users";
 var level = params.level;
       collectionDriver.genericGet(collection,{ level: { $lte: parseInt(level) } },{}, function(error, objs) { //J
        if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
     });


app.get('/users/regex/:val/token/:token', function(req, res) { //I
 var params = req.params;
 
 var val = params.val;
 var token = params.token;
 var regex = new RegExp(val);
 var sendUsers = function(error,doc){
  if (error || !doc) { res.send(400, error || {message:"Invalid Token"}); } 
  else {
    console.log(doc);
    var selection = {
      $and: [{
        $or: [{
          first_name: {
            $regex: regex,
            $options: "si"
          }
        }, {
          last_name: {
            $regex: regex,
            $options: "si"
          }
        }]
      }, {
        level: {
          $lt: parseInt(doc.level)
        }
      }]
    };

 collectionDriver.genericGet("users",selection,{password:0}, function(error, objs) { //J
  if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
}
};

collectionDriver.getUserFromToken(token, sendUsers);

});


app.get('/users/regex/:val/glevel/:level', function(req, res) { //I
 var params = req.params;
 var collection = "users";
 var val = params.val;
 var regex = new RegExp(val);
 var level = params.level;
 var selection = {
  $and: [{
    $or: [{
      first_name: {
        $regex: regex,
        $options: "si"
      }
    }, {
      last_name: {
        $regex: regex,
        $options: "si"
      }
    }]
  }, {
    level: {
      $gte: parseInt(level)
    }
  }]
};
 collectionDriver.genericGet(collection,selection,{}, function(error, objs) { //J
  if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
});



app.get('/users/regex/:val/llevel/:level', function(req, res) { //I
 var params = req.params;
 var collection = "users";
 var val = params.val;
 var regex = new RegExp(val);
 var level = params.level;
 var selection = {
  $and: [{
    $or: [{
      first_name: {
        $regex: regex,
        $options: "si"
      }
    }, {
      last_name: {
        $regex: regex,
        $options: "si"
      }
    }]
  }, {
    level: {
      $lte: parseInt(level)
    }
  }]
};

var projection = { 
  password : 0
}
 collectionDriver.genericGet(collection,selection,projection, function(error, objs) { //J
  if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
});


app.post('/projects/:projectId/tasks/:taskId', function(req, res) { 
   //res.send('<html><body><h1>Hello World</h1></body></html>');
   var object = req.body;
   var params = req.params;
   var collection = "projects";
   var projectId = params.projectId;
   var taskId = params.taskId;
   var arrayName = "tasks";
//(collectionName,parentId,arrayName,childId,childObj,callback)
collectionDriver.updateArray(collection, projectId,arrayName,taskId, object, function(err,docs) {
  if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
});


app.delete('/projects/:projectId/tasks/:taskId', function(req, res) { 
   //res.send('<html><body><h1>Hello World</h1></body></html>');
   var object = req.body;
   var params = req.params;
   var collection = "projects";
   var projectId = params.projectId;
   var taskId = params.taskId;
   var arrayName = "tasks";
   collectionDriver.deleteArray(collection, projectId,arrayName,taskId, function(err,docs) {
    if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
 });


app.get('/projects/:projectId/tasks/:taskId', function(req, res) { 
 var object = req.body;
 var params = req.params;
 var collection = "projects";
 var projectId = params.projectId;
 var taskId = params.taskId;
 var arrayName = "tasks";

 collectionDriver.getArray(collection,projectId,arrayName,taskId, function(err,docs) {
  if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
});

app.get('/users/:username/:password', function(req, res) { 
 var object = req.body;
 var params = req.params;
 var collection = "users";
 var username = params.username;
 var password = params.password;

 collectionDriver.authenticateUser(collection,username,password, function(err,docs) {
  if (err) { res.send((err && err.status) || 400, err); } 
          else { res.send(201, docs); } //B
        });
});

app.get('/token/:token', function(req, res) { 
  console.log("token");
  
  var params = req.params;
  var token = params.token;
   //console.log("token");
   collectionDriver.getUserFromToken(token, function(err,docs) {
    if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
 });



app.post('/projects/:projectId/addTask', function(req, res) { 
   //res.send('<html><body><h1>Hello World</h1></body></html>');
   var contype = req.headers['content-type'];
   var task;
   if (contype && contype.indexOf('text/plain') >= 0 ){
    task = JSON.parse(req.body);
  } else {
    task = req.body;
  }

  var params = req.params;
  var projectId = params.projectId;
  var collection = "projects";
  collectionDriver.push(collection, projectId, task, function(err,docs) {
    if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
        });
});


app.get('/:collection/:entity', function(req, res) { //I
 var params = req.params;
 var entity = params.entity;
 var collection = params.collection;
 if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
        if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
        });
     } else {
      res.send(400, {error: 'bad url', url: req.url});
    }
  });


app.get('/:collection', function(req, res) { //A
  console.log("request")
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
        if (error) { res.send(400, error); } //D
        else { 
           res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
                }
              });
 });

