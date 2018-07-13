# Gati_BattleShips_NON_MPC
A web-based 2-player BattleShip Game written in JavaScript and html. No secure multi-party computing (MPC) added.

## Installation
Run npm in the command line from inside the project directory to automatically install the dependencies listed in `package.json`:

```npm install```

## Running the Game
Run a server in the command line by going to the project directory and running
```node server.js```
The output from the server will direct you to open `localhost:5000` in a browser
* The two players must open `localhost:500` in seperate windows/tabs
* 1 player creates the room and recieves a room code
* The other player joins that room with the room code
* Only two players can be in one game room
* You can only join a game that has already been created by another player
Game instructions are displayed in the teal strip at the top of the browser window

## Requirements
### Server
Running the server requires Node, npm, and Express

### Client
Running the client requires socket.io
