var nodes = []
var svg = null;
window.onload = function () {
    console.log("loaded!!")

    var el = function(id) {
        return document.getElementById(id)
    };
    
    var toolbox = el("toolbox")
    var diagram = el("diagram")
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null, "viewBox", "0 0 500 500");
    var svgNS = svg.namespaceURI;
    diagram.appendChild(svg)
    
    var layer0 = document.createElementNS(svgNS,'g');
    var layer1 = document.createElementNS(svgNS,'g');
    var layer2 = document.createElementNS(svgNS,'g');
    svg.appendChild(layer0)
    svg.appendChild(layer1)
    svg.appendChild(layer2)
    
    
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
        toolbox.appendChild(btn)
    }
    
    
    function getMousePos(evt) {
        var CTM = svg.getScreenCTM()
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        }
    }
    
   
    
    function add_box(text) {
        
        
        var rect = document.createElementNS(svgNS,'rect');
        var attrs = {
            "x": 50, 
            "y":50,
            "width":50,
            "height":50,
            "fill": "white",
            "stroke":"#000", 
            id:"rect"+text, 
            type: "box",
            position: "absolute",
            "z-index":5 }
        for (let k in attrs) rect.setAttributeNS(null, k, attrs[k]);
        layer1.appendChild(rect);

        var selectedElement = null
        var drop_target = null
        
        var x = parseFloat(rect.getAttributeNS(null, "x"))
        var w = parseFloat(rect.getAttributeNS(null, "width"))
        var y = parseFloat(rect.getAttributeNS(null, "y"))
        var h = parseFloat(rect.getAttributeNS(null, "height"))
        
        var output_wire = document.createElementNS(svgNS, 'line')
        var wire_attrs = {
            x1: x + w/2,
            y1: y + h/2,
            x2: x + w,
            y2: y + h/2,
            fill: "none",
            stroke: "black",
            "stroke-width": 3,
            
            "z-index":0,
            type: "wire"
        }

        for (let k in wire_attrs) output_wire.setAttributeNS(null, k, wire_attrs[k]);
        layer0.appendChild(output_wire)

        var port = document.createElementNS(svgNS, 'circle')
        var cattrs = {
            cx: x + w, 
            cy: y + h/2, 
            r: 10,
            position: "absolute",
            fill: "#c00", 
            stroke: "black", 
            "z-index": "1000",
            type: "port" }
        
        for (let k in cattrs) port.setAttributeNS(null, k, cattrs[k]);
        layer2.appendChild(port);
        
        port.wire = output_wire;
        rect.output_wire = output_wire;
        
        rect.addEventListener("mousedown",  function (event) {
            document.addEventListener("mousemove", move.bind(rect), true)
            selectedElement = event.target
            var coord = getMousePos(event)
            for (let e of this.connected_elements.concat(selectedElement)) {
                let [ex, ey] = get_pos(e)
                e.offsetX =  coord.x - ex;
                e.offsetY =  coord.y - ey;
            }
        })
        
        port.addEventListener("mousedown",  function (event) {
            selectedElement = event.target
            document.addEventListener("mousemove", move.bind(port), true)
            var coord = getMousePos(event)
            selectedElement.offsetX =  coord.x - parseFloat(selectedElement.getAttributeNS(null, "cx"));
            selectedElement.offsetY =  coord.y - parseFloat(selectedElement.getAttributeNS(null, "cy"));
            for (let e of this.connected_elements.concat(selectedElement)) {
                let [ex, ey] = get_pos(e)
                e.offsetX =  coord.x - ex;
                e.offsetY =  coord.y - ey;
            }
        })


        function move_to(element, x, y) {
            var moves = {
                'port': function (element, x, y) {
                    element.setAttributeNS(null, "cx", x )
                    element.setAttributeNS(null, "cy", y )
                    
                    for (let n of nodes) {
                        let [xn,yn] = get_pos(n)
                        let [wn, hn] =  [parseFloat(n.getAttributeNS(null, "width")),
                                         parseFloat(n.getAttributeNS(null, "height"))]
                        //console.log(x, y, xn, yn, wn, hn)
                        if ((x > xn) && (x < (xn + wn)) && (y > yn) && (y < (yn + hn))) {
                            n.flag = "+";
                            drop_target = n
                            n.setAttributeNS(null, "fill", "#f05")
                            
                        } else {
                            if (n.flag === '+') {
                                n.setAttributeNS(null, "fill", "white");
                                n.flag = null;
                                drop_target = null;
                            }
                        }
        
                    }
                    
                    },
                'box': function (element, x, y) {
                    element.setAttributeNS(null, "x", x )
                    element.setAttributeNS(null, "y", y )
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
                    element.setAttributeNS(null, "x", x )
                    element.setAttributeNS(null, "y", y )
                }
            }
                
            moves[element.getAttributeNS(null, "type")](element, x, y)
        }
        
        function get_pos(element) {
            var coords = {
                'port': function (element) {
                    return [parseFloat(element.getAttributeNS(null, "cx")),
                            parseFloat(element.getAttributeNS(null, "cy"))]
                    },
                'box': function (element) {
                    return [parseFloat(element.getAttributeNS(null, "x")),
                            parseFloat(element.getAttributeNS(null, "y"))]
                    },
                'wire': function (element) {
                    var type = selectedElement.getAttributeNS(null, "type")
                    if (type === "box") {
                          return [parseFloat(element.getAttributeNS(null, "x1")),
                                  parseFloat(element.getAttributeNS(null, "y1"))]
                    } else if (type === 'port') {
                          return [parseFloat(element.getAttributeNS(null, "x2")),
                                  parseFloat(element.getAttributeNS(null, "y2"))]
                        
                    } else {console.log("agahahah"); return [0,0]}
                }
                
                }
            coords.text = coords.box
            return coords[element.getAttributeNS(null, "type")](element)
        }
        
        
        
        function move (event) {            
            if (selectedElement) {
                event.preventDefault()
                var coord = getMousePos(event)
                for (let e of [].concat(selectedElement, selectedElement.connected_elements)) {
                    move_to(e, coord.x - e.offsetX, coord.y - e.offsetY)
                    }
                }
            }
        
        
        
        rect.addEventListener("mouseup", function () {
            console.log("rect up")
            selectedElement = null;
            document.removeEventListener("mousemove", move, true);
        })
        
        port.addEventListener("mouseup",function (event) {
            console.log("port up")
            if (drop_target) {
                port.setAttributeNS(null, "fill", "white")
                drop_target.connected_elements.push(port)
                drop_target = null
            }
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
            this.setAttributeNS(null, "fill", "#c00")
        })
        
        var t = document.createElementNS(svgNS, 'text')
        
        var tattrs = {"x": 50 + 15, "y":50 +35, "font-size":25,
                     "pointer-events": "none", 'type': "text"}
        
        for (let k in tattrs) t.setAttributeNS(null, k, tattrs[k]);
    
        t.innerHTML = text
        t.setAttribute('style', '-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;');
 
        rect.connected_elements = [t, output_wire];
        port.connected_elements = [output_wire];
        output_wire.connected_elements = []
        layer1.appendChild(t)
        //svg.appendChild(g);        
        
        rect.get_pos = get_pos
        return rect;
    }
    
    var rect = add_box("Z")
    nodes.push(rect)
    
    window.nodes = nodes
}

