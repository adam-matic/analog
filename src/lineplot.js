


function make_text (area, x, y, str, opts) {
    var text_elem, text_node;
    x = x || 0;
    y = y || 0;
    str = str || "";
    opts = opts || {};

    text_elem = area.text(str).cx(x).cy(y)
    
    return text_elem;
  }


 function make_polyline (draw, points, opts) {
    var line;
    points = points || [0,0];
    opts = opts || {};
    opts.stroke = '#ff0';
    opts.fill = '#fa0';
    
    
    line = draw.polyline().fill('none').stroke({width: 3}).stroke("#f00")
    return line;
  };


export default class LinePlot {
    constructor (draw, signals, opts) {

        var i, k, lines, xscale, yscale, yoffset, xleft, xright, w, h;

        let c = draw;

        lines = {};

        opts = opts || {};
        opts.xrange = 1000;
        opts.yrange = 5;

        xleft = 30;
        xright = 60;

        w = 800; //c.width();
        h = 300; //c.height();
        console.log(w,h)
        xscale = (w - (xleft + xright)) / opts.xrange;
        yscale = -h / opts.yrange;
        yoffset = h / 2;

        for (k in signals) {
            if (signals.hasOwnProperty(k)) {
                lines[k] = make_polyline(c, [], {
                    "stroke-width":3,
                     stroke: "#f00"
                });
            }
        }

        // draw axes
        var grl = {
        stroke: 'gray'
        };
        make_polyline(c, [xleft, yoffset, w - xright, yoffset], grl);
        make_polyline(c, [xleft, 0, xleft, h], grl);

        opts.ticks = ["10", "20", "30", "40", "50"]
        if (opts.ticks) {
        grl = {
            'text-anchor': 'end',
            'font-size': 10
        }
        var tc = (h - 10) / (opts.ticks.length - 1);
        opts.ticks.forEach(function (tick, i) {
            make_text(c, xleft - 5, -2 + h - tc * i, tick, grl);
        });
        }

        Object.keys(signals).forEach(function (k, i) {
            make_text(c, w - xright, 15 + i * 15, k, {
            'font-size': 11,
            'fill': "#f00"
            })
        });
    
        let to_line = (s, y, x) => {
           return s + (xleft + x * xscale) + "," + (yoffset + y * yscale) + " ";
        }

        var k;
        for (k in signals) {
            if (signals.hasOwnProperty(k)) {
                lines[k].plot(signals[k].reduce(to_line, ""));
            }
        
        }

    }
}
