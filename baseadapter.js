
var ObjectID = require('./lib/node-mongodb-native/lib/mongodb/bson/bson').ObjectID; //should this be in the data provider?


/**
* Adapts between schema and mongo objs
*/
var BaseAdapter = function() {
};

BaseAdapter.prototype = {

	/**
	* If an array is passed in, you get back an array
	* If an object is passed in you get back an object
	*/
	templatableAdapter: function(obj, adapters) {
		var returnArray = true;
		
		if(!adapters.length) {
			adapters = [adapters];
		}
		var numAdapters = adapters.length;
		
		if(!Array.isArray(obj)) { //ecma 5
			returnArray = false;
			obj = [obj];
		}
		var numObjs = obj.length;
		
		var results = [];
		var result;
		var newObj;
		var adapter;
		for(var i=0;i<numObjs;i++){
		    newObj = {};
			for(var j=0;j<numAdapters;j++) {
				adapter = adapters[j];
				newObj = adapter(newObj, obj[i]);
			}
			results.push(newObj);
		}
		
		//require('sys').debug(JSON.stringify(results));
		return returnArray ? results : results[0]
	},
	
	adaptFromSchemaId: function(mongo, schema) {
		if(schema.id) {
			mongo._id = ObjectID.createFromHexString(schema.id);
		}
		return mongo;
	},
	
	adaptToSchemaId: function(schema, mongo) {
		if(mongo._id && mongo._id.toHexString) {
			schema.id = mongo._id.toHexString(); 
		}
		return schema;
	},
	
	adaptFromSchemaState: function(mongo, schema) {
		if(schema.state) {
			mongo.s = schema.state;
			mongo.sl = schema.state.length;
		} else {
			mongo.s = [];
		}
		return mongo;
	},
	
	adaptToSchemaState: function(schema, mongo) {
		if(mongo.s) {
			schema.state = mongo.s;
		} else {
			schema.state = [];
		}
		return schema;
	},
	
	adaptObjectIdToHexString: function(objectId) {
		return objectId.toHexString();
	},
	
	adaptHexStringToObjectId: function(hexString) {
		return  ObjectID.createFromHexString(hexString);
	}
	
	
};

exports.BaseAdapter = BaseAdapter;