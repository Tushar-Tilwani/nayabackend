db.projects.findOne({"tasks":{$elemMatch: {"manager_id": ObjectId("575b15a39ecd022e66a87a6bw")}}})


var userD= db.user.findOne({"id" : "001"}, {"friends": 1})
db.user.find( {"id" : {$in : user.friends }}).sort("age" : 1);


 /*"_id": "5768534e796c7582b2220554"*/


 db.projects.aggregate([
    // Get just the docs that contain a shapes element where color is 'red'
    {$match: {'tasks.manager_id': ObjectId('575b15a39ecd022e66a87a68')}},
    {$project: {
        tasks: {
        	$filter: {
               input: "$tasks",
               as: "task",
               cond: {  }
            }
        },
        _id: 0
    }}
])

db.projects.find({tasks: {$elemMatch: {manager_id:'575b15a39ecd022e66a87a68'}}})

db.projects.aggregate([
{
	$match: {'tasks.manager_id': '575b15a39ecd022e66a87a68'}
}, {
	$project: {
		tasks: {
			$filter: {
				input: "$tasks",
				as: "task",
				cond: {$eq: ['$$task.manager_id', '575b15a39ecd022e66a87a68']}
			}
		},
		_id: 0
	}
}
]);


db.projects.aggregate([{
	$lookUp: {
		from: 'users',
		localField:'manager_id',
		foreignField: '_id',
		as: 'manager'
	}
}]);


db.projects.aggregate([{
	$match: {'tasks.manager_id': '575b15a39ecd022e66a87a68'}
},
{ $unwind : "$tasks" },
{
      $lookup: {
          from: "users",
          localField: "tasks.manager_id",
          foreignField: "_id",
          as: "manager"
        }
   },{
   	$project: {
		tasks: {
			$filter: {
				input: "$tasks",
				as: "task",
				cond: {$eq: ['$$task.manager_id', '575b15a39ecd022e66a87a68']}
			}
		},
		_id: 0,
		manager:1
	}
   }])




db.projects.aggregate([{
	$match: {'tasks.manager_id': '575b15a39ecd022e66a87a6b'}
},{ 
	$unwind : "$tasks" 
},{
	$lookup: {
		from: "users",
		localField: "manager_id",
		foreignField: "_id",
		as: "manager"
	}
},{
	$project: {
		tasks: 1,
		_id: 0,
		manager:1
	}
}])



db.projects.aggregate([
{ 
	$unwind : "$tasks" 
},{
	$match: {"tasks.manager_id": ObjectId('575b15a39ecd022e66a87a6c')}
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
		_id: 0,
		tasks.manager.$.password:0
	}
}]).pretty()


