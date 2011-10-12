Ext.ns('News');

News.Storage = Ext.extend(Ext.util.Observable, {                                                                                                                                        
                                                                                                                                                                                                
    //singleton: true,                                    
    
    actionFetchInitial: '',
    actionFetchAfter: 'a',
    actionFetchBefore: 'a',
    actionFetchLimit: 'l',
                                                                                                                                                                                                
	storage: false,
	storageShortName: 'newsteua', 
	storageVersion: '1.0', 
	storageDisplayName: 'News.Te.Ua Database', 
	storageMaxSize: 6553600,
	
	initialBatch: 10,
	preloadBatch: 2,

	data: false,

	fetchFromSite: function(action, recordId, count) {
		that = this;
		console.log(action);

		url = "http://www.news.te.ua/json/";

		if (!count) {
			count = that.preloadBatch;
		}
		
		url = url + that.actionFetchLimit + ':' + count + '/';

		if (action == that.actionFetchAfter) {
			url = url + that.actionFetchAfter + ':' + recordId + '/';
		}

		if (action == that.actionFetchBefore) {
			url = url + that.actionFetchBefore + ':' + recordId + '/';
		}
		
		var currentTime = new Date(); 
		url = url + "nc:" + currentTime.valueOf() + '/';

		//http://mobile-webapps.blogspot.com/2010/07/blog-post_18.html
	 	//http://www.sencha.com/forum/showthread.php?104802-Infinite-carousel
		//http://stackoverflow.com/questions/6554714/sencha-touch-carousel-and-json
        var request = new XMLHttpRequest();
        
        request.open("GET", url, true); 
        request.onreadystatechange = function() {//Call a function when the state changes. 
            if(request.readyState == 4) { 
                console.log("*"+request.responseText+"*");
                var records = JSON.parse(request.responseText); 
        		for (i = 0; i < records.length; i++) {
		        	that.storage.transaction(function(tx) {
						tx.executeSql('insert into news	 values (?, ?);', [records[i].id, records[i].title], that.nullDataHandler, that.nullDataHandler); 
		        	});
        		}
				
				// cout 0???
				
				that.data = records;
				that.fireEvent('data_loaded'); 
            } 
        } 
        
        console.log("asking for news"); 
        request.send(); 
     },

	errorHandler: function(transaction, error) {
		console.log(error.message);
      	return true;  
    },

	logSuccessHandler: function (transaction, result) {
		console.log(result);
	},

	logErrorHandler: function (transaction, error) {
		console.log(error);
	},
	
 	nullDataHandler: function (transaction, results) {
 	},
/*
	initialDataHandler: function(transaction, results) {
		that = this;
	
		console.log(results);

		if (results.rows.length == 0) {
			//main.storage.fetchFromSite(main.appendDataHandler2);
			return true;
		}
	alert(News.Storage.data);
		News.Storage.data = results;
		News.Storage.fireEvent('initial_data_loaded'); 
    },
*/
	getData: function() {
		return this.data;
	},

	getInitialRecords: function() {
		that = this;

		console.log('getting initial recordset from db');
	
		try {
			this.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM news where id > 0 ORDER BY id LIMIT ?',
					[that.initialBatch], 
					function(transaction, results) {
						console.log(results);
						if (results.rows.length == 0) {
							that.fetchFromSite(that.actionFetchInitial, null, that.initialBatch);
							return true;
						}
						that.data = results.rows;
						that.fireEvent('data_loaded'); 
    				}, 
					that.logErrorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	getPrevRecords: function(currentRecordId) {
		that = this;
		try {
			that.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM items WHERE id < ? ORDER BY id LIMIT ?',
					[currentRecordId, that.preloadBatch], 
					function(transaction, results) {
						console.log(results);
						if (results.rows.length == 0) {
							//main.storage.fetchFromSite(main.appendDataHandler2);
							return true;
						}
					
						// TODO combine old and new data????
						that.data = results;
						that.fireEvent('data_loaded'); 
    				}, 
					that.errorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	getNextRecords: function(currentRecordId) {
		that = this;
		try {
			that.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM items WHERE id > ? ORDER BY id LIMIT ?',
					[currentRecordId, that.preloadBatch], 
					function(transaction, results) {
						console.log(results);
						if (results.rows.length == 0) {
							//main.storage.fetchFromSite(main.appendDataHandler2);
							return true;
						}
					
						// TODO combine old and new data????
						that.data = results;
						that.fireEvent('data_loaded'); 
    				}, 
					that.errorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	test: function() {
		this.fireEvent('new_data'); 
	},

	constructor: function() {

        this.addEvents(                                                                                                                                                                         
            'data_loaded'                                                                                                                                           
        );
                                                    	
		News.Storage.superclass.constructor.call(this);

		if (!window.openDatabase) { 
			return false; 
        }
		
		try { 
        	this.storage = openDatabase(
        		this.storageShortName, 
        		this.storageVersion, 
        		this.storageDisplayName, 
        		this.storageMaxSize
    		); 
    
        	this.storage.transaction(function(tx) {
	        	tx.executeSql('CREATE TABLE IF NOT EXISTS news(id INTEGER NOT NULL PRIMARY KEY, added TEXT NOT NULL DEFAULT "", source TEXT NOT NULL DEFAULT "", category TEXT NOT NULL DEFAULT "", url TEXT NOT NULL DEFAULT "", title TEXT NOT NULL DEFAULT "", description TEXT NOT NULL DEFAULT "");', [], this.logDataHandler, this.logErrorHandler); 
        	});

			return true; 

 		} catch(e) {
			if (e == INVALID_STATE_ERR) { 
				alert("Invalid database version."); 
			} else { 
				alert("Unknown error "+e+"."); 
			}
			return false; 
		}
	}
});

Ext.reg('News.Storage', News.Storage);
