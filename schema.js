const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql
    type Produit {
        id: String!
        title: String!
        description: String!
    }
    type Categorie {
        id: String!
        title: String!
        description: String!
    }
    type Query {
        produit(id: String!): Produit
        produits: [Produit]
        categorie(id: String!): Categorie
        categories: [Categorie]
    }
    type Mutation {
        createProduit(title: String!, description: String!): Produit
        createCategorie(title: String!, description: String!): Categorie
    }
`;
module.exports = typeDefs