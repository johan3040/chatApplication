const mysql = require('mysql');

class MySqlHandler{
    constructor(){

        this.conn = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "chat",
            charset: "utf8mb4"
          });
        this.conn.connect(function(err) {
            if (err) console.log(err);
            this.connected = true;
        });
    }

    createTable(tableName){
        //CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; !! important for emoji-support
        let sql = `CREATE TABLE ${tableName} (user text, message text, timestamp VARCHAR(19)) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
        this.conn.query(sql, (err,res)=>{
            if(err) console.log(err);
            console.log(`Created table ${tableName}`);
        });
    }

    dropTable(tableName){
        let sql = `DROP TABLE ${tableName}`;
        this.conn.query(sql, (err,res)=>{
            if(err) throw (err);
            else console.log(`Dropped table ${tableName}`);
        });
    }

    insertMessage(user, message, tableName){
        let sql = `INSERT INTO ${tableName} (user, message, timestamp) VALUES ("${user}", "${message}", CURRENT_TIMESTAMP())`;
        this.conn.query(sql, (err,res)=>{
            if(err) console.log(err);
            else console.log(`Inserted ${user} : ${message} in table ${tableName}`);
        });
    }

    fetchMessages(tableName, callback){
        let sql = `SELECT * FROM ${tableName}`;
        this.conn.query(sql, (err, res)=>{
            if(err){
                if(err.errno === 1146) console.log("Table does NOT exist");
            }else callback(res);
        });
    }

}

module.exports = MySqlHandler;