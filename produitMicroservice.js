const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2');

const produitProtoPath = 'produit.proto';

const produitProtoDefinition = protoLoader.loadSync(produitProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const produitProto = grpc.loadPackageDefinition(produitProtoDefinition).produit;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_mic',
});

const produitService = {
    getProduit: (call, callback) => {
        const { produit_id } = call.request;
        const query = 'SELECT * FROM produit WHERE id = ?';
        const values = [produit_id];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const produit = results[0];
                callback(null, { produit });
            }
        });
    },
    searchProduits: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM produit WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const produits = results;
                callback(null, { produits });
            }
        });
    },
    createProduit: (call, callback) => {
        const { title, description } = call.request;
        const query = 'INSERT INTO produit (title, description) VALUES (?, ?)';
        const values = [title, description];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const produit = { id: insertedId, title, description };
                callback(null, { produit });
            }
        });
    },
};

const server = new grpc.Server();
server.addService(produitProto.ProduitService.service, produitService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`Produit microservice is running on port ${port}`);
