

import { Room }     from './Room.js';
import { MySocket } from './MySocket.js';
import { User }     from './User.js';
import { Message }  from './Message.js';

class Main{

    constructor(){
       /* */
        this.initSplashScreen();
    }

    initSplashScreen(){
        let inputField = document.getElementById("inputUsername");
        let inputBtn = document.getElementById("splashBtn");
        
        inputBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            let name = inputField.value
            if(name !== ""){
                document.getElementById("splash").style.display = "none";
                document.getElementById("mainContent").style.display = "block";
                this.initChat(name);
            }
        });

        inputField.focus();
    }

    initChat(name){
        this.handleSendClick = this.handleSendClick.bind(this);
        this.handleConnectClick = this.handleConnectClick.bind(this);
        this.handleForeignMessage = this.handleForeignMessage.bind(this);
        this.createMember = this.createMember.bind(this);

        this.user = new User(name);
        this.socket = new MySocket(this.user, this);
        
        this.initElements();
        this.initEventHandlers();
    }

    initElements(){
        this.sendBtn =              document.getElementById("sendBtn");
        this.userInputMessage =     document.getElementById("m");
        this.connectInputField =    document.getElementById("connectionInput");
        this.connectionBtn =        document.getElementById("connectionBtn");
        this.disconnectionBtn =     document.getElementById("disconnectBtn");
        this.messageContainer =     document.getElementById("messages");
        this.membersList =          document.getElementById("roomMembers");

        this.userInputMessage.focus();
    }

    initEventHandlers(){
        this.sendBtn.addEventListener("click", this.handleSendClick);
        this.connectionBtn.addEventListener("click", this.handleConnectClick);

        this.userInputMessage.addEventListener("input", (e)=>{
            e.target.value !== "" ? this.socket.handleEmit("typing", this.user.room) : this.socket.handleEmit('lost focus', this.user.room);
        });

        this.userInputMessage.addEventListener("blur", (e)=>{
            this.socket.handleEmit('lost focus', this.user.room);
        });

        this.disconnectionBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            this.clearMessages();
            this.socket.handleDisconnection(this.user.room, this.user.defaultRoom);
        });
    }

    handleSendClick(e){
        e.preventDefault();
        let text =  this.userInputMessage.value;
        if(text !== ""){
            this.socket.handleMessage(text, this.user.room);
            let msg = new Message(text, "personal", this.messageContainer);
            this.userInputMessage.value = "";
            this.scrollDown();
        }
    }

    handleConnectClick(e){
        e.preventDefault();
        let text = this.connectInputField.value;
        if(text !== ""){
            this.connectInputField.value = "";
            this.socket.handleConnection(text, this.user.room);
            this.clearMessages();
            this.clearOnlineUsers();
            this.scrollDown();
        }
    }

    handleForeignMessage(msg, className){
        let message = new Message(msg, className, this.messageContainer);
        this.scrollDown();
    }

    clearMessages(){
        while(this.messageContainer.firstChild){
            this.messageContainer.removeChild(this.messageContainer.firstChild);
        }
    }

    clearOnlineUsers(){
        while(this.membersList.firstChild){
            this.membersList.removeChild(this.membersList.firstChild);
        }
    }

    scrollDown(){
        this.messageContainer.scrollTo(0, this.messageContainer.scrollHeight);
    }

    createMember(nickname, id){
        /*while(this.membersList.firstChild){
            this.membersList.removeChild(this.membersList.firstChild);
        }*/
        
        let member = document.createElement("li");
        member.innerHTML = nickname;
        member.setAttribute("id", id);
        this.membersList.appendChild(member);
    }

    removeMember(id){
        let elem = document.getElementById(id);
        elem.parentElement.removeChild(elem);
    }

    removeList(){
        while(this.membersList.firstChild){
            this.membersList.removeChild(this.membersList.firstChild);
        }
    }

}
/*
function initHandlers(){
    const btn = document.getElementById("sendBtn");
    const input = document.getElementById("m");

    const mainBtn = document.getElementById("mainBtn");
    const otherBtn = document.getElementById("otherBtn");

    const connectInput = document.getElementById("connectionInput");
    const connectBtn = document.getElementById("connectionBtn");

    const disconnectBtn = document.getElementById("disconnectBtn");
}
*/
window.addEventListener("load", ()=>{new Main()});

/*
const userInfo = {
    name: '',
    room: "",
    defaultRoom: ""
}

const btn = document.getElementById("sendBtn");
const input = document.getElementById("m");

const mainBtn = document.getElementById("mainBtn");
const otherBtn = document.getElementById("otherBtn");

const connectInput = document.getElementById("connectionInput");
const connectBtn = document.getElementById("connectionBtn");

const disconnectBtn = document.getElementById("disconnectBtn");

function initUser(){
    userInfo.room = socket.id,
    userInfo.defaultRoom = socket.id
}

btn.addEventListener("click", (e)=>{
    e.preventDefault();
    var text = document.querySelector('#m').value;
    if(text !== ""){
        socket.emit('chat message', {message: text, room:userInfo.room});
        socket.emit('lost focus', userInfo.room)
        var message = new Message(text, "personal");
        document.querySelector("#m").value = "";
        scrollDown();
    }
});

connectBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    var room = connectInput.value;
    socket.emit('disconnected', userInfo.room);
    socket.emit('joinRoom', room, userInfo.room);
    userInfo.room = room;
    
});

disconnectBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    console.log(userInfo);
    socket.emit('disconnected', userInfo.room);
    socket.emit('joinRoom', userInfo.defaultRoom, userInfo.room);
});

input.addEventListener("input", (e)=>{
    e.target.value !== "" ? socket.emit("typing", userInfo.room) : socket.emit('lost focus', userInfo.room);
});

input.addEventListener("blur", (e)=>{
    socket.emit('lost focus', userInfo.room);
});

socket.on('initData', (id)=>{
    userInfo.room = id;
    userInfo.defaultRoom = id;
});

socket.on('conn', (room, rooms)=>{
    userInfo.room = room;
    clearMessages();
    document.querySelector("#roomTitle").innerHTML = "Room: <br>" + room;
    var message = new Message("You are connected to " + room, "broadcast");
    scrollDown();
});

socket.on('update users', (users)=>{
    console.log(users.length);
    document.getElementById("onlineNr").innerHTML = users.length;
})

socket.on('chat message', (msg)=>{
    var message = new Message(msg, "foreign");
    scrollDown();
});

socket.on('usertype', ()=>{
    document.getElementById("usertype").style.visibility = "visible";
});

socket.on('stoppedTyping', ()=>{
    document.getElementById("usertype").style.visibility = "hidden";
});

socket.on('user disconnected', ()=>{
    var message = new Message("Someone disconnected", "disconnected");
    scrollDown();
});

function scrollDown(){
    let elem = document.getElementById("messages");
    elem.scrollTo(0, elem.scrollHeight);
}

function clearMessages(){
    let parent = document.querySelector("#messages");
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

class Message{
    constructor(text, className){
        this.msg = document.createElement("li");
        this.msg.innerHTML = text;
        this.msg.className= className;
        document.getElementById("messages").appendChild(this.msg);
    }
}
*/