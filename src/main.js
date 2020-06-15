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




function ParameterStore (param = {init, min, max}, listeners = []) {
        
    self = { 
        val : param.val  ||   0, 
        min : param.min  || -10,      
        max : param.max  ||  10,

        listeners : listeners
    }

    self.subscribe = ( listener ) => self.listeners.push( listener );
        
    self.set = ( new_val ) => {
        self.val = new_val > self.max ? self.max 
                 : new_val < self.min ? self.min
                 : new_val;
        
        self.listeners.forEach(f =>  f.update(self.val))
    }

    self.set (self.val)
    return self
  }




window.onload = main2;

const parastor = function () {

   

    
      let p = new ParameterStore({val:0, min:-10, max:102})
      

      let divs = []
      for (let i = 0; i < 5; i++)  {
        divs.push(document.createElement("div"))
        divs[i].innerHTML = "0"
        p.add( divs[i] )
        document.body.appendChild(divs[i])
      }

      divs[0].update = (x) => divs[0].innerHTML = `param value: ${x}`
      divs[1].update = (x) => divs[1].innerHTML = (new Array(x).fill("x")).toString()
      divs[2].update = (x) => divs[2].innerHTML = (new Array(x).fill(",")).toString()
      divs[3].update = (x) => divs[3].innerHTML = (new Array(x).fill(".")).toString()
      divs[4].update = (x) => divs[4].innerHTML = (new Array(x).fill(".")).toString()
    

      p.set(1)
      p.set(2)
      window.p = p;


      window.addEventListener("mousemove", (e) => {
          p.set(Math.ceil(e.clientY / 10))
      })
    

}







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
    load_program('programs/linear feedback2.txt')
    .then(t => make_graph(t));
}


function parse(text, store) {
    let lines = text.split(/\r?\n/) // split by newline
                .filter(x => x.length != 0);  // remove empty lines
    


    let graph = {

    }
    
    let plots = []
    let groups = []
    let title = ""
    
    
    let special = ["title", "plot", "time", "group"] // todo : register specials and functions
    let functions = Object.keys(OperationBlocks)

    let names = [];

    let first_pass = []

    
    let inputs_and_params = function (func, args) {
        
        let p = OperationBlocks[func] ? OperationBlocks[func].params : {};
        let param_names = p ? Object.keys(p) : []; 


        let inputs = [];
        let params = {};

        let gui_param_names = ["x", "y"]

        let arg_list = args.replace(/[()\s+]+/g, " ").trim().split(" ")  // remove parentheses and spaces
        
        let w = 1.0;

        for (let i = 0; i < arg_list.length; i++) {
            let x = arg_list[i];
            if (!isNaN(x)) {                
                if ( i < (arg_list.length-1) && names.includes(arg_list[i+1]) ) {
                    w = parseFloat(x);
                    inputs.push([w, arg_list[i+1]])
                    i = i + 1; 
                } else {
                    params[param_names[0]] = parseFloat(x)
                    param_names = param_names.slice(1)
                }
            }
            else if (names.includes(x)) {
                inputs.push([w, x])
                w = 1.0
            }
            else if (param_names.includes(x)) {
                let v = parseFloat(arg_list[++i]);
                params[x] = v
            }
            else if (gui_param_names.includes(x)) {
                let v = parseFloat(arg_list[++i]);
                params[x] = v
            }


        }

        params = {...p, ...params}
        return { func, inputs, params }        
    }

    
    lines.forEach(line => {
        //let line1 = line.replace(/\s{2,}/g, ' ') // remove double spaces
        // console.log(line1)
        let comment = line.indexOf("#");

        let no_comment = line.slice(0, comment >= 0 ? comment: undefined)

        let trimmed = no_comment.trim();
        if (trimmed.length == 0) return;

        let fwi = trimmed.search(/[ =]+/)

        let first = trimmed.slice(0, fwi)  // take the first word 
        let rest =  trimmed.slice(fwi).replace(/[=\"]/g, ' ').trim() // take the rest

        if (!special.includes(first)) names.push(first)

        first_pass.push([first, rest])
    })

    
    first_pass.forEach( ([first, rest]) => {
        if (special.includes(first)) {

            if (first == "title") {
                title = rest;
            } else if (first == "time") {
                graph["t"] = inputs_and_params("time", rest)
            }
            else if (first == "plot") {
                plots.push (inputs_and_params("plot", rest).inputs)
            }
            else if (first == "group") {
                groups.push(rest.split(" "))
            }
        } 
        else {
            let fi = rest.search(/[ (]+/)
            let func = rest.slice(0, fi)
            let args = rest.slice(fi+1)
            graph[first] = inputs_and_params(func, args);
        }
    })
            

    

    //console.log(title)
    // console.log(names)
    console.log("graph", graph)
    //console.log(plots)
    //console.log(groups)

    
    let compute_graph = {};
    let t0 = performance.now()

    compute_graph.time = new OperationBlocks["time"].computation([], graph.t.params)

    for (let el in graph ) {
        if (el == "t") continue;
        
        let n = graph[el];
        compute_graph[el] = new OperationBlocks[n.func].computation(n.inputs, n.params, compute_graph.time)

        if (compute_graph[el].generate) {
            compute_graph[el].generate()
        }
    }

    let t1 = performance.now()

    for (let el in compute_graph) {
        for (let i = 0; i < compute_graph[el].inputs.length; i++) {
            let name = compute_graph[el].inputs[i][1];
            compute_graph[el].inputs[i].push( compute_graph[name])
        }
    } 
    
    
    let {T, dt} = compute_graph.time.params;
    let total_steps = Math.round(T / dt)

    console.log(total_steps)
    
    for (let i = 0; i < total_steps; i++) {
        for (let el in compute_graph) compute_graph[el].step();
        for (let el in compute_graph) compute_graph[el].advance();
    }

    let t2 = performance.now()

    console.log("compute", compute_graph)

    let data = [];

    //console.log("p", plots[0])
    for (let [w, r] of plots[0]) {
        let line = {
            x : compute_graph.time.values,
            y : compute_graph[r].values.map( x => x * w) ,
            mode: 'lines',
            name: r
        };
        data.push(line)
    }

    //this.console.log(results, data)

 
    var div1 = document.getElementById("div1")
    
    //var graph_text = document.createTextNode("nada")
    //div1.appendChild(graph_text)

    var plot_div = document.createElement("div")
    var t_attrs = {id: "plot_div", style:"float:left; border:1px solid black; width:800px; height:300px;"}
    for (let a in t_attrs) plot_div.setAttribute(a, t_attrs[a])
    div1.appendChild(plot_div)

    Plotly.react("plot_div", data, {title})

    //console.log(data)

    let t3 = performance.now()

    console.log("compute: ", t2 - t0, "ms, plot:", t3-t2, "ms" )

}

function make_graph(text_program) {
    
    
    parse(text_program)

    let graph = {}
    
    const addTime = {type: "addNode", node_props : OperationBlocks.time }


    
    
    
    //var graph = parse(text_program, store)
    //console.log(graph)
}