

import { Room }     from './Room.js';
import { MySocket } from './MySocket.js';
import { User }     from './User.js';
import { Message, SystemMessage, ForeignMessage }  from './Message.js';
import { EmojiContainer } from './EmojiContainer.js';

class Main{

    constructor(){
       /* */
        this.name = "";
        this.initSplashScreen();
        this.cb = this.cb.bind(this);
    }

    initSplashScreen(){
        let inputField = document.getElementById("inputUsername");
        let inputBtn = document.getElementById("splashBtn");
        
        inputBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            this.name = inputField.value
            if(this.name !== ""){
                document.getElementById("splash").style.display = "none";
                //document.getElementById("loading").style.display = "block";
                this.createEmojis();
            }else{
                inputBtn.setAttribute("class", "shake");
                inputBtn.style.border = "3px solid red";
                setTimeout(()=>{
                    inputBtn.removeAttribute("class", "shake");
                    inputBtn.style.border = "3px solid white";
                }, 300);
            }
        });

        inputField.focus();
    }

    createEmojis(){
        this.emojiContainer = new EmojiContainer(this.cb);
    }

    showEmojis(){
        let vis = document.getElementById("emojiContainer").style.visibility === "visible" ? "hidden" : "visible";
        document.getElementById("emojiContainer").style.visibility = vis;
    }

    cb(){
        document.getElementById("mainContent").style.display = "block";
        this.initChat(this.name);
        
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

        this.emojiAnchor =          document.getElementById("emojiIcon");

        this.userInputMessage.focus();
    }

    initEventHandlers(){
        this.sendBtn.addEventListener("click", this.handleSendClick);
        this.connectionBtn.addEventListener("click", this.handleConnectClick);

        this.userInputMessage.addEventListener("input", (e)=>{
            e.target.value !== "" ? this.socket.handleEmit("typing", this.user.name, this.user.room) : this.socket.handleEmit('lost focus', this.user.room, this.user.room);
            this.emojiContainer.replaceStringToEmoji(e.target.value, this.userInputMessage);
        });

        this.userInputMessage.addEventListener("blur", (e)=>{
            this.socket.handleEmit('lost focus', this.user.name, this.user.room);
        });

        this.userInputMessage.addEventListener("click", (e)=>{
            
            if(document.getElementById("emojiContainer").style.visibility === "visible"){
                document.getElementById("emojiContainer").style.visibility = "hidden";
            }
        })

        this.disconnectionBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            this.clearMessages();
            this.socket.handleDisconnection(this.user.room, this.user.defaultRoom);
            let btn = document.getElementById("roomIdentifier_" + this.user.room);
            btn.parentNode.removeChild(btn);
        });

        this.emojiAnchor.addEventListener("click", this.showEmojis);
    }

    handleSendClick(e){
        e.preventDefault();
        let text =  this.userInputMessage.value;
        if(text !== ""){
            this.socket.handleMessage(this.user.name, text, this.user.room);
            let msg = new Message(this.user.name, text, this.messageContainer);
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

    handleForeignMessage(user, msg, date){
        let message = new ForeignMessage(user, msg, this.messageContainer, date);
        this.scrollDown();
    }

    handleSystemMessage(msg, className){
        let message = new SystemMessage(msg, className, this.messageContainer);
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

window.addEventListener("load", ()=>{new Main()});
