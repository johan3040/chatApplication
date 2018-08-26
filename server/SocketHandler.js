
const io = require('./index.js').io;

module.exports = function(socket){
    //Sends socket.id to client
    socket.emit('initData', socket.id);

    /**
     * Sets socket nickname
     * Emits a userlist of array of length 1
     * Emits socket nickname and socket id
     * 
     * @param string
     */
    socket.on('set nickname', nickname=>{
        socket.nickname = nickname;
        socket.emit('update users', [0]);
        socket.emit('add new user to list', socket.nickname, socket.id);
    });

    /**
     * Automatically joins room of value of 'socket.id'
     * Emits 'conn' event with socket.id and all rooms socket are connected to
     */
    socket.join(socket.id,(err)=>{
        socket.emit('conn', socket.id, socket.rooms);
    });

    /**
     * When a user joins a room
     * @param string - selectedRoom
     * @param string - prevRoom
     * @param string - name
     */
    socket.on('joinRoom', (selectedRoom, prevRoom, name)=>{
        /**
         * Emit to previous room that socket has disconnected
         */
        socket.broadcast.to(prevRoom).emit('user disconnected', socket.id, socket.nickname);
        /**
         * Leave room
         * Send updated number of connected clients to old room
         */
        socket.leave(prevRoom,(err)=>{
            let users = io.of('/').in(prevRoom).clients((err, clients)=>{
                if(clients.length > 0){
                    socket.broadcast.to(prevRoom).emit('update users', clients);
                }
            });
        });

        /**
         * Join new room
         * @param string
         */
        socket.join(selectedRoom, (err)=>{
            /**
             * Emit 'conn' event after socket joined joom
             */
            socket.emit('conn', selectedRoom, socket.rooms);
            /**
             * Send to all clients in room except for socket
             */
            socket.broadcast.to(selectedRoom).emit('display connected user', name);
            socket.broadcast.to(selectedRoom).emit('add new user to list', socket.nickname, socket.id);
            /**
             * Get all nicknames in 'selectedRoom' - send only to socket (current user)
             */
            for (socketID in io.nsps['/'].adapter.rooms[selectedRoom].sockets) {
                let nickname = io.nsps['/'].connected[socketID].nickname;
                let id = io.nsps['/'].connected[socketID].id;                
                socket.emit('add new user to list', nickname, id);
              }
            /**
             * Update number of connected clients in room to all members in room
             */
            let users = io.of('/').in(selectedRoom).clients((err, clients)=>{
                if(err) throw err;
                //Send to all in room including sender
                io.in(selectedRoom).emit('update users', clients);
            });
        }); 

        /**
         * Event triggers when socket disconnects
         */
        socket.on("disconnect", ()=>{
            socket.broadcast.to(selectedRoom).emit('user disconnected', socket.id, socket.nickname);
            /**
             * Update number of connected clients left in disconnected room
             */
            let users = io.of('/').in(selectedRoom).clients((err, clients)=>{
                if(clients.length > 0){
                    socket.broadcast.to(selectedRoom).emit('update users', clients);
                }
            });
            
        });

    });

    socket.on('chat message', (data)=>{
        //Send to all in room except sender
        socket.broadcast.to(data.room).emit('chat message', data.message);
    });

    socket.on('typing', (room)=>{
        socket.broadcast.to(room).emit('usertype');
    });

    socket.on('lost focus', (room)=>{
        socket.broadcast.to(room).emit('stoppedTyping');
    });
    
    socket.on("disconnect", ()=>{
        console.log("Someone left");
    });

}