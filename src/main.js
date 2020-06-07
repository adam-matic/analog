import GuiNode from './gui_nodes.js'
import Port from './port.js'
import solver from './solver.js'
import OperationBlocks from './operation_blocks.js'


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

    var plot_div = document.createElement("div")
    var t_attrs = {id: "plot_div", style:"float:left; border:1px solid black; width:800px; height:300px;"}
    for (let a in t_attrs) plot_div.setAttribute(a, t_attrs[a])
    div1.appendChild(plot_div)

    
    graph_text.textContent = "ddd"
    
    window.nodes = []

    for (let a in OperationBlocks) {
        if (nodes[a].no_button) continue;
        let btn = document.createElement("button")
        btn.style = "width:80px; margin:8px;"
        btn.innerHTML = nodes[a].title
        btn.onclick = function(event) {
            var node = new GuiNode(nodes[a])
            window.nodes.push(node);
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
    
    GuiNode.prototype.draw = draw
    Port.prototype.draw = draw

    draw.graph = {
        nodes:[], 
        edges:[],
        output_names: []
    };


    draw.generate_name = () => {
        let start = 'a'.charCodeAt(0)
        let end = 'z'.charCodeAt(0)
        let names = draw.graph.output_names
        
        let name = [start];
        let str = (arr) => arr.map(x=>String.fromCharCode(x)).join('')
        while (names.indexOf(str(name)) != -1) {
            let last = name.length - 1
            name[last] = name[last] + 1
            if (name[last] > end) {
                name[last] = start;
                name = [start].concat(name)
            }
        }

        let name_string = str(name)
        
        names.push(name_string)
        return name_string;
    }
    


    let tnode = new GuiNode(nodes.time)
    window.nodes.push(tnode)

    window.draw = draw
    
    window.onkeypress = function (e) {
    
        if (e.key == "Enter") {
            let program_graph = {}

            for (let n of window.nodes) {
                if (n.title == "time") {
                    program_graph.time = new n.computation([], {dt:0.01, duration: 10})
                    break;
                } 
            }

            for (let n of window.nodes) {
                if (n.title == "time") continue;
                let inputs =  n.input_connections.map((x) => [x.port.params.weight, x.output_name]  )
                let params = n.params;
                let time = program_graph["time"].params
                program_graph[n.output_name] = new n.computation(inputs, params, time)            
            }

            for (let pn in program_graph) {
                if (program_graph[pn].inputs) { 
                    for (let inp of program_graph[pn].inputs) {
                        inp.push( program_graph[inp[1]])
                    }
                }
            }

            // this.console.log(program_graph)
            let results = solver ( program_graph)

            
            let data = [];
            for (let r in results) {
                if (r == "time") continue;
                let line = {
                    x : results.time,
                    y : results[r],
                    mode: 'lines',
                    name: r
                };
                data.push(line)
            }

            let layout = {
                title: "plot"
            }

            //this.console.log(results, data)

            Plotly.react("plot_div", data, layout)

            // this.console.log(results)
            // localStorage.setItem("mydata", JSON.stringify(program_graph));
        }
    }


}







window.onload = main2;


function load_program( filename ) {
    return new Promise((resolve, reject) => {
        var client = new XMLHttpRequest();
        client.open('GET', filename);
        client.onload = () => resolve(client.responseText);
        client.onerror = () => reject(client.statusText)
        client.send();  
    })
}


function main2() {
    load_program('programs/Fan and Duck 3b.txt')
    .then(t => make_graph(t));
}


function parse(text, store) {
    var lines = text.split(/\r?\n/)
    
    lines.forEach(x=> console.log(x))

    
    
    
    //console.log(nodes)
    // make function   register_to_parser, function name, number of inputs, parameter names types?? min max etc


    return {}
}

function make_graph(text_program) {
    
    const {createStore} = Redux;

    const store = createStore( reducer )

    function reducer (state = {}, action ) {
        switch (action.type) {
            case "addNode" : 
                console.log("Adding node")
                
                let n = action.node_props
                n.xy = n.xy || [0, 0]
                state[action.node_props.title] = {...action.node_props};
                return state
            default:
                console.log("type not recognized")
                console.log(action, state)
                return state
        }
        
    }
    
    store.subscribe ( () => console.log("any change of state")

    )

    const addTime = {type: "addNode", node_props : OperationBlocks.time }


    store.dispatch(addTime)

    store.dispatch({type: "what", node_props: "a"} )

    
    
    //var graph = parse(text_program, store)
    //console.log(graph)
}