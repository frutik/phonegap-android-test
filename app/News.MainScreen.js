Ext.ns('News');

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
		News.Storage.getInitialRecords(this.appendDataHandler);
		//this.appendCard(1); // probable page with error message - if no data available at all
	}, 

	loadPrevData: function() {
		News.Storage.getPrevRecords(this.prependDataHandler, 0);
	}, 
	
	loadNextData: function() {
		News.Storage.getNextRecords(this.appendDataHandler);
	}
	
});

