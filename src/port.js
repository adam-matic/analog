export default class Port {
    constructor(parent_node) {
        this.parent_node = parent_node;
        
        let draw = this.draw
        this.circle = draw.circle()
            .size(10, 10)
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
            if (this.parent_node.connected == false) {
                this.draw_circle_home()
                this.draw_line()
            } 
            draw.layer2.add(this.circle)
            draw.portmove = false;
            draw.moved_port = null;
        });

        this.wire_line = draw.line()
        this.wire_line.stroke({width:3, color:"#888"})
        draw.layer0.add(this.wire_line)
        this.draw_home()
    }

    draw_circle_home () {
        let home_x = this.parent_node.r.cx() + this.parent_node.r.width() / 2;
        let home_y = this.parent_node.r.cy();
        this.circle.cx(home_x).cy(home_y);
    }

    draw_line () {
        let [ax, ay] = [this.parent_node.r.cx(), this.parent_node.r.cy()]
        let [bx, by] = [this.circle.cx(), this.circle.cy()]
        this.wire_line.plot(ax, ay, bx, by)
    }

    draw_home() {
        this.draw_circle_home()
        this.draw_line()
    }
}