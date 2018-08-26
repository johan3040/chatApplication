class User{
    constructor(name){
        this.name = name,
        this.room =  '',
        this.defaultRoom =  ''
    }
    setDefaultRoom(room){
        console.log(room);
        this.defaultRoom = room;
    }
}

export { User };