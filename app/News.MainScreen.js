Ext.ns('News');
                                                                                                                                                                                                
var NewStorage = new function() {                                                                                                                                                                     

    var that = this;  

	this.storage = false;
	this.storageShortName = 'newsteua'; 
	this.storageVersion = '1.0'; 
	this.storageDisplayName = 'News.Te.Ua Database'; 
	this.storageMaxSize = 65536;

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
				transaction.executeSql('SELECT * FROM items ORDER BY id',[], dataHandler, that.errorHandler);
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

News.MainScreen = Ext.extend(Ext.Carousel, {
	
	singleton: true,

	cardSwitchAnimation: 'fade',
	
	layout: {
		type: 'card'
	},

    listeners: {
		cardswitch: function(container, newCard, oldCard, index) {
			console.log(container, newCard, oldCard, index);
			
			cnt = this.items.getCount();
	
			if (cnt == index + 1) {
				console.log('last card');
				this.addCardAfter(cnt);
    	    } else if (index == 0) {
				console.log('first card');
    	    	this.addCardBefore();
    	    }
        }
    },

	addCardAfter: function(cnt) {
		Ext.getBody().mask();
		//navigator.notification.loadingStart();

		for (i = cnt + 1; i < cnt + 5; i++) {
			console.log('added card ' + i);
			this.add(this.getCard(i));
		}	

		this.doLayout();
		
		Ext.getBody().unmask();
		//navigator.notification.loadingStop();
	},

	addCardBefore: function() {
		Ext.getBody().mask();
		//navigator.notification.loadingStart();

		this.insert(0, this.getCard(0));
		this.doLayout();
		
		Ext.getBody().unmask();
		//navigator.notification.loadingStop();
	},

	getCard: function(node) {
		return new Ext.Panel({
    			html: node,
	            listeners: {
		            //activate : function() {alert("bam!")},
		        }
    	});
	},

    initComponent: function() {
        this.fullscreen = true;
//        this.indicator = false;
        this.defaults = {
            style       : 'margin:10px;'
        };
        
        this.items = [];

  //      childPanel.on('addpanel', this.onAddPanel, this);
//    	this.on('beforecardswitch', this.onCardSwitch, this);
    	    
        News.MainScreen.superclass.initComponent.call(this);

		this.loadInitialData();
    },

	appendCard: function(json) {
		this.add(this.getCard(json));
	},

	prependCard: function(json) {
		this.insert(0, this.getCard(json));
	},

	appendDataHandler: function(transaction, results) {
		for (var i=0; i<results.rows.length; i++) { 
			var row = results.rows.item(i);
			main.appendCard(row['content']);
      	}
      	
      	if (results.rows.length > 0) {
			main.doLayout();
      	}
      	 
      	return true; 
    },

	prependDataHandler: function(transaction, results) {
		for (var i=0; i<results.rows.length; i++) { 
			var row = results.rows.item(i);
			main.appendCard(row['content']);
      	}

      	if (results.rows.length > 0) {
			main.doLayout();
      	}

      	return true; 
    },

	loadInitialData: function() {
		NewStorage.getInitialRecords(this.appendDataHandler);
		//this.appendCard(1);
		//this.appendCard(2);
	}, 

	loadPrevData: function() {
		NewStorage.getPrevRecords(this.prependDataHandler, 0);
	}, 
	
	loadNextData: function() {
		NewStorage.getNextRecords(this.appendDataHandler);
	}
	
});

