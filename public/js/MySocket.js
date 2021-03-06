
import { Message }  from './Message.js';
import { Room } from './Room.js';


class MySocket {
    constructor(user, parent){
        this.socket = io();

        this.socket.on('initData', (id)=>{
            this.user.defaultRoom = id;
            this.socket.emit('set nickname', this.user.name);
        });
        this.handleRoomButtonClick = this.handleRoomButtonClick.bind(this);
        this.user = user;
        this.parent = parent;
        this.initListeners();
    }

    handleMessage(user, msg, room){
        let d = new Date().toLocaleTimeString();
        this.socket.emit('chat message', {user: user, message: msg, room:room, date: d});
        this.socket.emit('lost focus', room);
    }

    handleConnection(newRoom, prevRoom){
        this.user.room = newRoom;
        this.socket.emit('joinRoom', newRoom, prevRoom, this.user.name);
    }

    handleDisconnection(prevRoom, newRoom){
        this.parent.removeList();
        this.socket.emit('joinRoom', newRoom, prevRoom, this.user.name);
        this.socket.emit('leftRoom', prevRoom);
        document.querySelector("#roomTitle").innerHTML = newRoom;
    }

    handleEmit(event, user, room){
        this.socket.emit(event, user, room);
    }

    initListeners(){

        this.socket.on('conn', (room, rooms)=>{
            this.user.room = room;
            document.querySelector("#roomTitle").innerHTML = room;
            this.parent.handleSystemMessage("You are connected to " + room, "broadcast");
        });

        this.socket.on('update users', (users)=>{
            document.getElementById("onlineNr").innerHTML = users.length;
        });

        this.socket.on('display connected user', (user)=>{
            this.parent.handleSystemMessage(user + " connected.", "broadcast");
        });

        this.socket.on('add new user to list', (nickname, id)=>{
            this.parent.createMember(nickname, id);
        });

        this.socket.on('chat message', (user, msg, date)=>{
            let message = this.parent.handleForeignMessage(user, msg, date);
        });

        this.socket.on('usertype', (user)=>{
            document.getElementById("usertype").style.visibility = "visible";
            document.getElementById("usertype").innerHTML = `${user} is typing...`;
        });

        this.socket.on('stoppedTyping', ()=>{
            document.getElementById("usertype").style.visibility = "hidden";
        });
        
        this.socket.on('user disconnected', (id, nickname)=>{
            let message = this.parent.handleSystemMessage(nickname + " disconnected", "disconnected");
            this.parent.removeMember(id);
        });

        this.socket.on('fetch messages', res=>{
            for(let i = 0; i<res.length; i++){
                let msg = this.parent.handleForeignMessage(res[i].user, res[i].message, res[i].timestamp);
            }
        });

        this.socket.on('add new room', room=>{
            let r = new Room(room, this.handleRoomButtonClick);
        });

    }

    handleRoomButtonClick(roomName){
        if(roomName !== this.user.room){
            console.log(this.socket);
            this.parent.clearMessages();
            this.parent.removeList();
            this.socket.emit('joinRoom', roomName, this.user.room, this.user.name);
        }
    }

}


export { MySocket };