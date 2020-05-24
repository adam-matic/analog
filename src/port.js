export default class Port {
    constructor(parent_node) {
        this.parent_node = parent_node;
        
        let draw = this.draw
        this.circle = draw.circle()
            .size(15, 15)
            .draggable( );

        this.circle.port = this;
       
        draw.layer2.add(this.circle)

        this.circle.on("dragstart", e => {
            draw.layer0.add(this.circle)
            draw.portmove = true;
            draw.moved_port = this;
        })
        
        this.circle.on("dragmove",  e => this.draw_line())
        this.circle.on("mouseover", e => this.circle.fill("#d00"))
        this.circle.on("mouseout",  e => this.circle.fill("#000"))
        
        this.circle.on("dragend", (e) => {
            draw.layer2.add(this.circle)
            draw.portmove = false;
            draw.moved_port = null;
            if (this.parent_node.connected) {
                this.allign_port_with_target() 
            } else {
                this.draw_home()
            }
        })

        this.wire_line = draw.line()
        this.wire_line.stroke({width:3, color:"#888"})
        draw.layer0.add(this.wire_line)


        this.out_name_text = draw.text(parent_node.output_name).font({"weight": "bold", "size": "17", "stroke-width": 0.4}).fill("#000").stroke("#fff")

        this.output_weight = 1.0

        this.draw_home()
    }


    allign_port_with_target () {
        let r = this.parent_node.connected_to.r;
        let c = this.circle;
        
        let [rx, ry] = [r.cx(), r.cy()]
        let [cx, cy] = [c.cx(), c.cy()];
        
        let w = r.width()  / 2;
        let h = r.height() / 2;
        
        let left   = Math.abs(rx - w - cx)
        let right  = Math.abs(rx + w - cx)
        let top    = Math.abs(ry + h - cy)
        let bottom = Math.abs(ry - h - cy)

        let [ncx, ncy] = [cx, cy];

        if (left < right && left < top && left < bottom) {
            ncx = rx - w;
        } else if ( right < top && right < bottom) {
            ncx = rx + w
        } else if ( top < bottom) {
            ncy = ry + h
        } else {
            ncy = ry - h
        }

        this.circle.cx(ncx).cy(ncy)
        this.draw_line()
    }

    draw_circle_home () {

        let home_x = this.parent_node.r.cx() + this.parent_node.r.width()/2 + 20 + this.out_name_text.node.firstChild.getComputedTextLength();
        let home_y = this.parent_node.r.cy();
        this.circle.cx(home_x).cy(home_y);
    }

    draw_line () {
        let [ax, ay] = [this.parent_node.r.cx(), this.parent_node.r.cy()]
        
        
        let [bx, by] = [this.circle.cx(), this.circle.cy()]
        
        this.wire_line.plot(ax, ay, bx, by)

        // find intersection of line with the rectangle

        let s = (ay - by)/(ax - bx)
        let w = this.parent_node.r.width() / 2;
        let h = this.parent_node.r.height() / 2;
        let lx = 0, ly=0;
        if (s*w > -h && s*w < h) {
            if (ax >= bx) { lx = ax - w; ly = ay - h*s;}
            else          { lx = ax + w; ly = ay + h*s;}
        } else {
            if (ay >= by) { lx = ax - w/s; ly = ay - h;}
            else          { lx = ax + w/s; ly = ay + h;}
        }
        
        let x = (bx + lx) / 2.0
        let y = (by + ly) / 2.0
        
        this.out_name_text.cx(x).cy(y)   
    }

    draw_home() {
        this.draw_circle_home()
        this.draw_line()
    }
}