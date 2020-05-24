class ComputerNode {
    constructor (inputs = [], params = {}) {
        this.inputs = inputs;
        this.params = params;

        this.state = params.init_value || 0;
        this.next_state = this.state;
        this.history = []; 
    }
    step () {

    }

    advance () {
        this.history.push(this.state)
        this.state = this.next_state
    }
}



const nodes = {
    
    time : {
        title: "time",
        no_inputs_allowed: true,
        no_outputs: true,
        no_button: true,
        params: { dt: 0.01, total: 10},
        computation: class extends ComputerNode {
            step () {   
                this.next_state = this.state + this.params.dt;
            }
        }
    },

    generator_const : {
        title: "generator const", 
        no_inputs_allowed : true,
        params: {value: 0},
        computation: class extends ComputerNode {
            constructor (inputs, params) {
                super(inputs, params)
                let const_value = this.params.value || 0;
                this.state = const_value;
                this.next_state = const_value;
            }
        }

    },

    generator_sin : {
        title: "generator sin",
        no_inputs_allowed : true,
        params: {a: 1, f: 1 , p: 0},
        computation: class extends ComputerNode {
            constructor (inputs, params, globals) {
                super(inputs, params)
                
                let a = this.params.a;
                let f = this.params.f;
                let p = this.params.p;
                let duration = globals.duration;
                let dt = globals.dt;
                let counter = 0;
                let imax = Math.round( duration / dt);
                this.ys = []
        
                for (let i = 0; i < imax; i++) {
                    let y = a * Math.sin(i * dt * f * Math.PI * 2 + p);
                    this.ys.push(y)
                }
                this.history = this.ys;
            
                this.step = () => {
                    counter += 1; 
                }
        
                this.advance = () => { 
                    this.state = this.ys[counter]
                }
            }
         }        
     },

    generator_pulse : {
        title: "generator pulse",
        no_inputs_allowed : true,
        params: { t1: 1, t2:2, A: 1}, 
        computation: class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let t1 = this.params.t1;
                let t2 = this.params.t2;;
                let A  = this.params.A;
        
                this.state = (t1 <= 0) ? A : 0;
                
                this.step = () => {
                    let t = time.state;
                    this.next_state = (t >= t1 && t < t2) ? A : 0;
                }
            }
        }
    },         

    generator_ramp : {
        title: "generator ramp",
        no_inputs_allowed : true,
        params: { t1: 1, t2:2, A: 1},
        computation : class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let t1 = this.params.t1;
                let t2 = this.params.t2;
                let A = this.params.A;
        
                let on_time =  (t2 - t1)
                let dy = (A / on_time) * time.dt
                        
                this.step = () => {
                    let t = time.state;
                    let inc = (t >= t1 && t < t2) ? dy : 0
                    this.next_state = this.state + inc;
                }
            }
        }
    },         

    generator_random : {
        title: "generator random",
        no_inputs_allowed : true,
        params: { tc1: 0.1, tc2:0.2, tc3:0.3},
        computation: class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
        
                if (this.params.seed) Math.random.seed(this.params.seed);
        
                let y = 0;
                this.step = () => {
                    y = y + (0.002 * (Math.random() * 1000 - 500)) * time.dt / this.params.tc1;
                    for (let tc of [this.params.tc2, this.params.tc3] ) {
                        y = y + (y - this.state) * time.dt / tc;
                    }
                    this.next_state = y;
                }
            }
        }
    },
    
    summer : {
        title: "add",
        params: {},
        computation: class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.step = () => {
                    let N = this.inputs.length
                    let sum = 0;
                    for (let i = 0; i < N; i++) {
                        let weight = inputs[i][0];
                        let value  = inputs[i][2].state
                        sum = sum + weight * value 
                    }
                    this.next_state = sum
                }
            }
        }     
     },
    

    comparator : {
        title : "compare",
        max_inputs: 2,
        params: {},
        computation: class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.step = () => {
                    let N = inputs.length
                    let sum = 0;
                    for (let i = 0; i < N; i++) {
                        let weight = inputs[i][0];
                        let value  = inputs[i][2].state
                        sum = sum + weight * value 
                    }
                    this.next_state = sum
                }
            }
        } 
    },
        

    amplifier : {
        title: "amplifier",
        max_inputs : 1,
        params: {init:0, K:100, tc: 0.1},

        computation: class extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let dt = time.dt
                let K = params.K
                let tc = params.tc
                let limits = params.limits
        
                this.step = () => {
                    let s = this.state
                    if (!this.inputs[0]) return
                    let i = this.inputs[0][2].state
                    this.next_state = s + (K * i - s) * (dt / tc)

                    if (limits) {
                        this.next_state = Math.max(this.next_state, limits.min)
                        this.next_state = Math.min(this.next_state, limits.max)
                    }
                }
            }
        }
    },

    integrator: {
        title: "integrator",
        params: {init:0},
        computation: class Integrator extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let dt = time.dt
                this.old_input = params.init;

                this.step = () => {
                    let N = inputs.length
                    let sum = 0;
                    for (let i = 0; i < N; i++) {
                        let weight = inputs[i][0];
                        let value  = inputs[i][2].state
                        sum = sum + weight * value 
                    }
                    this.next_state = this.state + 0.5 * (this.old_input + sum) * dt
                    this.old_input = sum
                }
            }
        }    
    },

    multiply: {
        title: "mult",
        computation:  class Multiply extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.step = () => {    
                    let N = inputs.length
                    let mult = 0;
                    for (let i = 0; i < N; i++) {
                        let value  = inputs[i][2].state
                        mult = mult * value;
                    }
                    this.next_state = mult;
                }
            }
        }
    },

    delay: {
        title: "delay",
        max_inputs: 1,
        params: {t: 0},
        computation: class Delay extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.delay_time = params.t
                this.delay_units = Math.round(this.delay_time / time.dt)
                this.ys = new Array(this.delay_units)
                this.ys.fill(this.state)
                this.step = () => {
                    if (!this.inputs[0]) return;
                    this.ys.push( this.inputs[0][2].state )
                    let N = this.ys.length
                    this.next_state = this.ys [N - this.delay_units - 1]
                }
            }

        }    

    },

    limit: {
        title: "limit",
        max_inputs : 1,
        params: {max: 1, min:-1},
        computation: class Limit extends ComputerNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let max = params.max;
                let min = params.min;

                this.step = () => {
                    if (!this.inputs[0]) return;
                    let x = this.inputs[0][2].state
                    this.next_stae = (x < min) ? min : (x > max) ? max : x;
                }
            }
        }    
    }
}


export {nodes as default}