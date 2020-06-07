class ComputeNode {
    constructor (inputs = [], params = {}) {
        this.inputs = inputs;
        this.params = params;

        this.value = params.init_value || 0;
        this.values = []; 
    }

    step () {
        this.next_value = value;
    }

    advance () {
        this.values.push(this.value)
        this.value = this.next_value
    }
}


class GeneratorNode {
    constructor (params = {}, time) {
        this.params = params.clone(); 
        this.time = time;
        this.generate()
    }

    generate () {
        this.values = [];
    }

    step () {
        this.counter += 1;
    }

    advance () {
        this.value = this.values[this.counter]
    }
}




const OperationBlocks = {
    
    time : {
        title: "time",
        no_inputs_allowed: true,
        no_outputs: true,
        no_button: true,
        params: { dt: 0.01, duration: 10},
        computation: class extends GeneratorNode {
            generate() {
                this.counter = 0;
                this.N = Math.round( this.duration / this.dt);
                this.indexes =[...new Array(N).keys()]
                this.values = this.indexes.map( i => i * this.dt )
            }               
        } 
    },

    const : {
        title: "const", 
        no_inputs_allowed : true,
        params: {value: 0},
        computation: class extends GeneratorNode {
            generate() {
                this.counter = 0;
                this.values = this.time.indexes.map( _ => this.params.value)
            }
        }                
    },

    sine : {
        title: "sine",
        no_inputs_allowed : true,
        params: {a: 1, f: 1 , p: 0},
        computation: class extends GeneratorNode {
            generate() {
                this.counter = 0;
                let a = this.params.a;
                let f = this.params.f;
                let p = this.params.f;                
                this.values = this.time.values.map(t =>  a * Math.sin(t * f * Math.PI * 2 + p));                
            }
        }  
     },

    pulse : {
        title: "pulse",
        no_inputs_allowed : true,
        params: { t1: 1, t2:2, A: 1}, 
        computation: class extends GeneratorNode {
            generate() {
                let t1 = this.params.t1;
                let t2 = this.params.t2;;
                let A  = this.params.A;
                this.values = this.time.values.map( t => t >= t1 && t < t2 ? A : 0 )                
            }
        }
    },         

    ramp : {
        title: "ramp",
        no_inputs_allowed : true,
        params: { t1: 1, t2:2, A: 1},
        computation : class extends GeneratorNode {
            generate () {
                this.counter = 0;
                let t1 = this.params.t1;
                let t2 = this.params.t2;
                let A  = this.params.A;
        
                let ramp_duration =  (t2 - t1)
                let dy = (A / ramp_duration) * this.time.dt
                let increments = this.time.values.map ( t => t >= t1 && t < t2 ? dy : 0 )
                this.values = increments.map((sum => value => sum += value)(0))
            }
        }
    },         

    random : {
        title: "random",
        no_inputs_allowed : true,
        params: { tc1: 0.1, tc2:0.2, tc3:0.3, seed: 0 },
        computation: class extends GeneratorNode {
            generate () {        
                if (this.params.seed) Math.random.seed(this.params.seed);
        
                this.values = new Array(this.time.N)
                this.counter = 0;        
                let y = 0;
                for (let i = 0; i < this.time.N; i ++) {
                    y = y + (0.002 * (Math.random() * 1000 - 500)) * this.time.dt / this.params.tc1;
                    for (let tc of [this.params.tc2, this.params.tc3] ) {
                        y = y + (y - this.value) * time.dt / tc;
                    }
                    this.values [i] = y;
                }            
            }
        }
    },
    
    add : {
        title: "add",
        params: {},
        computation: class extends ComputeNode {
            constructor (inputs, params) {
                super(inputs, params)
                this.step = () => {
                    let N = this.inputs.length
                    let sum = 0;
                    for (let i = 0; i < N; i++) {
                        let weight = inputs[i][0];
                        let value  = inputs[i][2].state
                        sum = sum + weight * value 
                    }
                    this.next_value = sum
                }
            }
        }     
     },
    

    compare : {
        title : "compare",
        max_inputs: 2,
        params: {},
        computation: class extends ComputeNode {
            constructor (inputs, params) {
                super(inputs, params)
                this.step = () => {
                    let N = inputs.length
                    let sum = 0;
                    for (let i = 0; i < N; i++) {
                        let weight = inputs[i][0];
                        let value  = inputs[i][2].state
                        sum = sum + weight * value 
                    }
                    this.next_value = sum
                }
            }
        } 
    },
        

    amplify : {
        title: "amplify",
        max_inputs : 1,
        params: {init:0, K:100, tc: 0.1},

        computation: class extends ComputeNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                let dt = time.dt
                let K = params.K
                let tc = params.tc
                let limits = params.limits
        
                this.step = () => {
                    let s = this.value
                    if (!this.inputs[0]) return
                    let i = this.inputs[0][2].state
                    this.next_value = s + (K * i - s) * (dt / tc)

                    if (limits) {
                        this.next_value = Math.max(this.next_value, limits.min)
                        this.next_value = Math.min(this.next_value, limits.max)
                    }
                }
            }
        }
    },

    integrate: {
        title: "integrate",
        params: {init:0},
        computation: class Integrator extends ComputeNode {
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
                    this.next_value = this.value + 0.5 * (this.old_input + sum) * dt
                    this.old_input = sum
                }
            }
        }    
    },

    multiply: {
        title: "mult",
        computation:  class Multiply extends ComputeNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.step = () => {    
                    let N = inputs.length
                    let mult = 0;
                    for (let i = 0; i < N; i++) {
                        let value  = inputs[i][2].state
                        mult = mult * value;
                    }
                    this.next_value = mult;
                }
            }
        }
    },

    delay: {
        title: "delay",
        max_inputs: 1,
        params: {t: 0},
        computation: class Delay extends ComputeNode {
            constructor (inputs, params, time) {
                super(inputs, params)
                this.delay_time = params.t
                this.delay_units = Math.round(this.delay_time / time.dt)
                this.ys = new Array(this.delay_units)
                this.ys.fill(this.value)
                this.step = () => {
                    if (!this.inputs[0]) return;
                    this.ys.push( this.inputs[0][2].state )
                    let N = this.ys.length
                    this.next_value = this.ys [N - this.delay_units - 1]
                }
            }

        }    

    },

    limit: {
        title: "limit",
        max_inputs : 1,
        params: {max: 1, min:-1},
        computation: class Limit extends ComputeNode {
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


export {OperationBlocks as default}