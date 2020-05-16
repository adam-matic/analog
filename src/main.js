import Node from './nodes.js'
import Port from './port.js'

function main() {
    var w = 600, h = 600
    
    var toolbox_div = document.createElement("div");
    var t_attrs = {id: "toolbox", style:"float:left; border:1px solid red; width:100px; height:600px;"}
    for (let a in t_attrs) toolbox_div.setAttribute(a, t_attrs[a])
    
    var diagram_div = document.createElement("div");
    var d_attrs = {id: "diagram", style:"float:left; border:1px solid black; width:600px; height:600px;"}
    for (let a in d_attrs) diagram_div.setAttribute(a, d_attrs[a])
    
    var div1 = document.getElementById("div1")
    
    div1.appendChild(toolbox_div)
    div1.appendChild(diagram_div)

    var graph_text = document.createTextNode("nada")
    div1.appendChild(graph_text)
    
    graph_text.textContent = "ddd"
    
    
    const nodes = {
        generator_const : {
            title: "generator const", 
            no_inputs_allowed : true,
            params: {v: 0},
            width: 70 },

        generator_sin : {
            title: "sin",
            no_inputs_allowed : true,
            params: {a: 1, f:1},
            width: 70 },

        generator_pulse : {
            title: "pulse",
            no_inputs_allowed : true,
            widh: 70,
            params: { }},         

        generator_ramp : {
            title: "ramp",
            no_inputs_allowed : true,
            params: {} },         

        generator_random : {
            title: "random",
            no_inputs_allowed : true },
        
        sum : {
            title: "add",
            type: "in and out"
        },
        comparator : {
            title : "compare"
        },
        amplifier : {
            title: "amp"
        },
        integrator: {
            title: "integrator",
            width: 70
        },
        multiply: {
            title: "mult",
            width: 50
        },
        delay: {
            title: "delay",
            params: {t: 0}
        },
        limit: {
            title: "limit",
            params: {max: 1, min:-1}
        },





    }

    let add = {node_title: "add", symbol:"+"}

    for (let a in nodes) {
        let btn = document.createElement("button")
        btn.style = "width:80px; margin:8px;"
        btn.innerHTML = nodes[a].title
        btn.onclick = function(event) {
            var node = new Node(nodes[a])
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
    
    Node.prototype.draw = draw
    Port.prototype.draw = draw


    draw.on("mouseup", e => {
        if (!draw.portmove) return;
        let n = draw.moved_port.parent_node;
        if (e.target.instance.type=="rect")  { // port over node
            let t = e.target.instance.parent_node
            if (t.allow_connection_to(n)) {
                n.remove_previous_connection()
                n.connected = true;
                n.connected_to = t;
                t.input_connections.push(n)
                return;
            }
        }
        // port dropped over empty space or node did not allow connection
        n.remove_previous_connection()
        n.port.draw_home()

    })

    draw.graph = {
        nodes:[], 
        edges:[]
    };

    let time = {
        title: "time",
        no_inputs_allowed: true,
        no_outputs: true,
        params: { dt: 0.01, total: 10},
        width: 70 }




    let y0 = 20;
    window.nodes = []

    window.nodes.push(new Node(time, {x:20, y:y0}));
    y0 += 60 
    let x0 = 20
    for (let n in nodes) {
        window.nodes.push(new Node(nodes[n], {x:x0, y:y0}));
        y0 += 60
        if (y0 > h*0.68) {
            y0 = 20
            x0 = 100
        }
    }
    window.draw = draw

}

window.onload = main;