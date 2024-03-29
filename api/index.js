const express = require("express");
const { Server } = require("socket.io");
const app = express();
app.use(express.json());
const http = require("http");
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcrypt");
const saltRounds = 10;
const short = require("shortid");
const dotenv = require("dotenv");
dotenv.config();

const server = http.createServer(app);

const db = require("./_helpers/db");
const groupChat = db.GroupChat;
const users = db.Users;
const groups = db.Groups;
const url = process.env.ORIGIN;

const io = new Server(server, {
  cors: { origin: '*', methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log('connection establish')
  console.log(socket.id)
  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    try {
      // Retrieve entire message history from the database for the specific room
      const messages = await groupChat.find({ roomId });
      console.log(messages)
      socket.emit(
        "messageHistory",
        messages.sort((x, y) => x.timestamp - y.timestamp)
      );
    } catch (error) {
      console.error("Error fetching message history:", error);
    }
  });
});

io.on("disconnect", (socket) => {
  console.log("User disconnected", stream.id);
});

app.post("/api/sendMessage", async (req, res) => {
  const { roomId, message, senderId } = req.body;
  console.log(roomId,message,senderId)
  try {
    if (senderId != undefined) {
      const newMessage = {
        roomId,
        message,
        senderId,
        timestamp: Date.now(),
        like: [],
      };

      const chat = new groupChat(newMessage);
      const result = await chat.save();
      console.log(result)
      // Broadcast the new message to all clients in the same room
      io.to(roomId).emit("message", {
        _id: result._id,
        createdAt: result.createdAt,
        updatedOn: result.updatedOn,
        isActive: true,
        roomId:roomId,
        ...newMessage,
      });

      // Send the saved message back in the response
      return res.status(200).json({
        _id: result._id,
        createdAt: result.createdAt,
        updatedOn: result.updatedOn,
        isActive: true,
        roomId:roomId,
        ...newMessage,
      });
    }
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/createUser", async (req, res) => {
  const { userId, password, firstName, lastName, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUsers = await users.find({ userId: userId });
    if (existingUsers.length == 0) {
      const userInput = {
        userId,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        timestamp: Date.now(),
      };
      const user = new users({ isActive: true, ...userInput });
      const result = await user.save();
      delete userInput.password;
      return res.status(200).json({
        data: {
          _id: result._id,
          createdAt: result.createdAt,
          updatedOn: result.updatedOn,
          isActive: true,
          ...userInput,
        },
        message: `User ${userInput.firstName} created successfully`,
      });
    } else {
      return res
        .status(200)
        .json({ message: `User already exists ${existingUsers[0].userId}` });
    }
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/api/updateUserInfo", async (req, res) => {
  const { Id, password, firstName, lastName, role } = req.body;
  console.log(firstName)
  try {
    // specify the criteria to find the user
    const updatedValues = {
      $set: {
        firstName: firstName,
        lastName: lastName,
        role: role
      },
    };

    const result = await users.findOneAndUpdate(
      { _id: Id },
      updatedValues,
      { new: true }
    );
    console.log("result",result);
    return res.status(200).json({
      data: {
        _id: result._id,
        createdAt: result.createdAt,
        updatedOn: result.updatedOn,
        firstname: result.firstName,
        lastName: result.lastName,
        role: result.role,
        userId: result.userId,
      },
      message: `User ${firstName} edited successfully`,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/userById", async (req, res) => {
  const {id } = req.headers;
  try {
    const result = await users.find(
      { _id: id },
    );
    console.log("result",result);
    return res.status(200).json({ data: result[0], message: "Users fetched succesfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete("/api/deleteUser", async (req, res) => {
  const { id } = req.headers;
  console.log(id)

  try {
    // specify the criteria to find the user
     await users.findOneAndDelete(
      { _id: id }
    );
    return res.status(200).json({
      data: {
        _id: id,
      },
      message: `User deleted`,
    });
  } catch (error) {
    console.error("Error deleting", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/getUserList", async (req, res) => {
  const usersList = await users.find({}, { password: 0 });
  try {
    return res
      .status(200)
      .json({ data: usersList, message: "Users fetched succesfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { userId, password } = req.body;
  console.log(userId,password)
  if (userId == "admin" && password == "admin") {
    res.status(200).json({
      message: "Login successful!",
      user: {
        userId: "adminrik",
        password: "adminrik",
        role: "admin",
        firstName: "Admin",
        lastName: "",
      },
    });
  } else {
    const existingUser = await users.findOne({ userId: userId });
    if (existingUser) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (isPasswordMatch) {
        res
          .status(200)
          .json({ message: "Login successful!", user: existingUser });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  }
});

// Groups

app.post("/api/createGroup", async (req, res) => {
  const { groupName, creatorId, participants } = req.body;
  console.log(req.body)
  const groupInput = {
    roomId: short.generate(),
    groupName,
    participants,
    creatorId,
    timestamp: Date.now(),
    isActive: true,
  };
  const group = new groups({ ...groupInput });
  const result = await group.save();
  io.emit("groupCreated", {
    _id: result._id,
    createdAt: result.createdAt,
    updatedOn: result.updatedOn,
    isActive: true,
    ...groupInput,
  });
  return res.status(200).json({
    data: {
      _id: result._id,
      createdAt: result.createdAt,
      updatedOn: result.updatedOn,
      isActive: true,
      ...groupInput,
    },
    message: `Group ${groupInput.groupName} created successfully`,
  });
});

app.get("/api/getGroupList/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  var groupList = [];
    groupList = await groups.find({ _id: groupId });

  return res.status(200).json({
    data: groupList,
    message: "Group list fetched successfully",
  });
});

app.get("/api/getGroupListForUser/:userId", async (req, res) => {
  const userId = req.params.userId;

  const groupList = await groups.find({ participants: { $in: [userId] } });

  return res.status(200).json({
    data: groupList,
    message: "Group list fetched successfully",
  });
});

//add participant in group or remove
app.patch("/api/addParticipants", async (req, res) => {
  const { participants, roomId } = req.body; // Assuming emails is an array of email addresses sent in the request body

  try {
    // Find the group by roomId and update the participants array with the new emails
    var query = {
      $set: { participants: participants },
      timestamp: Date.now(),
    };

    const updatedGroup = await groupChat.findOneAndUpdate(
      { roomId: roomId },
      query, //
      { new: true }
    );

    if (updatedGroup) {
      res.json(updatedGroup);
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch("/api/updateMessage", async (req, res) => {
  const { participant, roomId, _id, add } = req.body; // Assuming emails is an array of email addresses sent in the request body

  try {
    // Find the group by roomId and update the participants array with the new emails
    var query = {};
    if (add) {
      query = {
        $push: { like: { $each: [participant] } },
      };
    } else {
      query = {
        $pull: { like: participant }, // Remove the specified participant from the 'like' array
        // Update the timestamp
      };
    }

    const updatedGroup = await groupChat.findOneAndUpdate(
      { roomId: roomId, _id: _id },
      query, //
      { new: true }
    );

    if (updatedGroup) {
      io.to(roomId).emit("updateMessage", {
        ...updatedGroup,
      });
      res.json(updatedGroup);
    } else {
      res.status(404).json({ message: "Message not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//delete group
app.delete("/api/deleteGroup/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  try {
    // Find the group by roomId and remove it from the database
    const deletedGroup = await groups.findOneAndDelete({ roomId: roomId });

    if (deletedGroup) {
      res.json({ message: "Group deleted successfully", deletedGroup });
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

server.listen(4001, () => {
  console.log("server started at 4001");
});
