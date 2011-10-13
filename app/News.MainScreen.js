Ext.ns('News');

News.MainScreen = Ext.extend(Ext.Carousel, {
	
	singleton: true,

	cardSwitchAnimation: 'fade',
	
	indicator: true,
	
	layout: 'card',

    listeners: {
    	tap: function() {
    		alert('!!!');
    	},
    
		cardswitch: function(container, newCard, oldCard, index) {
			console.log(container, newCard, oldCard, index);
			
			cnt = this.items.getCount();
	
			if (cnt == index + 1) {
				console.log('last card');
				// http://nachbaur.com/blog/telling-your-user-that-a-phonegap-application-is-busy
				// http://stackoverflow.com/questions/7063910/phonegap-navigator-notification-activitystart-and-loadingstart-not-working
				// https://github.com/phonegap/phonegap-plugins/tree/master/Android/StatusBarNotification
				Ext.getBody().mask();
				//navigator.notification.loadingStart();
				this.loadNextData(newCard.id);
				Ext.getBody().unmask();
				//navigator.notification.loadingStop();
    	    } else if (index == 0) {
				console.log('first card');
				Ext.getBody().mask();
				//navigator.notification.loadingStart();
				this.loadPrevData(newCard.id);
				Ext.getBody().unmask();
				//navigator.notification.loadingStop();
    	    }
        }
    },

	getCard: function(node) {
		return new Ext.Panel({
				//TODO store compiled
				/*
				t.append('some-element', {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'});
				*/				
    			// html: new Ext.XTemplate("<h4>{title}</h4><hr>{description}").apply({
    			html: this.elementTemplate.apply({
                	title: node.title,
                	description: node.description
            	}),
    			id: node.id,
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
        
        this.elementTemplate = new Ext.Template([
    		'<h4>{title}</h4>',
    		'<hr>',
    		'{description}',
        ]).compile();
        
        this.items = [];

		this.storage = new News.Storage();
    	  
        News.MainScreen.superclass.initComponent.call(this);

    	this.storage.addListener('data_loaded', this.reloadItems, this);

		this.loadInitialData();
    },

	reloadItems: function() {
		var results = this.storage.getData();

		console.log(results);

		for (var i = 0; i < results.length; i++) { 
			main.appendCard(results[i]);
      	}
      	
      	// set active card
      	
      	if (results.length > 0) {
			main.doLayout();
      	}
      	 
      	return true; 
	},

	appendCard: function(row) {
		this.add(this.getCard(row));
	},

	prependCard: function(row) {
		this.insert(0, this.getCard(row));
	},

	appendData: function(results) {
		console.log(results);

		for (var i = 0; i < results.rows.length; i++) { 
			var row = results.rows.item(i);
			main.appendCard(row);
      	}
      	
      	if (results.rows.length > 0) {
			main.doLayout();
      	}
      	 
      	return true; 
    },
    
	prependDataHandler: function(transaction, results) {
      	return true; 
    },

	loadInitialData: function() {
		this.storage.getInitialRecords();
		//this.appendCard(1); // probable page with error message - if no data available at all
	}, 

	loadPrevData: function(currentRecordId) {
		this.storage.getPrevRecords(currentRecordId);
	}, 
	
	loadNextData: function(currentRecordId) {
		this.storage.getNextRecords(currentRecordId);
	}
	
});

