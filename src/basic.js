var nodes = []
var svg = null;



function make (element, attr, parent) {
    let svgNS = "http://www.w3.org/2000/svg";
    let svg_element = document.createElementNS(svgNS, element);
    for (let i in attr) svg_element.setAttributeNS(null, i, attr[i]);
    if (parent) parent.appendChild(svg_element)
    return svg_element;
};


function Nnode (name) {
    this.name = name;
    this.elements = [];

    this.addElement = function () {
            
    }
}



class Node {
    constructor (svg, body, text) {
        this.w = svg.getAttributeNS(null, "width")
        this.h = svg.getAttributeNS(null, "height")
    
        this.layer0 = document.getElementById("layer0") ||  make('g', {id: "layer0"}, svg)
        this.layer1 = document.getElementById("layer1") ||  make('g', {id: "layer1"}, svg)
        this.layer2 = document.getElementById("layer2") ||  make('g', {id: "layer2"}, svg)
        
        let body_prop = {
            x: 150, y:50,
            width: 50, height: 50,
            fill: "blue", stroke:"#000", 
            id:"rect"+text, 
            type: "box"}
        
        this.body = make('rect', body_prop, this.layer1)
        this.input_ports = []
        
        
        let input_prop = {
            x: 150, y:50,
            width: 50, height: 50
        }
        
        this.inp = make("foreignObject", input_prop, this.layer1)
       
        var tinp = document.createElement("button")
        tinp.style = "width:80px; margin:3px; height: 30px;"
        //tinp.setAttribute("width", "400")
        //tinp.setAttribute("height", "50")
             
        tinp.onclick = function () {
            console.log("i")
        }
        this.inp.appendChild(tinp)
        
        
        let out_port_prop = {
            cx: body_prop.x + body_prop.width, 
            cy: body_prop.y + body_prop.height, 
            r: 10,
            fill: "#0c0", 
            stroke: "black", 
            type: "port" 
        }
        
        this.output_port = make('circle', out_port_prop, this.layer2)
        
        var output_wire = make('line', {
            x1: body_prop.x + body_prop.width,
            y1: body_prop.y + body_prop.height,
            x2: body_prop.x + body_prop.width,
            y2: body_prop.y + body_prop.height,
            fill: "none",
            stroke: "black",
            "stroke-width": 3,
            type: "wire"
        })


        var CTM = svg.getScreenCTM()
        
        function mouse_pos(evt) {
            var x = (evt.clientX - CTM.e) / CTM.a
            var y = (evt.clientY - CTM.f) / CTM.d
            return {x: x, y:y }
        }
        
        var prev_mouse = null;
        
        function mouse_down_listener(obj) {
            return function (event) {
                document.addEventListener("mousemove", move.bind(obj), true)
            }
        }
        
        this.body.addEventListener("mousedown",  mouse_down_listener (this.body))
        this.output_port.addEventListener("mousedown",  mouse_down_listener (this.output_port))
        
        function move (event) {            
            //console.log(event)
        }

        
    
    }
    
}   


var Diagram = function (bounding_div) {
    var bound_div = document.getElementById(bounding_div);
    var toolbox_div = document.createElement("div");
    var t_attrs = {id: "toolbox", 
                   style:"float:left; border:1px solid red; width:100px; height:600px;",
                   innerHTML: "Toolbox"}
    for (a in t_attrs) toolbox_div.setAttribute(a, t_attrs[a])
    
    var diagram_div = document.createElement("div");
    var d_attrs = {id: "diagram", 
                   style:"float:left; border:1px solid black; width:450px; height:600px;",
                   innerHTML: "Diagram"}
    for (a in d_attrs) diagram_div.setAttribute(a, d_attrs[a])
    
    bound_div.appendChild(toolbox_div)
    bound_div.appendChild(diagram_div)

    
    var svg = make("svg", {viewBox: "0 0 500 500"});
    
    diagram_div.appendChild(svg)
    
    var CTM = svg.getScreenCTM()
    
    function mouse_pos(evt) {
        var x = (evt.clientX - CTM.e) / CTM.a
        var y = (evt.clientY - CTM.f) / CTM.d
        return {x: x, y:y }
    }

        
    return {
        make:make,
        svg: svg,
        toolbox: toolbox_div,
        mouse_pos: mouse_pos,
    }
}


window.onload = function () {
    var dia = Diagram("div1")
    d = dia
    var layer0 = make('g', {id:"layer0"}, dia.svg);
    var layer1 = make('g', {id:"layer0"}, dia.svg);
    var layer2 = make('g', {id:"layer0"}, dia.svg);
    
    n = new Node(dia.svg)
    
    
    // fill toolbox
    for (var i=0; i < 10; i++) {
        var btn = document.createElement("button")
        btn.num = i
        btn.id = `box${i}`
        btn.style = "width:80px; margin:3px;"
        btn.innerHTML = `box${i}`
        btn.onclick = function(event) {
            console.log(`clicked button ${this.num}`);
            var node = add_box("ABCDEFGHIJKLM"[this.num])
            nodes.push(node)            
        }
        dia.toolbox.appendChild(btn)
    }
    
        
    function add_box(text) {
        var rect = dia.make('rect', {
            x: 50, y:50,
            width: 50, height: 50, 
            fill: "white", stroke:"#000", 
            id:"rect"+text, 
            type: "box"})
                            
        layer1.appendChild(rect);

        var selectedElement = null
        var drop_target = null
        
        function get(svg_element, prop) { 
            if (["type"].includes(prop)) {
                return svg_element.getAttributeNS(null, prop)
            } else 
                return svg_element[prop].baseVal.value 
        }
        
        function set(svg_element, prop, new_value) { 
            svg_element.setAttributeNS(null, prop, new_value)
        }
        
        
        var x = get(rect, "x")
        var w = get(rect, "width")
        var y = get(rect, "y")
        var h = get(rect, "height")
        
        var output_wire = dia.make('line', {
            x1: x + w/2,
            y1: y + h/2,
            x2: x + w,
            y2: y + h/2,
            fill: "none",
            stroke: "black",
            "stroke-width": 3,
            type: "wire"
        })

        layer0.appendChild(output_wire)

        var port = dia.make('circle', {
            cx: x + w, 
            cy: y + h/2, 
            r: 10,
            fill: "#c00", 
            stroke: "black", 
            type: "port" })
        
        layer2.appendChild(port);
        
        port.wire = output_wire;
        port.source_rect = rect;
        rect.output_wire = output_wire;
        output_wire.port = port
        var prev_mouse = null
        
        function mouse_down_listener(obj) {
            return function (event) {
                selectedElement = event.target
                document.addEventListener("mousemove", move.bind(obj), true)
                var coord =  dia.mouse_pos(event)
                prev_mouse = coord
                let [ex, ey] = get_pos(selectedElement)
                selectedElement.offsetX =  coord.x - ex;
                selectedElement.offsetY =  coord.y - ey;
            }
        }
        
        rect.addEventListener("mousedown",  mouse_down_listener (rect))
        port.addEventListener("mousedown",  mouse_down_listener (port))

        function move_to(element, x, y) {
            var moves = {
                'port': function (element, x, y) {
                    set(element, "cx", x )
                    set(element, "cy", y )
                    
                    
                    element.wire.setAttributeNS(null, "x2", x)
                    element.wire.setAttributeNS(null, "y2", y)
                    
                    if (selectedElement != element) return;
                    for (let n of nodes) {
                        //console.log(n)
                        let [xn, yn] = get_pos(n)
                        let [wn, hn] =  [get(n, "width"), get(n, "height")]
                        //console.log(x, y, xn, yn, wn, hn)
                        if ((x > xn) && (x < (xn + wn)) && (y > yn) && (y < (yn + hn))) {
                            n.flag = "+";
                            drop_target = n
                            set(n, "fill", "#f05")
                            
                        } else {
                            if (n.flag === '+') {
                                n.setAttributeNS(null, "fill", "white");
                                n.flag = null;
                                drop_target = null;
                            }
                        }
                    }
                    
                    },
                'box': function (e, x, y) { 
                    set(e, "x", x )
                    set(e, "y", y )
                    set(e.output_wire, "x1", x + w/2)
                    set(e.output_wire, "y1", y + h/2)
                    
                },
                'wire': function(element, x, y) {   
                    var type = selectedElement.getAttributeNS(null, "type")
                    if (type === 'box') {
                        element.setAttributeNS(null, "x1", x )
                        element.setAttributeNS(null, "y1", y )
                    } else if (type === 'port') {
                        element.setAttributeNS(null, "x2", x)
                        element.setAttributeNS(null, "y2", y)
                    }
                },
                text: function (element, x, y) {
                    set(element, "x", x )
                    set(element, "y", y )
                }
            }
            //console.log(element.getAttributeNS(null, "type"))    
            moves[get(element,"type")](element, x, y)
        }
        
        function get_pos(element) {
            return {
                port: function (e) { return [get(e, "cx"), get(e, "cy")] },
                box : function (e) { return [get(e, "x"),  get(e, "y")] }, 
                text: function (e) { return [parseFloat(e.getAttributeNS(null, "x")), 
                                             parseFloat(e.getAttributeNS(null, "y"))] }, 
            } [get(element, "type")](element)
        }
        
        
        
        function move (event) {            
            if (selectedElement) {
                event.preventDefault()
                var coord = dia.mouse_pos(event)
                var dx = coord.x - prev_mouse.x;
                var dy = coord.y - prev_mouse.y;
                prev_mouse = coord;
                for (let e of [].concat(selectedElement, selectedElement.connected_elements)) {
                    let [x,y] = get_pos(e)
                    move_to(e, x + dx, y + dy)
                    }
                }
            }
        
        
        
        rect.addEventListener("mouseup", function () {
            console.log("rect up")
            selectedElement = null;
            document.removeEventListener("mousemove", move, true);
        })
        
        
        function arrayRemove(arr, value) {
           return arr.filter(function(ele){
               return ele != value;
            });
        }

        port.addEventListener("mouseup",function (event) {
            console.log("port up")
            if (drop_target) {
                //port.setAttributeNS(null, "fill", "white")
                
                port.connected = true
                port.connected_to = drop_target
                if (!(drop_target.connected_elements.includes(port))) {
                    drop_target.connected_elements.push(port);
                    port.source_rect.connected_elements = arrayRemove( port.source_rect.connected_elements, port )
                }
                drop_target = null
            }
            port.source_rect.connected_elements = arrayRemove( port.source_rect.connected_elements, port )
            selectedElement = null;
            document.removeEventListener("mousemove", move, true);
        
        })
        
        rect.addEventListener("mouseleave",  function () { 
            this.setAttributeNS(null, "stroke-width", "1")
            this.setAttributeNS(null, "fill", "white")
        })
        
        
        
        rect.addEventListener("mouseover", function(event) {
            this.setAttributeNS(null, "stroke-width", 2);  
        })
        
        
        port.addEventListener("mouseover", function() {
             this.setAttributeNS(null, "fill", "#f00");  
        })
        
        port.addEventListener("mouseleave",  function () {
            if (this.connected) {
                set(this, "fill", "gray")
            } else {
                this.setAttributeNS(null, "fill", "#c00")
            }
        })
        
        var t = dia.make('text', {x: 50 + 15, y:50 +35, "font-size":25,
                     "pointer-events": "none", type: "text", 
                      style:'-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;'})
        t.innerHTML = text
 
        rect.connected_elements = [t, port];
        port.connected_elements = [];
        output_wire.connected_elements = [port];
        layer1.appendChild(t)
        //svg.appendChild(g);        
        
        rect.get_pos = get_pos
        return rect;
    }
    
    var rect = add_box("Z")
    nodes.push(rect)
    
    window.nodes = nodes
}

