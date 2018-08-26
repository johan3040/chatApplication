
import { Message }  from './Message.js';


class MySocket {
    constructor(user, parent){
        this.socket = io();

        this.socket.on('initData', (id)=>{
            this.user.defaultRoom = id;
            this.socket.emit('set nickname', this.user.name);
        });

        this.user = user;
        this.parent = parent;
        this.initListeners();
    }

    handleMessage(msg, room){
        this.socket.emit('chat message', {message: msg, room:room});
        this.socket.emit('lost focus', room);
    }

    handleConnection(newRoom, prevRoom){
        this.socket.emit('disconnected', prevRoom);
        this.user.room = newRoom;
        this.socket.emit('joinRoom', newRoom, prevRoom, this.user.name);
    }

    handleDisconnection(prevRoom, newRoom){
        this.parent.removeList();
        this.socket.emit('joinRoom', newRoom, prevRoom);
        document.querySelector("#roomTitle").innerHTML = "Room: <br>" + newRoom;
    }

    handleEmit(event, data){
        this.socket.emit(event, data);
    }

    initListeners(){

        this.socket.on('conn', (room, rooms)=>{
            this.user.room = room;
            document.querySelector("#roomTitle").innerHTML = "Room: <br>" + room;
            this.parent.handleForeignMessage("You are connected to " + room, "broadcast");
        });

        this.socket.on('update users', (users)=>{
            document.getElementById("onlineNr").innerHTML = users.length;
        });

        this.socket.on('display connected user', (user)=>{
            this.parent.handleForeignMessage(user + " connected.", "broadcast");
        });

        this.socket.on('add new user to list', (nickname, id)=>{
            this.parent.createMember(nickname, id);
        });

        this.socket.on('chat message', (msg)=>{
            let message = this.parent.handleForeignMessage(msg, "foreign");
        });

        this.socket.on('usertype', ()=>{
            document.getElementById("usertype").style.visibility = "visible";
        });

        this.socket.on('stoppedTyping', ()=>{
            document.getElementById("usertype").style.visibility = "hidden";
        });
        
        this.socket.on('user disconnected', (id, nickname)=>{
            let message = this.parent.handleForeignMessage(nickname + " disconnected", "disconnected");
            this.parent.removeMember(id);
        });

    }

}


export { MySocket };