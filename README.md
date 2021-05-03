# APPSINF
Projet d'approfondissement en sciences informatiques (UCL). <br/>
Pas fini !

## Prérequis
- Node Package Manager (NPM)
- MongoDB
- nodemon `npm install -g nodemon`
  (**optionnel** mais permet de ne pas devoir relancer le serveur à chaque fois)

## Initialisation
1) Démarrez votre serveur MongoDB 
2) Avec votre terminal, naviguez jusqu'au dossier APPSINF
3) Créez un fichier .env avec les clés ci-dessous. Vous êtes libre de mettre les valeurs que vous souhaitez. Celles-ci sont celles par défaut :
    ```dotenv
    # /.env
    
    # Le port sur lequel sera exposé le site
    PORT=3000
    
    # Le secret de la sesssion - String similaire à un mot de passe puissant conseillée
    SESSION_SECRET=!CHANGEME!
    
    # Le chemin de connexion vers MongoDB
    MONGO_PATH=mongodb://localhost/appsinf-articles
    ```
4) Tapez `npm install` pour installer les dépendances
5) Avec Node : `node ./bin/www` **OU** avec Nodemon : `nodemon ./bin/www localhost`
6) Avec votre navigateur allez à l'adresse suivante : `localhost:PORT`
