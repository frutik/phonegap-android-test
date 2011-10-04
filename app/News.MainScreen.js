Ext.ns('News');

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
		
		if (window.openDatabase) { 
          //alert('it works!'); 
        }


		this.loadInitialData();
    },

	loadInitialData: function() {
		this.add(this.getCard(1));
		this.add(this.getCard(2));
	}
	
});

