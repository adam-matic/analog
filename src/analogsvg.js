class Wire {
    constructor() {
        
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
                console.log(params)
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
        
        this.params = {
            v : 0
        }

        let num = this.params.v.toFixed(2)
        this.v = draw.text(num)
                .fill("#aaa")
                .x(x+10).y(y+20)
                
        
        this.g.add(this.r)
              .add(this.p)
              .add(this.t)
              .add(this.v)
              .draggable()
        
        
        //this.g.on("dragmove", (e) => {  //console.log("dragging node", this)   })
        
       let update_params = () => {
            let num = this.params.v.toFixed(2)
            this.v.node.firstChild.innerHTML = num
        }

        this.g.on("contextmenu", (e) => {
            new ContextMenu(e, this.params, update_params)
            
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
        const : Node,
        add : Node,
        plot: Node
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
    
    var nn = new Node(draw).move(100, 100);
    var n2 = new Node(draw).move(100, 200);
    var n3 = new Node(draw).move(100, 300)



}

