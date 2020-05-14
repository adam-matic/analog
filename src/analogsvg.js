
class ContextMenu {
    constructor (e, params, update_params) {
        let target_node = e.target

        if (target_node.context_opened) return;
    
        target_node.context_opened = true
        this.params = params
        e.preventDefault();
             
        let pdiv = document.getElementById("diagram");
        let c = document.createElement("div");

        c.style.background = "#ddd"
        c.style.border = "1px solid black";
        c.style.height="100px"; 
        c.style.width="200px"; 
        c.style.position = "absolute";
        c.style.left=`${e.clientX}px`;
        c.style.top=`${e.clientY}px`;
        

        for (let p in params) {
            let name = document.createElement("p");
            name.innerHTML = p + " = ";
            name.style.display = "inline-block"
            let b = document.createElement("input");
            b.setAttribute("type", "number")
            b.setAttribute("value", params[p])
            b.onkeyup = (k) => {
                params[p] = b.valueAsNumber
                update_params()
                if (k.key=="Enter") button.click()
            }
            b.onchange = () => { b.onkeyup({key:''}) }
            c.appendChild(name)
            c.appendChild(b);   
        }

        let button = document.createElement("button");
        button.innerHTML = "close"; 
        button.style.display = "inner-block"    
        button.addEventListener("click", (e) => {            
            pdiv.removeChild(c)
            target_node.context_opened = false;
        })
        
        c.appendChild(button)
        pdiv.appendChild(c);      
    }
}

class Wire {
    constructor(draw, parent_node) {
        this.parent_node = parent_node;
        
        this.port = draw.circle()
            .size(10, 10)
            .draggable( );

        this.port.wire = this;

        this.draw_port_home = () => {
            var px = this.parent_node.r.cx()+30;
            var py = this.parent_node.r.cy();
            this.port.cx(px).cy(py);
        }
       
        draw.layer2.add(this.port)
        this.draw_port_home()


        this.port.on("dragstart", e => {
            draw.layer0.add(this.port)
            draw.portmove = true;
            draw.moved_port = this.port;
        })

        this.port.on("dragmove", e => this.move_a(e, true))

        this.port.on("mouseover", e => this.port.fill("#d00"))
        this.port.on("mouseout", e => this.port.fill("#000"))

        this.port.on("dragend", (e) => {
            if (this.parent_node.connected == false) {
                this.draw_port_home()
                this.move_a(e, true)
            } 
            draw.layer2.add(this.port)
            draw.portmove = false;
            draw.moved_port = null;
        });

        this.wire_line = draw.line(this.parent_node.r.cx(), this.parent_node.r.cy(), this.port.cx(), this.port.cy())
        this.wire_line.stroke({width:3, color:"#888"})
        draw.layer0.add(this.wire_line)
    }

    move_a(e, portmove) {
        if (this.parent_node.connected || portmove) {
            this.wire_line.plot(this.parent_node.r.cx(), this.parent_node.r.cy(), this.port.cx(), this.port.cy())
        } else {
            let dx = e.detail.event.movementX;
            let dy = e.detail.event.movementY;
            this.wire_line.dmove(dx, dy)
            this.port.dmove(dx, dy)
        }
    }
}


class Node {
    constructor(draw, [x, y]=[0, 0]) {
        this.g = draw.group()
        
        this.r = draw.rect()
            .stroke({color:"#000", width:2})
            .size(50, 50)
            .move(x, y)
            .fill("#555")
            .radius(5)
        
        this.t = draw.text("node")
            .fill("#fff")
            .move(x+5, y+1)        
        

        this.params = {
            v : 0
        }

        let num = this.params.v.toFixed(2)
        this.v = draw.text(num)
                .fill("#aaa")
                .x(x+10).y(y+20);


        this.t.node.style.pointerEvents =  "none"
        this.v.node.style.pointerEvents =  "none"
                
        this.g.add(this.r).add(this.t).add(this.v).draggable()
        
        draw.layer1.add(this.g)
        draw.layer2.add(this.p)
              
        
       let update_params = () => {
            let num = this.params.v.toFixed(2)
            this.v.node.firstChild.innerHTML = num
        }

        this.g.on("contextmenu", (e) => {
            new ContextMenu(e, this.params, update_params)            
        })
        
        this.w = new Wire(draw, this)

        this.input_connections = []
        this.connected = false

        this.g.on("dragmove", (e) => {
            this.w.move_a(e);
            for (let n of this.input_connections) {
                let dx = e.detail.event.movementX;
                let dy = e.detail.event.movementY;
                n.w.port.dmove(dx, dy)
                n.w.move_a(e)
            }
        })
    
        this.g.on("mouseover", (e) => {            
            if (draw.portmove)
                this.r.fill("#f55")            
        })

        this.g.on("mouseout", (e) => {         
            this.r.fill("#555")
        })


        this.r.parentNode = this
   
        draw.graph.nodes.push(this)
    }
}






window.onload = function() {
    
        
    var w = 450, h = 600
    
    var toolbox_div = document.createElement("div");
    var t_attrs = {id: "toolbox", style:"float:left; border:1px solid red; width:100px; height:600px;"}
    for (a in t_attrs) toolbox_div.setAttribute(a, t_attrs[a])
    
    var diagram_div = document.createElement("div");
    var d_attrs = {id: "diagram", style:"float:left; border:1px solid black; width:450px; height:600px;"}
    for (a in d_attrs) diagram_div.setAttribute(a, d_attrs[a])
    
    var div1 = document.getElementById("div1")
    
    div1.appendChild(toolbox_div)
    div1.appendChild(diagram_div)

    var graph_text = document.createTextNode("nada")
    div1.appendChild(graph_text)
    
    graph_text.textContent = "ddd"
    
    //var node_names = ["const", "add", "plot"]
    
    var nodes = {
        const : Node,
        add   : Node,
        plot  : Node
    }
    
    for (let a in nodes) {
        let btn = document.createElement("button")
        btn.style = "width:80px; margin:8px;"
        btn.innerHTML = a
        btn.onclick = function(event) {
            var node = new nodes[a](draw)
        }
        toolbox_div.appendChild(btn)
    }

    var draw = SVG()
        .addTo('#diagram')
        .viewbox(0, 0, w, h)
    
    draw.layer0 = draw.group()
    draw.layer1 = draw.group()
    draw.layer2 = draw.group()
    draw.layer3 = draw.group()
    

    draw.on("mouseup", e => {
        if (!draw.portmove) return;
    
        if (e.target.instance.type=="rect")  { 
            let n = draw.moved_port.wire.parent_node;
            let t = e.target.instance.parentNode
            console.log(t)
            if (t == n) {
                if (n.connected) n.connected_to.input_connections = n.connected_to.input_connections.filter(v => v != n)
                n.connected = false;
                n.connected_to = null;                    
            } else if (t.input_connections.includes(n)) {
                // pass
            } else if (n.connected && n.connected_to != t) {
                n.connected_to.input_connections = n.connected_to.input_connections.filter(v => v != n)
                n.connected_to = t;
                t.input_connections.push(n)
            } else {
                n.connected = true;
                n.connected_to = t;
                t.input_connections.push(n)
            }
        } else  {
            let a = draw.moved_port.wire.parent_node
            if (a.connected) {
                let b = a.connected_to
                b.input_connections = b.input_connections.filter( v => v != a )
                a.connected_to = null;
                a.connected = false;
                a.w.draw_port_home()
            }
        }
    })

    draw.graph = {
        nodes:[], 
        edges:[]
    };

    let dt = 0.01;
    let total_time = 10; 

    //var timeNode = new TimeNode(diagram_div, draw.graph, dt, total_time)

    var nn = new Node(draw, [100, 100]);
    var n2 = new Node(draw, [100, 200]);
    //var n2 = new AddNode(draw, [100, 200]);
    //var n3 = new Node(draw).move(100, 300)

    window.draw = draw

}

