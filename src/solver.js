export default function solver (program_graph) {

    window.program_graph = program_graph
    
    let duration =  program_graph.time.params.duration;
    let dt = program_graph.time.params.dt;
    let total_steps = Math.round(duration / dt)
    

    for (let i = 0; i < total_steps; i++) {
        for (let el in program_graph) {
            let n = program_graph[el];  
            n.step()
            n.advance()
        }

    }

    let results = {};

    for (let el in program_graph) {
        let n = program_graph[el];
        results[el] = n.history;      
    }

    return results;
}