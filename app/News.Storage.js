Ext.ns('News');
                                                                                                                                                                                                
News.Storage = new function() {                                                                                                                                                                     

    var that = this;  

	this.storage = false;
	this.storageShortName = 'newsteua'; 
	this.storageVersion = '1.0'; 
	this.storageDisplayName = 'News.Te.Ua Database'; 
	this.storageMaxSize = 6553600; // bytes
	
	this.initialBatch = 2;
	this.preloadBatch = 4;

	this.errorHandler = function(transaction, error) {
		
		console.log(error.message);
	
		if (error.code == 5) {
			alert('create new storage tables');
			console.log('create new storage tables');
			try {
				that.storage.transaction(function(tx) {
	        		tx.executeSql('CREATE TABLE items(id INTEGER NOT NULL PRIMARY KEY, content TEXT NOT NULL DEFAULT "");', [], that.nullDataHandler, that.nullDataHandler); 
				});
			}  catch(e) {
        		alert(e.message);
      		}

    		return;
		}
		
		alert(error.message);

      	return true;  
    };
	
 	this.nullDataHandler = function (transaction, results) {};

	this.getInitialRecords = function(dataHandler) {
//		that.storage.transaction(function(tx) {
//    		tx.executeSql('insert into items values (1, "test 1");', [], that.nullDataHandler, that.nullDataHandler); 
//    		tx.executeSql('insert into items values (2, "test 2");', [], that.nullDataHandler, that.nullDataHandler); 
//		});

		try {
			that.storage.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM items ORDER BY id LIMIT ?',[that.initialBatch], dataHandler, that.errorHandler);
			});
		} catch(e) {
			alert(e.message);
		}
		
		return [];
	};

	this.getPrevRecords = function(dataHandler, currentIdx) {
	};

	this.getNextRecords = function(dataHandler) {
	};

	this.init = function() {
	
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
 		} catch(e) {
			if (e == INVALID_STATE_ERR) { 
				// Version number mismatch. 
				alert("Invalid database version."); 
			} else { 
				alert("Unknown error "+e+"."); 
			}
			return false; 
		}
	};
	
	this.init();
}
