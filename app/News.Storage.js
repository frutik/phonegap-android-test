//Ext.ns('News');

News.Storage = Ext.extend(Ext.util.Observable, {                                                                                                                                        
                                                                                                                                                                                                
    //singleton: true,                                    
                                                                                                                                                                                                
	storage: false,
	storageShortName: 'newsteua', 
	storageVersion: '1.0', 
	storageDisplayName: 'News.Te.Ua Database', 
	storageMaxSize: 6553600,
	
	initialBatch: 2,
	preloadBatch: 2,

	fetchFromSite: function(dataHandler, recordId, count) {
		console.log('-----');
		
		dataHandler('test', 'test2');
		//that.fireEvent('newdata'); 
		return true;

		//http://mobile-webapps.blogspot.com/2010/07/blog-post_18.html
	 	//http://www.sencha.com/forum/showthread.php?104802-Infinite-carousel
		//http://stackoverflow.com/questions/6554714/sencha-touch-carousel-and-json
        var request = new XMLHttpRequest();
        var currentTime = new Date(); 
        request.open("GET", "http://www.news.te.ua/json/l:10/nc:" + currentTime.valueOf() + '/', true); 
        request.onreadystatechange = function() {//Call a function when the state changes. 
            if(request.readyState == 4) { 
                    console.log("*"+request.responseText+"*"); 
                    var tweets = JSON.parse(request.responseText); 
                    // Do something with the data here.                             
            		for (i = 0; i < tweets.length; i++) {
			        	that.storage.transaction(function(tx) {
							tx.executeSql('insert into news	 values (?, ?);', [tweets[i]['id'], tweets[i]['title']], that.nullDataHandler, that.nullDataHandler); 
			        	});
            			
            		}
            		
            } 
        } 
        console.log("asking for tweets"); 
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

	getInitialRecords: function(dataHandler) {
		try {
			that.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM items where id > 100 ORDER BY id LIMIT ?',
					[that.initialBatch], 
					dataHandler, 
					that.logErrorHandler
				);
			});
		} catch(e) {
			alert(e.message);
		}
	},

	getPrevRecords: function(dataHandler, currentIdx) {},

	getNextRecords: function(dataHandler, currentRecordId) {
		try {
			that.storage.transaction(function(tx) {
				tx.executeSql(
					'SELECT * FROM news WHERE id > ? ORDER BY id LIMIT ?',
					[currentRecordId, that.preloadBatch], 
					dataHandler, 
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
            'new_data'                                                                                                                                           
        );
                                                    	
		News.Storage.superclass.constructor.call(this);
/*
		that = this;
	
		alert('!!!');
	
		if (!window.openDatabase) { 
			return false; 
        }
		
		try { 
        	that.storage = openDatabase(
        		that.storageShortName, 
        		that.storageVersion, 
        		that.storageDisplayName, 
        		that.storageMaxSize
    		); 
    
        	that.storage.transaction(function(tx) {
	        	tx.executeSql('CREATE TABLE IF NOT EXISTS news(id INTEGER NOT NULL PRIMARY KEY, added TEXT NOT NULL DEFAULT "", source TEXT NOT NULL DEFAULT "", category TEXT NOT NULL DEFAULT "", url TEXT NOT NULL DEFAULT "", title TEXT NOT NULL DEFAULT "", description TEXT NOT NULL DEFAULT "");', [], that.logDataHandler, that.logErrorHandler); 
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
		*/
	}
});

Ext.reg('News.Storage', News.Storage);
