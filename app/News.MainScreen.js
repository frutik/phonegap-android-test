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
				this.loadNextData(newCard.id);
    	    } else if (index == 0) {
				console.log('first card');
				this.loadPrevData(newCard.id);
    	    }
        }
    },

	getCard: function(node) {
		return new Ext.Panel({
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
        this.indicator = false;
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
		document.addEventListener("menubutton", this.onMenuKeyDown, false);

		this.loadInitialData();
    },

	onMenuKeyDown: function() {
   		var menu = document.getElementById("menu");
        if (menu.style.display == "none" || menu.style.display == "") {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }	
	},

	reloadItems: function() {
		var results = this.storage.getData();

		console.log('====== RELOAD ITEMS ========');

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

	prependDataHandler: function(transaction, results) {
      	return true; 
    },
    
    resetStorage: function() {
    	this.storage.reset();
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

