Ext.ns('News');

News.Storage = Ext.extend(Ext.util.Observable, {                                                                                                                                        
                                                                                                                                                                                                
    actionFetchInitial: '',
    actionFetchAfter: 'a',
    actionFetchBefore: 'b',
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
                console.log("*****"+request.responseText+"*****");

                var records = JSON.parse(request.responseText); 

				if (!records.length || records.length < 1) {
					return true;
				}

        		for (i = 0; i < records.length; i++) {
		        	(function(record){
		        		that.storage.transaction(function(tx) {
						tx.executeSql(
							'insert into news (id, added, source, category, url, title, description) values (?, ?, ?, ?, ?, ?, ?);', 
							[record.id, records.added, record.source,	records.category, record.url, record.title, record.description],
							that.logSuccessHandler, 
							that.logErrorHandler
						); 
		        	});
		        	})(records[i]);
        		}

				that.data = that.getDataFromWeb(records);
				that.fireEvent('data_loaded'); 
            } 
        } 
        
        console.log("asking for news"); 
        request.send(); 
     },
     
     getDataFromWeb: function(data) {
     	return data;
     },

	errorHandler: function(transaction, error) {
		console.log(error.message);
      	return true;  
    },

	logSuccessHandler: function (transaction, result) {
		console.log(result);
      	return true;  
	},

	logErrorHandler: function (transaction, error) {
		console.log(error.message);
		Ext.getBody().unmask();
		//navigator.notification.loadingStop();
      	return true;  
	},
	
 	nullDataHandler: function (transaction, results) {},

	getData: function() {
		return this.data;
	},

	getInitialRecords: function() {
		that = this;
		
		// http://nachbaur.com/blog/telling-your-user-that-a-phonegap-application-is-busy
		// http://stackoverflow.com/questions/7063910/phonegap-navigator-notification-activitystart-and-loadingstart-not-working
		// https://github.com/phonegap/phonegap-plugins/tree/master/Android/StatusBarNotification
		Ext.getBody().mask();
		//navigator.notification.loadingStart();

		console.log('getting initial recordset from db');
	
		try {
			this.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM news where id > 0 ORDER BY id LIMIT ?',
					[that.initialBatch], 
					function(transaction, results) {
						if (results.rows.length == 0) {
							console.log('EMPTY RECORDSET in News.Storage.getInitialRecords()');
							that.fetchFromSite(that.actionFetchInitial, null, that.initialBatch);
							return true;
						}
	
						that.data = that.getDataFromSql(results);
						
						Ext.getBody().unmask();
						//navigator.notification.loadingStop();
						
						that.fireEvent('data_loaded'); 
    				}, 
					that.logErrorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	getPrevRecords: function(recordId) {
		that = this;

		that.recordId = recordId;
		
		console.log('getting prev recordset from db');
	
		try {
			this.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM news where id < ? ORDER BY id LIMIT ?',
					[that.recordId, that.initialBatch], 
					function(transaction, results) {
						if (results.rows.length == 0) {
							console.log('EMPTY RECORDSET in News.Storage.getPrevRecords()');
							that.fetchFromSite(that.actionFetchPrev, that.recordId, that.initialBatch);
							return true;
						}
	
						that.data = that.getDataFromSql(results) + that.data;
						that.fireEvent('data_loaded'); 
    				}, 
					that.logErrorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	getDataFromSql: function(data) {
		result = new Array();;
		for (var i = 0; i < data.rows.length; i++) {
			result[i] = data.rows.item(i); 
		}
		return result;
	},

	reset: function() {
    	console.log('RESET STORAGE');
    	this.storage.transaction(function(tx) {
        	tx.executeSql('DELETE FROM news;', [], this.logDataHandler, this.logErrorHandler); 
    	});
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
	        	tx.executeSql('CREATE TABLE IF NOT EXISTS news (id INTEGER NOT NULL PRIMARY KEY, added TEXT NOT NULL DEFAULT "", source TEXT NOT NULL DEFAULT "", category TEXT NOT NULL DEFAULT "", url TEXT NOT NULL DEFAULT "", title TEXT NOT NULL DEFAULT "", description TEXT NOT NULL DEFAULT "");', [], this.logDataHandler, this.logErrorHandler); 
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
