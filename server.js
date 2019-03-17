const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

const Pusher = require("pusher");

// Initialize pusher with appId, key & secret
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: process.env.PUSHER_APP_ENCRYPTED
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// API route to which the chat messages will be sent to!
app.post("/message/send", (req, res) => {
  // 'private' is prefixed to indicate that this is a private channel
  pusher.trigger("private-reactchat", "messages", {
    message: req.body.message,
    username: req.body.username
  });

  res.sendStatus(200);
});

// API route used by Pusher as a way of authenticating users

app.post("/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});

// Set port to be used by NodeJS
app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), () => {
  console.log(`Node app is running on port ${app.get("port")}`);
});
