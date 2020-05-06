class Wire {
    constructor() {
        
    }
}

class Node {
    constructor(draw, pos) {
        let [x, y] = pos || [0,0]
        
        this.g = draw.group()
        
        this.r = draw.rect()
            .size(50, 50)
            .move(x, y)
            .fill("#555")
            .radius(5)
        
        this.p = draw.circle()
            .size(20, 20)
            .move(x+40, y+15)
            .draggable();
        
        this.t = draw.text("const")
            .fill("#fff")
            .move(x+5, y+1)
        
        this.v = draw.text("0.0").fill("#aaa").move(x+10, y + 20)
        
        
        this.g.add(this.r)
              .add(this.p)
              .add(this.t)
              .add(this.v)
              .draggable()
        
        
        this.g.on("dragmove", (e) => {            
            console.log("dragging node", this)
        })
        
        this.g.on("contextmenu", (e) => {
            
            e.preventDefault();
            
            
            let pdiv = draw.node.parentElement;
            let c = document.createElement("div");
            c.style.border = "1px solid black";
            //c.style.x = "10"; c.style.y = "50";
            c.style.height="100px"; 
            c.style.width="200px"; 
            c.style.position = "absolute";
            c.style.left=`${e.clientX}px`;
            c.style.top=`${e.clientY}px`;
            
            let b = document.createElement("button");
            b.innerHTML = "close";
            //b.style.position = "absolute";
            //b.style.left=`${e.clientX+20}px`;
            //b.style.top=`${e.clientY + 20}px`;
            
            b.addEventListener("click", (e) => {
                pdiv.removeChild(c)
            })
            
            c.appendChild(b)
            pdiv.appendChild(c);            
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
    
    var node_names = ["const", "add", "plot"]
    
    
    var nodes = {
        const : {
            value: 0,
            out_ports: 1,
            fill: "#fff",
            stroke: "#000"
            },
        add : {
            value: 0,
            out_ports: 1,
            text: "+"
            },
        plot: {
            value: 0,
            out_ports: 0
        }       
    }
    
    
    for (let a in nodes) {
        let btn = document.createElement("button")
        btn.style = "width:80px; margin:3px;"
        btn.innerHTML = a
        btn.onclick = function(event) {
            var node = new node_factory(nodes[a])
        }
        toolbox_div.appendChild(btn)
    }
        
    
    class node_factory {
        constructor (n) {
            this.n = n
            
            this.r1 = draw.rect(50,50,150,150)
                .draggable()
                .fill(n.fill || "#000")
                .stroke(n.stroke || "#fff")
            
            console.log(r1.x())
            this.outport = draw.circle(20, 20, 50, 50).draggable()
            
            this.outport.on("dragmove", (e) => {            
                line.plot([port.startpos, [x(port), y(port)]]) 
            })        
        
        }
    }
    
    
    var draw = SVG()
        .addTo('#diagram')
        .viewbox(0, 0, w, h)
    
    var nn = new Node(draw).move(100, 100);
    var n2 = new Node(draw).move(100, 200);
    var n3 = new Node(draw).move(100, 300)



}

