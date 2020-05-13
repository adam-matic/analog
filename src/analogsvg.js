class Wire {
    constructor(draw, a, b) {
        this.a = a;

        this.p = draw.circle()
            .size(20, 20)
            .draggable( );

        this.p.wire = this;

        draw.layer2.add(this.p)


        this.draw_port_home = () => {
            this.connected = false;
            var px = this.a.cx()+30;
            var py = this.a.cy();
            this.b = this.p;
            this.p.cx(px).cy(py);
        }
       
        if (b === undefined) this.draw_port_home()

        this.p.on("dragmove", (e) => {
            draw.layer0.add(this.p)
            draw.portmove = true;
            draw.moved_port = this.p;
            this.move_a(e, true)
        })


        this.p.on("dragend", (e) => {
            if (this.connected == false) {
                this.draw_port_home()
                this.w.plot(this.a.cx(), this.a.cy(), this.b.cx(), this.b.cy())
            } 
            draw.layer2.add(this.p)
            draw.portmove = false;
            draw.moved_port = null;

        });

        this.w = draw.line(this.a.cx(), this.a.cy(), this.b.cx(), this.b.cy())
        this.w.stroke({width:3, color:"#888"})
        draw.layer0.add(this.w)
    }

    move_a(e, portmove) {
        if (this.connected || portmove) {
            this.w.plot(this.a.cx(), this.a.cy(), this.b.cx(), this.b.cy())
        } else {
            let dx = e.detail.event.movementX;
            let dy = e.detail.event.movementY;
            this.w.dmove(dx, dy)
            this.p.dmove(dx, dy)
        }
    }
}

class ContextMenu {
    constructor (e, params, update_params) {
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
        button.addEventListener("click", (e) => {            
            pdiv.removeChild(c)
        })
        
        c.appendChild(button)
        pdiv.appendChild(c);      
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
        
        this.g.add(this.r)
              .add(this.t)
              .add(this.v)
              .draggable()
        
        draw.layer1.add(this.g)
        draw.layer2.add(this.p)
              
        
       let update_params = () => {
            let num = this.params.v.toFixed(2)
            this.v.node.firstChild.innerHTML = num
        }

        this.g.on("contextmenu", (e) => {
            new ContextMenu(e, this.params, update_params)
            
        })
        
        this.w = new Wire(draw, this.r)

        this.input_connections = []

        this.g.on("dragmove", (e) => {
            this.w.move_a(e);

            for (let n of this.input_connections) {
                let dx = e.detail.event.movementX;
                let dy = e.detail.event.movementY;
                n.p.dmove(dx, dy)
                n.move_a(e)
            }
        })
    
        this.g.on("mouseover", (e) => {            
            if (draw.portmove)
                this.r.fill("#f55")
            
        })


        this.g.on("mouseout", (e) => {         
            this.r.fill("#555")
        })

        
        this.g.on("mouseup", (e) => {
            draw.was_on_g = true
            if (draw.portmove) {
                let b = draw.moved_port.wire;
                if (this.w == b || this.input_connections.includes(b)) {
                    this.w.draw_port_home()
                    this.w.connected = false
                    return;
                }
                b.connected = true;
                b.connected_to = this;
                this.input_connections.push(b)
            
                //e.preventDefault()
                //e.stopPropagation()
            }
        })
    
        return this.g;
    }
}




window.onload = function() {
    
        
    var w = 450, h = 600
    
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
    

    draw.on("mouseup", e=> {
        if (draw.was_on_g)  { 
            draw.was_on_g = false;
        } else if (draw.portmove) {
            let a = draw.moved_port.wire
            if (a.connected) {
                let b = a.connected_to
                b.input_connections = b.input_connections.filter( v => v != a )
                a.connected_to = null;
                a.connected = false;
                a.draw_port_home()
            }
        }
    })


    var nn = new Node(draw, [100, 100]);
    var n2 = new Node(draw, [100, 200]);
    //var n2 = new AddNode(draw, [100, 200]);
    //var n3 = new Node(draw).move(100, 300)

    window.draw = draw

}

