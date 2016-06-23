  var ObjectID = require('mongodb').ObjectID;
  var _ = require('lodash/core');

  CollectionDriver = function(db) {
    this.db = db;
  };

  CollectionDriver.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, the_collection) {
      if( error ) callback(error);
      else callback(null, the_collection);
    });
  };

  //find all objects for a collection
  CollectionDriver.prototype.findAll = function(collectionName, callback) {
      this.getCollection(collectionName, function(error, the_collection) { //A
        if( error ) callback(error)
          else {
          the_collection.find().toArray(function(error, results) { //B
            if( error ) callback(error)
              else callback(null, results)
            });
        }
      });
    };

  //find a specific object
  CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
              var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
              if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
              else the_collection.findOne({'_id':ObjectID(id)},{password:0}, function(error,doc) { //C
              	if (error) callback(error)
                 else callback(null, doc);
             });
            }
          });
  }

  //save new object
  CollectionDriver.prototype.save = function(collectionName, obj, callback) {
      this.getCollection(collectionName, function(error, the_collection) { //A
        if( error ) callback(error)
          else {
          obj.created_at = new Date(); //B
          the_collection.insert(obj, function() { //C
            callback(null, obj);
          });
        }
      });
    };

  //update a specific object
  CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
  	        obj._id = ObjectID(entityId); //A convert to a real obj id
  	        obj.updated_at = new Date(); //B
              the_collection.save(obj, function(error,doc) { //C
              	if (error) callback(error)
                 else callback(null, obj);
             });
            }
          });
  }


  //delete a specific object
  CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
      this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error)
          else {
              the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
              	if (error) callback(error)
                 else callback(null, doc);
             });
            }
          });
    }


    CollectionDriver.prototype.push = function(collectionName, entityId, object, callback) {

     if(object && object.manager_id) {
      object.manager_id = ObjectID(object.manager_id);
    }

    var that = this;

      this.get.call(this,"users", object.manager_id, function(error, doc) { //A
       if (error) callback(error)
        else {
          console.log(doc);
          projFunc.call(that,doc);
        }
      });

      

      var projFunc = function(manager){
       console.log("manager3");
         this.getCollection("projects", function(error, the_collection) { //A
           if (error) callback(error)
            else {
             object._id = ObjectID();
             the_collection.update({'_id':ObjectID(entityId)},{"$push":{"tasks":object}},{"upsert":true}, function(error,doc) { //B
              if (error){
                callback(error)
              } else{
                object.manager = manager;
                callback(null, object);
              }
            });
           }
         });
       };

     }


  //find a specific object
  CollectionDriver.prototype.genericGet = function(collectionName,selection,projection,callback) { //A
    console.log(collectionName);
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
          console.log(selection);
             the_collection.find(selection,projection).toArray(function(error, results) { //B
              if( error ) callback(error)
                else callback(null, results)
              });
           }
         });
  }

  CollectionDriver.prototype.updateArray = function(collectionName, parentId, arrayName, childId, childObj, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
          childObj._id = ObjectID(childId);
              //childObj._id = "ff";
              childObj.updated_at = new Date(); //B

              var childSelectKey = arrayName + "._id";
              var childUpdateKey = arrayName + ".$";
              var selection = {
                _id: ObjectID(parentId)
              };
              selection[childSelectKey] = ObjectID(childId);
              var toUpdate = {};
              toUpdate["$set"] = {};
              toUpdate["$set"][childUpdateKey] = childObj;
              
              console.log(selection);
              console.log(toUpdate);

              the_collection.update(selection, toUpdate, {
                "upsert": true
              }, function(error, doc) { //B
                if (error) callback(error)
                  else callback(null, childObj);
              });
            }
          });
  }


  CollectionDriver.prototype.deleteArray = function(collectionName, parentId, arrayName, childId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
          var selection = {
            _id: ObjectID(parentId)
          };

          var toUpdate = {};
          toUpdate["$pull"] = {};
          toUpdate["$pull"][arrayName] = {
            _id: ObjectID(childId)
          };
          
          console.log(selection);
          console.log(toUpdate);

          the_collection.update(selection, toUpdate, {
            "multi": false
              }, function(error, doc) { //B
                if (error) callback(error)
                  else callback(null, childId);
              });
        }
      });
  }


  CollectionDriver.prototype.getArray = function(collectionName, parentId, arrayName, childId, callback) {
    var selection = {
      _id: ObjectID(parentId)
    };

    var projection = {
      _id: 0
    };

    projection[arrayName] = {
      $elemMatch: {
        "_id": ObjectID(childId)
      }
    };

    return this.genericGet(collectionName, selection, projection, callback)
  }


  CollectionDriver.prototype.findByUser = function(collectionName, userId, callback) {
    var selection = {};
    var managerQ = {
      manager_id: ObjectID(userId)
    };
    var employeeQ = {
      "tasks":{
        $elemMatch: {
          "_id": ObjectID(userId)
        }
      }
    };
    selection["$or"] = [managerQ,employeeQ];

    var projection = {};

    return this.genericGet(collectionName, selection, projection, callback)
  }

  CollectionDriver.prototype.findByManager = function(collectionName, userId, callback) {
    var selection = {
      manager_id: ObjectID(userId)
    };
    var projection = {};
    return this.genericGet(collectionName, selection, projection, callback)
  }

  CollectionDriver.prototype.authenticateUser = function(collectionName, username, password, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if (error) callback(error)
        else {
          var selection = {
            username: username,
            password: password
          };

            the_collection.findOne(selection, {}, function(error, doc) { //B
             console.log(doc);
             if (error) { 
              callback(error) 
            } else if(_.isEmpty(doc)) {
              callback({error:"User Not found!",status:404}); 
            } else {
              var token = ObjectID();
              var selection = {
                _id: ObjectID(doc._id)
              };
              var toUpdate = {};
              toUpdate["$set"] = {
                token: token
              };

              the_collection.update(selection, toUpdate, {
                "upsert": true
                    }, function(error, doc) { //B
                      if (error) callback(error)
                        else callback(null, toUpdate["$set"]);
                    });
            }
          });
          }
        });
}


CollectionDriver.prototype.getUserFromToken = function(token, callback) {
  var collectionName = "users";
  this.getCollection(collectionName, function(error, the_collection) {
    if (error) callback(error)
      else {
        var selection = {
          token: ObjectID(token)
        };
        var projection = {
          password: 0
        };
        console.log(selection);
            the_collection.findOne(selection, projection, function(error, doc) { //B
              if (error) { 
                callback(error);
              } else {
               callback(null,doc);
             }
           });
          }
        });
}



CollectionDriver.prototype.getTasksByEmployee = function(employeeId, callback) {
  this.getCollection("projects", function(error, the_collection) {
    if (error) {
      console.log(error);
      callback(error);
    } else {
      the_collection.aggregate([
      { 
        $unwind : "$tasks" 
      },{
        $match: {"tasks.manager_id": ObjectID(employeeId)}
      },{
        $lookup: {
          from: "users",
          localField: "tasks.manager_id",
          foreignField: "_id",
          as: "tasks.manager"
        }
      },{
        $project: {
          tasks: 1,
          _id: 0
        }
      }]).toArray(function(error,doc){
        if(error){
          callback(error);
        } else {
          callback(null,improveStructure(doc));
        }
      });
    }
  });

}


CollectionDriver.prototype.getTasksByProject = function(projectId, callback) {
  this.getCollection("projects", function(error, the_collection) {
    if (error) {
      console.log(error);
      callback(error);
    } else {
      the_collection.aggregate([
      {
        $match: {"_id": ObjectID(projectId)}
      },
      { 
        $unwind : "$tasks" 
      },{
        $lookup: {
          from: "users",
          localField: "tasks.manager_id",
          foreignField: "_id",
          as: "tasks.manager"
        }
      },{
        $project: {
          tasks: 1,
          _id: 0
        }
      }]).toArray(function(error,doc){
        if(error){
          callback(error);
        } else {
          callback(null,improveStructure(doc));
        }
      });
    }
  });
}


var improveStructure = function(docs){
  var rDocs = []
  for (var i = 0; i < docs.length; i++) {
    docs[i].tasks.manager = docs[i].tasks.manager && docs[i].tasks.manager[0]; 
    if(docs[i].tasks.manager && docs[i].tasks.manager.password){
      delete docs[i].tasks.manager.password;
    }
    rDocs.push(docs[i].tasks);
  };
  return rDocs;
}



exports.CollectionDriver = CollectionDriver;