class Message{
    constructor(text, className, parent){
        this.time = new Date().toLocaleTimeString().substr(0,5);
        this.msg = document.createElement("li");
        this.msg.innerHTML = this.time + " " + text;
        this.msg.className= className;
        parent.appendChild(this.msg);
    }
}

export { Message };