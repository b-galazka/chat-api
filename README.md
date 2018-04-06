# Chat API
How to use:
1. Run "npm install" command.
2. Create .env file and set enviroment variables. Example .env file:
HASH_SECRET="secret string"
JWT_SECRET="another secret string"
PORT=4000
IP="127.0.0.1"
JWT_TTL="24h"
ALLOWED_DOMAINS="http://example.com,http://another-example.com"
DB_HOST='127.0.0.1'
DB_USER='root'
DB_PASS=''
DB_NAME='chat'
3. Run db/sync.js script to create database.
4. Run "npm start" or "npm run start-dev".

___

React application which uses this API is available <a href="https://github.com/b-galazka/chat-react-spa">here</a>.