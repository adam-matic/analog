print = console.log

function Integrator(init_value=0) {
    var o = init_value
    var no = 0
    var ins = []
    var hist = []
    var x = 0
    
    this.step = function () {    
        x = ins.reduce((s, e)=> s + e.o, 0)        
        no = o + x 
    };
    
    return this
}

//var advance = (e) => {  e.o = e.no; e.hist.push(e.o);};


i = Integrator()
b = {o : 1}
c = {o : 2}

i.ins = [b, c]

i.step()

p = console.log

p(i.o)
p(i.no)

//advance(i)

p(i.o)
p(i.no)