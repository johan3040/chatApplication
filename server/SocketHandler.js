
const io = require('./index.js').io;
const mysqlhandler = require('./MySqlHandler.js');
const MySqlHandler = new mysqlhandler();

module.exports = function(socket){    

    let croom = "";

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
        let tableName = createTableName(socket.id);
        MySqlHandler.createTable(createTableName(tableName));
        croom = socket.id;
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
                }else{
                    let tableName = createTableName(prevRoom);
                    MySqlHandler.dropTable(createTableName(tableName));
                }
            });
        });

        /**
         * Join new room
         * @param string
         */
        socket.join(selectedRoom, (err)=>{

            croom = selectedRoom;

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
            if(io.nsps['/'].adapter.rooms[selectedRoom].sockets){
                for (socketID in io.nsps['/'].adapter.rooms[selectedRoom].sockets) {
                    let nickname = io.nsps['/'].connected[socketID].nickname;
                    let id = io.nsps['/'].connected[socketID].id;                
                    socket.emit('add new user to list', nickname, id);
                  }
            }

            /**
             * Update number of connected clients in room to all members in room
             */
            let users = io.of('/').in(selectedRoom).clients((err, clients)=>{
                if(err) throw err;
                //Send to all in room including sender
                io.in(selectedRoom).emit('update users', clients);
                if(clients.length <=1){
                    let tableName = createTableName(selectedRoom);
                    MySqlHandler.createTable(createTableName(tableName));
                } 
            });

            /**
             * Get messages from room
             */

             MySqlHandler.fetchMessages(createTableName(selectedRoom), (res)=>{
                 socket.emit('fetch messages', res);
             });

        }); 
    });

    socket.on('chat message', (data)=>{
        //Send to all in room except sender
        let room = createTableName(data.room);
        MySqlHandler.insertMessage(data.user, data.message, room);
        socket.broadcast.to(data.room).emit('chat message', data.user, data.message, data.date);
    });

    socket.on('typing', (user, room)=>{
        socket.broadcast.to(room).emit('usertype', user);
    });

    socket.on('lost focus', (user, room)=>{
        socket.broadcast.to(room).emit('stoppedTyping');
    });
    /*
    socket.on("disconnect", ()=>{
        console.log("Disconnected from: " + croom);

        let users = io.of('/').in(croom).clients((err, clients)=>{
            if(clients.length > 0){
                socket.broadcast.to(prevRoom).emit('update users', clients);
            }else{
                let tableName = createTableName(croom);
                MySqlHandler.dropTable(tableName);
            }
        });

    });
    */
    /**
     * Event triggers when socket disconnects manually
     */
    socket.on("disconnect", ()=>{
        socket.broadcast.to(croom).emit('user disconnected', socket.id, socket.nickname);
        socket.broadcast.to(croom).emit('stoppedTyping');
        /**
         * Update number of connected clients left in disconnected room
         */
        let users = io.of('/').in(croom).clients((err, clients)=>{
            if(clients.length > 0){
                socket.broadcast.to(croom).emit('update users', clients);
            }else{
                let tableName = createTableName(croom);
                MySqlHandler.dropTable(createTableName(tableName));
            }
        });
            
    });

}

/**
 * If first character of string 'prevRoom' is number - add string 'num'
 * Replace '_' and '-' with 'a', 'b'
 */
function createTableName(name){
    let tableName = name;
    let firstChar = name.substr(0,1);
    let numExp = /[0-9]/g;

    if(firstChar.match(numExp) !== null){
        tableName = "num" + name;
    }

    tableName = tableName.replace(/_/g, "a");
    tableName = tableName.replace(/-/g, "b");

    return tableName;

}