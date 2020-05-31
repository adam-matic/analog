

//persistent data storage



class GraphStore {
    constructor () {
        this.g = {}
        this.gs = [{}]
    }

    add( node, name ) {
        this.gs.push(this.g.clone())
        this.g.name = node 
    }

    remove ( node_name ) {

    }

    connect ( source, target ) {

    }

    
}