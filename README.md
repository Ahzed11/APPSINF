# APPSINF
Introduction du projet d'approfondissement en sciences informatiques (UCL)

## Prérequis
- Node Package Manager (NPM)
- MongoDB
- nodemon `npm install -g nodemon`
  (**optionnel** mais permet de ne pas devoir relancer le serveur à chaque fois)

## Initialisation
1) Démarrez votre serveur MongoDB 
2) Avec votre terminal, naviguez jusqu'au dossier APPSINF
3) Créez un fichier.env avec les clés ci-dessous. Vous êtes libres de mettre les valeurs que vous souhaitez. Celles-ci sont celles par défaut.
    ```dotenv
    PORT=3000 # Le port sur lequel sera exposé le site
    SESSION_SECRET=!CHANGEME! # Le secret de la sesssion - String similaire à un mot de passe conseilé
    MONGO_PATH=mongodb://localhost/appsinf-articles # Le chemin de connexion vers MongoDB
    ```
4) Tapez `npm install` pour installer les dépendances
5) Avec Node : `node ./bin/www` **OU** avec Nodemon : `nodemon ./bin/www localhost`
6) Avec votre navigateur allez à l'adresse suivante : `localhost:PORT`
