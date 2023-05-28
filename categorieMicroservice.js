const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2');

const categorieProtoPath = 'categorie.proto';
const categorieProtoDefinition = protoLoader.loadSync(categorieProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const categorieProto = grpc.loadPackageDefinition(categorieProtoDefinition).categorie;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_mic',
});

const categorieService = {
    getCategorie: (call, callback) => {
        const { categorie_id } = call.request;
        const query = 'SELECT * FROM categorie WHERE id = ?';
        const values = [categorie_id];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const categorie = results[0];
                callback(null, { categorie });
            }
        });
    },
    searchCategories: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM categorie WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const categories = results;
                callback(null, { categories });
            }
        });
    },
    createCategorie: (call, callback) => {
        const { title, description } = call.request;
        const query = 'INSERT INTO categorie (title, description) VALUES (?, ?)';
        const values = [title, description];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const categorie = { id: insertedId, title, description };
                callback(null, { categorie });
            }
        });
    },
};

const server = new grpc.Server();
server.addService(categorieProto.CategorieService.service, categorieService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`Categorie microservice is running on port ${port}`);
