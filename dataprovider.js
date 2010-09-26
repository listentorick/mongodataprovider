
	var Db = require('./lib/node-mongodb-native/lib/mongodb/db').Db,
    ObjectID = require('./lib/node-mongodb-native/lib/mongodb/bson/bson').ObjectID,
    Server = require('./lib/node-mongodb-native/lib/mongodb/connection').Server;

	var DataProvider = function (host, port, dbname, collectionName){
	  this._collectionName = collectionName;
	  this.db= new Db(dbname, new Server(host, port, {auto_reconnect: true}, {strict:true}));
	  this.db.open(function(){});
	};
	
	DataProvider.prototype = {
	
		ensureIndex: function(query, unique, callback) {
			this.db.ensureIndex(this._collectionName, query, unique, callback);
		},
		
		createPrimaryKey: function() {
			return ObjectID.createPk();
		},
	
		getCollection: function(callback) {
		  this.db.collection(this._collectionName, function(error, collection) {
			if( error ) callback(error);
			else callback(null, collection);
		  });
		},

		count: function(query, callback) {
		  this.getCollection(function(error, collection) {
			  if( error ) callback(error)
			  else {
				  collection.count(query, function(error, count) {
				  if( error ) callback(error)
				  else {
					callback(null,count);
				  }
				});
			  }
			});
		},
		
		findBy: function(query, options, callback) {
		  this.getCollection(function(error, collection) {
			  if( error ) callback(error)
			  else {
				collection.find(query, options, function(error, cursor) {
				  if( error ) callback(error)
				  else {
					cursor.toArray(function(error, results) {
					  if( error ) callback(error)
					  else callback(null, results)
					});
				  }
				});
			  }
			});
		},
		
		
		findByPaged: function(query, pageIndex, pageSize, callback) {
			var options = this._buildPagingOptions({},pageIndex, pageSize);
			this.findBy(query,options,callback);
		},
		
		_buildPagingOptions: function(options, pageIndex, pageSize) {
			options.skip = pageSize * (pageIndex);
			options.limit = pageSize;
			return options;
		},
		
		findByPagedAndSort: function(query, pageIndex, pageSize, sort, callback) {
			var options = this._buildPagingOptions({},pageIndex, pageSize);
			//options.sort = sort;
			this.findBy(query,options,callback);
		},

		findAll: function(callback) {
			this.findBy({},{},callback);
		},
		
		findById: function(id, callback) {
			this.findOne({_id:ObjectID.createFromHexString(id)}, callback);
		},
		
		findByObjectId: function(id, callback) {
			this.findOne({_id:id}, callback);
		},
		
		findOne: function(query, callback) {
		  this.getCollection(function(error, collection) {
			  if( error ) callback(error)
			  else {
				 collection.findOne(query, function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
				});
			  }
			});
		},
		
		updateByObjectId: function(id, modifier, callback) {
			var query = {_id:id};
			this.update(query, modifier, callback);
		},
		
		updateById: function(id, modifier, callback) {
			var query = {_id:ObjectID.createFromHexString(id)};
			this.update(query, modifier, callback);
		},
		
		update: function(query, modifier, callback) {
			this.getCollection(function(error, collection) {
				if( error ) callback(error)
				else {
					collection.update(query, modifier, {upsert: true}, function(error,result) { //this applies modifier to every item found by the query 
						callback(null,null);
					});
				}
				
			});
		
		},
		
		save: function(doc, callback) {
			var self = this;
			this.getCollection(function(error, collection) {
				if( error ) callback(error)
				else {	
					collection.save(doc, function() {
						self.db.lastError(function(err, error){						
							if(error && error.length && error[0] && error[0].err!=null) { 	
								callback(error[0], null)
							} else {
								callback(null,doc)
							}
							
						});
					
					});
				}
			});
		}
	};

exports.DataProvider = DataProvider;