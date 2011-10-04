Ext.ns('News');
                                                                                                                                                                                                
var NewStorage = new function() {                                                                                                                                                                     

    var that = this;  

	this.storage = false;
	this.storageShortName = 'newsteua'; 
	this.storageVersion = '1.0'; 
	this.storageDisplayName = 'News.Te.Ua Database'; 
	this.storageMaxSize = 65536;

	this.storageErrorHandler = function(transaction, error) {
		
		console.log(error.message);
	
		if (error.code == 5) {
			alert('create new storage tables');
			console.log('create new storage tables');
			try {
        		transaction.executeSql('CREATE TABLE items(id INTEGER NOT NULL PRIMARY KEY, content TEXT NOT NULL DEFAULT "");', [], that.storageNullDataHandler, that.storageNullDataHandler); 
	//			that.storageInitTables();
			}  catch(e) {
        		// alert(e.message);
        		return;
      		}
			
		} 

      	return true;  
    };
	
	this.storageDataHandler = function(transaction, results) {
		alert(results); 
    	//for (var i=0; i<results.rows.length; i++) { 
        //var row = results.rows.item(i); 
        //html += '<li>'+row['name']+'</li>\n';
      //}
      	return true; 
    };
 	
 	this.storageNullDataHandler = function (transaction, results) {};

	this.getInitialRecords = function(dataHandler) {
		try {
			that.storage.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM items ORDER BY id',[], that.storageDataHandler, that.storageErrorHandler);
			});
		} catch(e) {
			alert(e.message);
		}
		
		return [];
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
    			html: 'item' + node,
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

	addCard: function(json) {
		that = this;
	
		this.add(this.getCard(json));
	},

	loadInitialData: function() {
		NewStorage.getInitialRecords(this.addCard);
		
		this.addCard(1);
		this.addCard(2);
	}
	
});

