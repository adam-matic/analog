LinePlot = draw2d.shape.diagram.Sparkline.extend({
    NAME : "LinePlot",
    init : function(attr) {
        this._super(attr);
        this.maxValues = 100;
        this.setBackgroundColor("#FF765E");
        this.setRadius(5);
        this.createPort("input");
        this.startTimer(100);
        this.setDimension(250, 50);
    },
    
    setData:function( data) {
        this._super(data);
        this.min = 0;
        this.max = 100;
        this.cache= {};
        this.repaint();
    },
    
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
    
    var maindiv = document.getElementById("maindiv");
    
    var toolbox_div = document.createElement("div");
    var t_attrs = {id: "toolbox", 
                   style:"float:left; border:1px solid red; width:100px; height:600px;",
                   innerHTML: "Toolbox"}
    for (a in t_attrs) toolbox_div.setAttribute(a, t_attrs[a])
    var diagram_div = document.createElement("div");
    var d_attrs = {id: "diagram", 
                   style:"float:left; border:1px solid black; width:600px; height:600px;",
                   innerHTML: "Diagram"}
    for (a in d_attrs) diagram_div.setAttribute(a, d_attrs[a])
    
    maindiv.appendChild(toolbox_div)
    maindiv.appendChild(diagram_div)

    
    
    
    var canvas = new draw2d.Canvas("diagram", 600, 600)
    
    var program_graph = {
        "dt" : 0.01,
        "total_time": 10        
    };
    
    
    var elements = {
        "const" : function (x, y, v=0) {
            var b = new draw2d.shape.basic.Rectangle({x:x, y:y});
            b.createPort("output")
            b.cre
            b.installEditPolicy(new draw2d.policy.figure.GlowSelectionFeedbackPolicy());
            return b
          },
        
        "summer": function (x, y) {
            var box = new draw2d.shape.node.Start({x:x, y:y});
            box.installEditPolicy(new draw2d.policy.figure.GlowSelectionFeedbackPolicy());
            return box
          }
    }
    
    
    Object.keys(elements).forEach(function (e, i) {
        var btn = document.createElement("button")
        btn.num = i
        btn.element = e
        btn.id = `box${i}`
        btn.style = "width:80px; margin:3px;"
        btn.innerHTML = e
        btn.onclick = function(event) {
            var node = 
            canvas.add(elements[e] () )
        }
        toolbox_div.appendChild(btn)
    })
    
    
    
    
    var testData = [];
    for(var i=0;i<100;i++) {
       testData.push(Math.floor(Math.random() * 100));
    }


}