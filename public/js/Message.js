class Message{
    constructor(user, text, parent){
        let d = new Date().toLocaleTimeString();
        d = d.substr(0,5);
        this.msgContainer = document.createElement("li");
        this.userContainer = document.createElement("p");
        this.msg = document.createElement("p");
        this.userContainer.innerHTML = "<strong>" + user + "</strong> " + d;
        this.msg.innerHTML = text;
        this.msgContainer.className= "personal";
        this.msgContainer.appendChild(this.userContainer);
        this.msgContainer.appendChild(this.msg);
        parent.appendChild(this.msgContainer);
    }
}

class SystemMessage{
    constructor(text, className, parent){
        this.msg = document.createElement("li");
        this.msg.innerHTML = text;
        this.msg.className= className;
        parent.appendChild(this.msg);
    }
}

class ForeignMessage{
    constructor(user, text, parent, date){
        let d = date.substr(11,5);
        this.msgContainer = document.createElement("li");
        this.userContainer = document.createElement("p");
        this.msg = document.createElement("p");
        this.userContainer.innerHTML = "<strong>" + user + "</strong> " + d;
        this.msg.innerHTML = text;
        this.msgContainer.className= "foreign";
        this.msgContainer.appendChild(this.userContainer);
        this.msgContainer.appendChild(this.msg);
        parent.appendChild(this.msgContainer);
    }
}

export { Message, SystemMessage , ForeignMessage};