import ContextMenu from './context_menu.js'

export default class Port {
    constructor(parent_node) {
        this.parent_node = parent_node;
        
        this.params = {weight: 1.0};

        let draw = this.draw
        
        this.circle = draw.circle().size(15, 15).draggable( );
        this.circle.port = this;
        draw.layer2.add(this.circle)

        this.circle.on("dragstart", e => {
            draw.layer0.add(this.circle)
            this.circle.attr({"pointer-events":'none'})
            draw.portmove = true;
            draw.moved_port = this;
        })
        this.circle.on("dragmove",  e => this.draw_line_to_circle())
        this.circle.on("mouseover", e => this.circle.fill("#d00"))
        this.circle.on("mouseout",  e => this.circle.fill("#000"))
        
        this.circle.on("dragend", (e) => {
            //draw.layer2.add(this.circle)
            draw.portmove = false;
            draw.moved_port = null;
            if (this.parent_node.connected) {
                this.draw_line_to_target_node() 
            } else {
                this.draw_home()
            }
            this.circle.attr({"pointer-events": 'all'});
        })

        this.circle.on("contextmenu", (e) => new ContextMenu(e, this.params, this.update_weight))
        this.update_weight = () => { console.log(this.params)};

        this.wire_line = draw.line()
        this.wire_line.stroke({width:3, color:"#888"})
        draw.layer0.add(this.wire_line)

        this.out_name_text = draw.group();
        this.out_name = draw.text(parent_node.output_name).font({"weight": "bold", "size": "17"}).fill("#000")
        let text_width = this.out_name.node.firstChild.getComputedTextLength();

        
        this.out_name_text.on("contextmenu", (e) => new ContextMenu(e, this.params, this.update_weight))

        let background = draw.rect().size(text_width + 10, 22)
            .fill("#fff")
            .attr({"fill-opacity":"0.9"})

        this.out_name_text.add(background)
        this.out_name_text.add(this.out_name)
        
        this.out_name.dmove(5)

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
        this.draw_line_to_circle()
    }

    draw_circle_home () {
        let text_width = this.out_name.node.firstChild.getComputedTextLength() 
        let home_x = this.parent_node.r.cx() + this.parent_node.r.width()/2 + 30 + text_width;
        let home_y = this.parent_node.r.cy();
        this.circle.cx(home_x).cy(home_y);
    }


    draw_line () {
        if (this.parent_node.connected) {
            this.draw_line_to_target_node()
        } else {
            this.draw_line_to_circle()
        }
    }

    draw_line_to_target_node () {
        let a = this.parent_node;
        let b = a.connected_to;
        let [ax, ay] = [a.r.cx(), a.r.cy()]
        let [bx, by] = [b.r.cx(), b.r.cy()]
        
        let w = 3 + b.r.width() / 2;
        let h = 3 + b.r.height() / 2;
        

        let lx = 0, ly=0;
        

        let angle = Math.atan2(ay-by, ax-bx);
        let a1 = Math.atan2(-h, -w );
        let a2 = Math.atan2(-h, +w );
        let a3 = Math.atan2(h,  w );
        let a4 = Math.atan2(h, -w );
        
        let c = Math.cos(angle)
        let s = Math.sin(angle)
        let t = Math.tan(angle) 
        
        if (angle > a1 && angle < a2 )      { /*console.log("top");*/    lx = bx - h / t; ly = by - h;}
        else if (angle > a2 && angle < a3 ) { /*console.log("right");*/  lx = bx + w;   ly = by + w*t;}
        else if (angle > a3 && angle < a4 ) { /*console.log("bottom");*/ lx = bx + h/t; ly = by + h;}
        else                                { /*console.log("left"); */  lx = bx - w;   ly = by - w*t }
        
        //console.log(s, lx, ly)
        let x = (bx + ax) / 2.0
        let y = (by + ay) / 2.0

        this.circle.cx(lx).cy(ly)
        this.out_name_text.cx(x).cy(y)   
        this.wire_line.plot(ax,ay,bx,by)
    }



    draw_line_to_circle () {
        let [ax, ay] = [this.parent_node.r.cx(), this.parent_node.r.cy()]
        let [bx, by] = [this.circle.cx(), this.circle.cy()]
        
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
        
        this.wire_line.plot(ax, ay, bx, by)
        this.out_name_text.cx(x).cy(y)   
    
    }


    draw_home() {
        this.draw_circle_home()
        this.draw_line_to_circle()
    }
}