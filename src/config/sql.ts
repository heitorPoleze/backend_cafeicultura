import mysql from "mysql2/promise";

export const conexao = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',   
        database: 'sistema_agricola',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });