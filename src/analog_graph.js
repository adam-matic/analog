window.onload = function() {

    
    function ConstantNumber() {
        this.addOutput("value", "number");
        this.addProperty("value", 1.0);
        this.widget = this.addWidget(
            "number",
            "value",
            1,
            "value"
        );
        this.widgets_up = true;
        this.size = [180, 30];
    }
    ConstantNumber.title = "Const";
    ConstantNumber.desc = "Constant number";
    ConstantNumber.prototype.onExecute = function() {
        this.setOutputData(0, parseFloat(this.properties["value"]));
    };
    ConstantNumber.prototype.getTitle = function() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    };
    ConstantNumber.prototype.onDrawBackground = function(ctx) {
        this.outputs[0].label = this.properties["value"].toFixed(3);
    };
    LiteGraph.registerNodeType("analog/const", ConstantNumber);
    
    function ConstantNumber() {
        this.addOutput("value", "number");
        this.addProperty("value", 1.0);
        this.widget = this.addWidget(
            "number",
            "value",
            1,
            "value"
        );
        this.widgets_up = true;
        this.size = [150, 30];
    }

    ConstantNumber.title = "Const";
    ConstantNumber.desc = "Constant number";

    ConstantNumber.prototype.onExecute = function() {
        this.setOutputData(0, parseFloat(this.properties["value"]));
    };

    ConstantNumber.prototype.getTitle = function() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    };

    ConstantNumber.prototype.onDrawBackground = function(ctx) {
        //show the current value
        this.outputs[0].label = this.properties["value"].toFixed(3);
    };

    
    
    // =================== Summer ======================
    
    
    function Summer() {
        this.title = "Summer"
        this.addInput("In1", "number");
        this.addOutput("=", "number");
        this.addProperty("In1", 1);
        this.desc = "Summing numbers"
        this.next_input = 2
        var sum = this
        this.btn = this.addWidget("button", "add", "",
            function (v) {
                
                sum.addInput("In" + sum.next_input, "number")
                sum.addProperty("In" + sum.next_input, 1);
                sum.next_input += 1;
                
        })
        

        this.size = [120, 40];
    }

    Summer.prototype.getTitle = function() {
        return this.title;
    };

    Summer.prototype.setValue = function(v) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["value"] = v;
    };

    Summer.prototype.onExecute = function() {
        var A = this.getInputData(0);
        this.setOutputData(0, result);
    };

 
    LiteGraph.registerNodeType("analog/summer", Summer);

    
    function Toolbox() {
        
      var tool = this;
      this.onMouseDown = function () { tool.clicked = true  }
      this.onMouseUp   = function () { tool.clicked = false }
        
      this.addWidget("button", "Const", "", function() {
          if (!tool.clicked) {
            var node_const = LiteGraph.createNode("analog/const");
            node_const.pos = [200,200];
            graph.add(node_const);
          }    
      });
    
      this.addWidget("button", "Summer", "", function() {
          if (!tool.clicked) {
            var node = LiteGraph.createNode("analog/summer");
            //node.pos = [200,200];
            graph.add(node);
          }    
      });
        
        
    }
    LiteGraph.registerNodeType("basic/Toolbox", Toolbox );

    var graph = new LGraph();
    var canvas = new LGraphCanvas("#mycanvas", graph);

    var toolbox = LiteGraph.createNode("basic/Toolbox");
    toolbox.pos = [200,200];
    graph.add(toolbox);

}