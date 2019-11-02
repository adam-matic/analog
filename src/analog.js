LinePlot = draw2d.shape.diagram.Sparkline.extend({
    NAME : "LinePlot",
    init : function(attr) {
        this._super(attr);
        this.maxValues = 100;
        this.setBackgroundColor("#FF765E");
        this.setRadius(5);
        this.createPort("input");
        this.startTimer(100);
        this.setDimension(250,50);
    },
    
    setData:function( data) {
        this._super(data);
        this.min = 0;
        this.max = 100;
        this.cache= {};
        this.repaint();
    },
    
    /**
     * @method
     * 
     * Update the chart with the current value of the input port.
     * 
     */
    OldOnTimer:function() {
         var port = this.getInputPort(0);
         var value=port.getValue();
         this.data.push(value===null?0:value);
         if(this.data.length>this.maxValues)
             this.data.shift();
         this.setData(this.data);
    }

});

window.onload = function () {
    
    var canvas = new draw2d.Canvas("diagram", 600, 600)
    var opamp = new draw2d.shape.analog.OpAmp()
    
    var testData = [];
    for(var i=0;i<100;i++) {
       testData.push(Math.floor(Math.random() * 100));
    }
    var plot1 = new LinePlot({width:200, height:80});
    plot1.setData(testData);
    canvas.add( plot1 ,100, 60);
    canvas.add(opamp, 150, 150)

    var sine = new draw2d.shape.node.Start({x:50, y:250});
    canvas.add(sine)
    
    textFigure = new draw2d.shape.basic.Text({
        text:"I am label",
        fontFamily:"Curier New",
        fontSize: 14,
        x:10, y:10
    });
    textFigure.createPort("output")
        
    textFigure.setDeleteable(false)
    
    canvas.add(textFigure);
}