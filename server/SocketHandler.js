
const io = require('./index.js').io;

module.exports = function(socket){

    socket.emit('initData', socket.id);

    socket.on('set nickname', nickname=>{
        socket.nickname = nickname;
        socket.emit('update users', [0]);
        socket.emit('add new user to list', socket.nickname, socket.id);
    });

    socket.join(socket.id,(err)=>{
        socket.emit('conn', socket.id, socket.rooms);
    });

    socket.on('joinRoom', (selectedRoom, prevRoom, name)=>{
        socket.broadcast.to(prevRoom).emit('user disconnected', socket.id, socket.nickname);
        socket.leave(prevRoom,(err)=>{
            let users = io.of('/').in(prevRoom).clients((err, clients)=>{
                if(clients.length > 0){
                    socket.broadcast.to(prevRoom).emit('update users', clients);
                }
            });
        });

        socket.join(selectedRoom, (err)=>{
            socket.emit('conn', selectedRoom, socket.rooms);
            socket.broadcast.to(selectedRoom).emit('display connected user', name);
            socket.broadcast.to(selectedRoom).emit('add new user to list', socket.nickname, socket.id);
            //Get all nicknames in 'selectedRoom' - send only to socket (current user)
            for (socketID in io.nsps['/'].adapter.rooms[selectedRoom].sockets) {
                let nickname = io.nsps['/'].connected[socketID].nickname;
                let id = io.nsps['/'].connected[socketID].id;                
                socket.emit('add new user to list', nickname, id);
              }

           let users = io.of('/').in(selectedRoom).clients((err, clients)=>{
                if(err) throw err;
                //Send to all in room including sender
                io.in(selectedRoom).emit('update users', clients);
            });
        }); 

        socket.on("disconnect", ()=>{
            socket.broadcast.to(selectedRoom).emit('user disconnected', socket.id, socket.nickname);
            
            let users = io.of('/').in(selectedRoom).clients((err, clients)=>{
                if(clients.length > 0){
                    socket.broadcast.to(selectedRoom).emit('update users', clients);
                }
            });
            
        });

    });

    socket.on('chat message', (data)=>{
        //Send to all in room except sender
        console.log(data);
        socket.broadcast.to(data.room).emit('chat message', data.message);
    });

    socket.on('typing', (room)=>{
        socket.broadcast.to(room).emit('usertype');
    });

    socket.on('lost focus', (room)=>{
        socket.broadcast.to(room).emit('stoppedTyping');
    });
    /*
    socket.on('manually disconnected', (room)=>{
        socket.broadcast.to(room).emit('user disconnected', socket.id, socket.nickname);
    });
    */
    socket.on("disconnect", ()=>{
        console.log("Someone left");
    });

}