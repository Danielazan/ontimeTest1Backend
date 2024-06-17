
const http = require('http')
const uuidv4 = require('uuid').v4
const { WebSocketServer } = require('ws')
const express = require('express');
const sequelize = require('./database')
const url = require('url')
const Teams = require("./Routes/Teams")
const cors = require("cors")
require("dotenv").config()
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cors())
// app.use(helmet())
app.use(express.json())
app.use(express.static("public"))


app.use("/api",Teams)

const server = http.createServer(app);

const wsServer = new WebSocketServer({ server })

const connections = []

let messagess = {}

const rooms = new Map();
const clients = new Map();

const Rooms=[]

const broadcast = (ws, msg, roomId) => {
  // Iterate through connections in the specified room
  for (const connection of rooms.get(roomId) || []) {
    // Send message only to connections in the same room (excluding sender)
    if (connection !== ws) {
      // connection.send(JSON.stringify(msg));
      connection.send(JSON.stringify({ type: 'incoming_Message', roomId,message:msg }));
    }
  }
  console.log('Message sent to room:', roomId);
}

function createRoom(ws, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  // rooms.get(roomId).add(ws);
  // ws.send(JSON.stringify({ type: 'roomCreated', roomId }));

  console.log(ws)
}

function createRoom(ws, roomId) {
  if (!Rooms) {
    Rooms=[]
  }

  Rooms.push(
    {
      Name:roomId
    }
  )
  // rooms.get(roomId).add(ws);
  // ws.send(JSON.stringify({ type: 'roomCreated', roomId }));

  console.log(ws)
}

function joinRoom(ws, roomId, id) {
  // Ensure rooms data structure exists
  if (!rooms) {
    rooms = new Map(); // Initialize rooms as a Map
  }

  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set()); // Create a Set for clients in the room
  }

  // Add client to the room
  rooms.get(roomId).add(ws);

  // Send joinedRoom message to the joining client
  ws.send(JSON.stringify({ type: 'joinedRoom', roomId }));

  // Send newPeer messages to other clients, excluding the joining client
  for (const client of rooms.get(roomId)) {
    
    if (client !== ws) {
      client.send(JSON.stringify({ type: 'newPeer', clientId: ws.id }));
    }
    
    // console.log(client)

    console.log("this is the websocket id",ws.id)
  }
}

function leaveRoom(ws, roomId) {
  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(ws);
    otherClientsInRoom(roomId, ws).forEach(client => {
      client.send(JSON.stringify({ type: 'peerDisconnected', clientId: ws.id }));
    });
  }
}

const login = (msg, user, ws) => {
  // Validate user ID (optional for security)
  let userId = "";
  console.log("message is", msg);

  userId = msg.username;

  // Prepare login notification message

  const loginMessage = {
    type: "loggedIn", // Identify message type for differentiation
    userId,
  };

  console.log("userid is", userId);

  const jsonData = JSON.stringify(loginMessage);

  // const connection =connections[userId]

  // Object.keys(connections).forEach(id => {
  //   const connection = connections[23];

  //   const connn= ws[id]

  //   connections.send(jsonData);

  // });

  connections.map((users) => {
    if (users.id !== userId) {
      users.send(jsonData);

      console.log(`Login notification sent to user: ${userId}`);
    }
  });
};

// const senndOffer = (msg) => {
//   console.log("userto call",msg.name)

// userToCall =msg.name

// mainMessage ={
//         type: "offer",
//         offer: msg.offer,
//         caller: msg.caller
//       }

//  connections.map((users) => {
//     if (users.id == userToCall) {
//       users.send(JSON.stringify(mainMessage));

//       console.log(`offer sent to user: ${userToCall}`);
//     }
//   });
// };


let isFirstOfferSent = false;
const senndOffer = (msg) => {
  
  console.log("User to call:", msg.name);

  userToCall = msg.name;

  mainMessage = {
    type: "offer",
    offer: msg.offer,
    caller: msg.caller
  };

  connections.map((users) => {
    if (users.id == userToCall) {
      if (isFirstOfferSent) {
        // Send the second offer
        users.send(JSON.stringify(mainMessage));
        console.log(`Second offer sent to user: ${userToCall}`);
        isFirstOfferSent = false;
      } else {
        // Handle the first offer differently if needed
        console.log("First offer sent to user: ", userToCall);
        isFirstOfferSent = true;
      }
    }
    console.log(isFirstOfferSent)
  });
};

const senndVOffer = (msg) => {
  
  console.log("User to call:", msg.name);

  userToCall = msg.name;

  mainMessage = {
    type: "V-offer",
    offer: msg.offer,
    caller: msg.caller
  };

  connections.map((users) => {
    if (users.id == userToCall) {
      if (isFirstOfferSent) {
        // Send the second offer
        users.send(JSON.stringify(mainMessage));
        console.log(`Second offer sent to user: ${userToCall}`);
        isFirstOfferSent = false;
      } else {
        // Handle the first offer differently if needed
        console.log("First offer sent to user: ", userToCall);
        isFirstOfferSent = true;
      }
    }
    console.log(isFirstOfferSent)
  });
};

const Answer =(msg)=>{
  console.log("to call",msg.name)

  const ToAns = msg.name


  const message={ 
    type: "answer", 
    answer: msg.answer 
  }

  
  connections.map((users) => {
    if (users.id == ToAns) {
      users.send(JSON.stringify(message));

      console.log(`annser sent to user: ${ToAns}`);
    }
  });
}

const icecandidate = (msg)=>{

  const message={
    type: "candidate",
    candidate: msg.candidate,
    from: msg.name,
  }  
      
    
  connections.map((users) => {
    if (users.id == msg.name) {
      users.send(JSON.stringify(message));

      console.log(`candiate sent to user: ${msg.name}`);
    }
  });

  console.log("candiates=======>",msg.name)
}


const chatMessages=(msg)=>{
  console.log(msg)
}

wsServer.on('connection', (connection, request) => {
  const { userName } = url.parse(request.url, true).query

  const uuid = uuidv4()

  console.log(userName)
  connection.id=userName

  // connections[userName] = connection
  connections.push(connection)

  // console.log(connections)

  connection.on('message', function incoming (message) {
    // console.log('received: %s', message);

    // broadcast(message)


    const data = JSON.parse(message);
    console.log("Received message:", data);

    // const { type, payload, roomId } = data;


    // connection.id=userName

    // console.log(type)

    switch (data.type) {
      case 'JoinRoom':
        joinRoom(connection, data.roomId, connection.id);
        // console.log("data or message recieved is", data.roomId)
        break;
      case 'CreateRoom':
        createRoom(connection, roomId);
        break;
      case "chat_message":
        mes= data.message
        console.log("chat message=====",mes)
        broadcast(connection,mes, data.roomid)
        break;
      case "login":
        let mesg = { type: "user_joined", username: data.name };

        login(mesg, connection.id, connection);

        break;

      case "offer":
        senndOffer(data);
        

        break;

        case "V-offer":
          senndVOffer(data);
          
  
          break;

      case "answer":
        Answer(data);
        
        break;

        
      case "candidate":

        icecandidate(data)
        
        break;
      case "leave":
          delete clients[ws.remoteAddress];
          broadcast({ type: "user_left", username: data.name });
          break;
      
     default:
        console.log('Invalid messa ge type');
    }

    
  })
})



sequelize.sync().then(()=>{
  server.listen(process.env.PORT,(req,res)=>{
      console.log(`Listening at port ${process.env.PORT} websocket also connected`)
  })
})

