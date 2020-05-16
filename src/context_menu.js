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
        c.style.height="100px"; 
        c.style.width="200px"; 
        c.style.position = "absolute";
        c.style.left=`${e.clientX}px`;
        c.style.top=`${e.clientY}px`;
        

        for (let p in params) {
            let name = document.createElement("p");
            name.innerHTML = p + " = ";
            name.style.display = "inline-block"
            let b = document.createElement("input");
            b.setAttribute("type", "number")
            b.setAttribute("value", params[p])
            b.onkeyup = (k) => {
                params[p] = b.valueAsNumber
                update_params()
                if (k.key=="Enter") button.click()
            }
            b.onchange = () => { b.onkeyup({key:''}) }
            c.appendChild(name)
            c.appendChild(b);   
        }

        let button = document.createElement("button");
        button.innerHTML = "close"; 
        button.style.display = "inner-block"    
        button.addEventListener("click", (e) => {            
            pdiv.removeChild(c)
            target_node.context_opened = false;
        })
        
        c.appendChild(button)
        pdiv.appendChild(c);      
    }
}

