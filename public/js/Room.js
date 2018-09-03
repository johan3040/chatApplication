class Room{
    constructor(name, callback){
        this.value = name;
        this.callback = callback;
        this.handleClick = this.handleClick.bind(this);
        this.container = document.getElementById("rooms");
        this.elem = document.createElement("button");
        this.elem.innerHTML = name;
        this.elem.setAttribute("id", "roomIdentifier_" + name);
        this.elem.addEventListener("click", this.handleClick);
        this.container.appendChild(this.elem);
    }

    handleClick(e){
        e.preventDefault();
        this.callback(this.value);
    }

}

export { Room };