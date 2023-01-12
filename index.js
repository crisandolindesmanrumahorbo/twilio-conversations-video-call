require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;
const express = require("express");
const cors = require('cors')
const app = express();
const port = 5000;


app.use(cors())
// use the Express JSON middleware
app.use(express.json());

// create the twilioClient
const twilioClient = require("twilio")(
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

const addParticipant = async (username, conversationSid) => {
  const participant = await twilioClient.conversations.conversations(conversationSid)
      .participants.create({ identity: username });
  console.log(`add participant ${JSON.stringify(participant)}`);
};

const createConversation = async (username, roomName) => {
  if (roomName && username) {
    const conversation = await twilioClient.conversations.conversations
        .create({ friendlyName: roomName });
    console.log(`create conversation ${JSON.stringify(conversation)}`);
    const participant = await twilioClient.conversations.conversations(conversation.sid)
        .participants.create({ identity: username })
    console.log(`create participant ${JSON.stringify(participant)}`);
  } else {
    console.log(`kosong ${JSON.stringify(roomName + ' ' +username)}`);
    throw error;
  }
};

const findOrCreateRoom = async (username, roomName, conversationSid) => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    const room = await twilioClient.video.rooms(roomName).fetch();
    console.log(`room ${JSON.stringify(room)}`);
    const participant = await addParticipant(username, conversationSid);
    console.log(`participant ${JSON.stringify(participant)}`);
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: "go",
      });
      await createConversation(username, roomName);
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName, username) => {
  // create an access token
  const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      // generate a random unique identity for this participant
      { identity: username }
  );
  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: roomName,
  });
  const chatGrant = new ChatGrant({
    serviceSid: process.env.DEFAULT_CONVERSATIONS_SERVICE_SID,
  });

  // add the video grant
  token.addGrant(videoGrant);
  token.addGrant(chatGrant);
  // serialize the token and return it
  return token.toJwt();
};

app.post("/join-room", async (req, res) => {
  // return 400 if the request has an empty body or no roomName
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }
  const roomName = req.body.roomName;
  const username = uuidv4();
  const conversationSid = req.body.conversationSid;
  // find or create a room with the given roomName
  await findOrCreateRoom(username, roomName, conversationSid);
  // generate an Access Token for a participant in this room
  const token = getAccessToken(roomName, username);
  res.send({
    token: token,
  });
});

app.post("/room-complete", async (req, res) => {
  // return 400 if the request has an empty body or no roomName
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }
  const roomName = req.body.roomName;
  const room = await getRoomByUniqueName(roomName);
  const status = (await completeRoom(room.sid)).status;
  res.send({
    status: status,
  });
});

const getRoomByUniqueName = async (roomName) => {
  return await twilioClient.video.rooms(roomName).fetch();
}

const completeRoom = async (roomSid) => {
  return await twilioClient.video.rooms(roomSid)
      .update({status: 'completed'});
}

// Start the Express server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});