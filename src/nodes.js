import Port from './port.js'
import ContextMenu from './context_menu.js'

export default class Node {
    constructor(options, position, output_name) { 
        options = options || {}
        position = position || {}
        options.width  = options.width || 50;
        options.height = options.height || 50; 
        options.x = position.x || 10;
        options.y = position.y || 10;
        this.title = options.title || "node";
        
        this.no_inputs_allowed = options.no_inputs_allowed ;
        this.no_outputs = options.no_outputs;
        
        this.computation = options.computation || class { constructor () {} };

        this.params =  {... options.params} || {}
        
        console.log(this.params)

        let draw = this.draw

        this.g = draw.group()        
        this.r = draw.rect()
            .stroke({color:"#000", width:2})
            .size(options.width, options.height)
            .move(options.x, options.y)
            .fill("#555")
            .radius(5);
        
        this.t = draw.text(this.title).fill("#fff").move(options.x+5, options.y+1);
        this.t.node.style.pointerEvents =  "none"
        
        let wmax = this.t.node.firstChild.getComputedTextLength()

        this.g.add(this.r).add(this.t)

        this.param_texts = {}
        let y0 = 25;
        for (let p in this.params) {
            let num = p + ":" + this.params[p].toFixed(2)
            let v = draw.text(num).fill("#aaa").x(options.x+10).y(options.y+y0)
            v.font({size:12})
            v.node.style.pointerEvents =  "none"
            wmax = Math.max(wmax, v.node.firstChild.getComputedTextLength())
            this.param_texts[p] = v;
            this.g.add(v)
            y0 += 15;
        }

        
        this.r.width(  Math.max(50, 1.3 * wmax))
        this.r.height( Math.max(50, y0 + 10  ) )

        //this.r.width(this.t.width() + 10)
        this.g.draggable()
        draw.layer1.add(this.g)
        this.g.on("contextmenu", (e) =>  new ContextMenu(e, this.params, this.update_params))
        

        this.input_connections = []
        this.connected = false

        if (!this.no_outputs) {
            this.output_name = output_name || this.draw.generate_name()
            this.port = new Port(this)
        }

        this.g.on("dragstart", e => {
            if (this.no_outputs) return;
            if (!this.connected) this.g.add(this.port.circle)
            for (let n of this.input_connections) {
                this.g.add(n.port.circle);
            }
        })

        this.g.on("dragend",   e => {
            if (this.no_outputs) return;
            if (!this.connected) draw.layer2.add(this.port.circle)
            for (let n of this.input_connections) {
                draw.layer2.add(n.port.circle);
            }
        })
        
        this.g.on("dragmove", (e) => {
            if (!this.no_outputs) this.port.draw_line();
            for (let n of this.input_connections) n.port.draw_line();
        })
    
        this.g.on("mouseover", e => {  if (draw.portmove) this.r.fill("#f55") })
        this.g.on("mouseout", e => { this.r.fill("#555") })
        this.r.parent_node = this
   
        this.allow_connection_to = (node) => {
            if (this.no_inputs_allowed) return false;
            if (this == node) return false;
            return true;
        }

        this.remove_previous_connection= () => {
            if (this.connected) {
                let c = this.connected_to
                c.input_connections = c.input_connections.filter( n => n!= this)
                this.connected = false;
                this.connected_to = null;    
            }
        }

        this.update_params = () => {
            for (let p in this.params) {
                let num = this.params[p].toFixed(2)
                this.param_texts[p].node.firstChild.innerHTML = p + ":" +num;
            }
        }
    }

}
