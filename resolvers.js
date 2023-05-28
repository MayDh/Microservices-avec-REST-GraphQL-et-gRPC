const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les categories
const produitProtoPath = 'produit.proto';
const categorieProtoPath = 'categorie.proto';

const produitProtoDefinition = protoLoader.loadSync(produitProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const categorieProtoDefinition = protoLoader.loadSync(categorieProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const produitProto = grpc.loadPackageDefinition(produitProtoDefinition).produit;
const categorieProto = grpc.loadPackageDefinition(categorieProtoDefinition).categorie;

const clientProduits = new produitProto.ProduitService('localhost:50051', grpc.credentials.createInsecure());
const clientCategories = new categorieProto.CategorieService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        produit: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de films
            const client = new produitProto.ProduitService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getProduit({ produit_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.produit);
                    }
                });
            });
        },
        produits: () => {
            // Effectuer un appel gRPC au microservice de films
            const client = new produitProto.ProduitService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchProduits({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.produits);
                    }
                });
            });
        },

        categorie: (_, { id }) => {
            // Effectuer un appel gRPC 
            const client = new categorieProto.CategorieService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getCategorie({ categorie_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.categorie);
                    }
                });
            });
        },

        categories: () => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new categorueProto.CategorieService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchCategories({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.categories);
                    }
                });
            });
        },
    },
    Mutation: {
        createProduit: (_, { id, title, description }) => {
            return new Promise((resolve, reject) => {
                clientProduits.createProduit({ produit_id: id, title: title, description: description }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.produit);
                    }
                });
            });
        },
        createCategorie: (_, { id, title, description }) => {
            return new Promise((resolve, reject) => {
                clientCategories.createCategorie({ categorie_id: id, title: title, description: description }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.categorie);
                    }
                });
            });
        },
    }
};

module.exports = resolvers;