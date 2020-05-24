export default class ContextMenu {
    constructor (e, params, update_params) {
        let target_node = e.target

        if (target_node.context_opened) return;
    
        target_node.context_opened = true
        this.params = params
        e.preventDefault();
             
        let pdiv = document.getElementById("diagram");
        let c = document.createElement("div");

        c.style.background = "#ddd"
        c.style.border = "1px solid black";
        //c.style.height="100px"; 
        //c.style.width="200px"; 
        c.style.position = "absolute";
        c.style.left=`${e.clientX}px`;
        c.style.top=`${e.clientY}px`;
        

        for (let p in params) {
            let row   = document.createElement("p")
            let label = document.createElement("label");
            let input = document.createElement("input");

            label.innerHTML = p + " = ";
            label.for = "p"+ p
            
            input.type  = "number";
            input.id    =  label.for;
            input.value = params[p]
            input.style.textAlign = "right"
            input.style.width = "100px"

            input.onkeyup = (k) => {
                params[p] = input.valueAsNumber
                update_params()
                if (k.key=="Enter") button.click()
            }
            input.onchange = () => { input.onkeyup({key:''}) }
        
            row.style.margin = "10px"
            row.appendChild(label);
            row.appendChild(input);
            c.appendChild(row)   
        }

        

        let button = document.createElement("button");
        button.innerHTML = "close"; 
        button.style.margin = "0 auto"
        c.style.textAlign = "center"
        
        
        button.addEventListener("click", (e) => {            
            pdiv.removeChild(c)
            target_node.context_opened = false;
        })
        
        c.appendChild(button)
        pdiv.appendChild(c);      
    }
}

