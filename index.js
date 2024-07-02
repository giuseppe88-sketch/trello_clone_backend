const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

const cors = require("cors");
const mongoose = require("mongoose");
const { Users, List, Card } = require("./model");
const usersRouter = require("./routes/users"); // Import the users routes
const listsRouter = require("./routes/list"); // Import the lists routes
const listsCardsRouter = require("./routes/listCards"); // Import the lists routes
const cardsRouter = require("./routes/cards"); // Import the lists routes

const uuid = require("uuid");

// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const auth = require("./auth")(app);
require("./passport");

app.use(morgan("common"));

let allowedOrigins = ["http://localhost:8080", "http://testsite.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

app.use("/api/users", usersRouter);
app.use("/api/lists", listsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/lists/:listId", listsCardsRouter);

// mongoose.connect('mongodb://localhost:27017/trelloDB', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb+srv://giuseppeadamo908:6Wcf8B3ifec2nxGc@trelloclone.6nnmqkb.mongodb.net/?retryWrites=true&w=majority&appName=trelloclone', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// respond with "hello world" when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("hello world");
});

// app.get(
//   "/api/card/",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Card.find()
//       .then((card) => {
//         res.status(200).json(card);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error:" + err);
//       });
//   }
// );

// app.get(
//   "/api/card/:ID",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Card.findOne({ _id: req.params.ID })
//       .then((CardId) => {
//         res.status(200).json(CardId);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error:" + err);
//       });
//   }
// );

// app.post(
//   "/api/list/:listId/card",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     const newCard = new Card({
//       listId: req.params.listId,
//       title: req.body.title,
//       description: req.body.description,
//       position: req.body.position,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     newCard
//       .save()
//       .then((card) => {
//         // Add the new card's ID to the list's cards array
//         return List.findByIdAndUpdate(
//           req.params.listId,
//           { $push: { cards: card._id } },
//           { new: true }
//         );
//       })
//       .then((list) => {
//         res
//           .status(201)
//           .json({ message: "Card created and added to list", list });
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

// app.put(
//   "/api/card/:ID",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Card.findByIdAndUpdate(
//       req.params.ID,
//       {
//         title: req.body.title,
//         description: req.body.description,
//         position: req.body.position,
//         updatedAt: new Date(),
//       },
//       { new: true }
//     )
//       .then((card) => {
//         if (!card) {
//           return res.status(404).send("Card not found");
//         }
//         res.status(200).json(card);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

// app.delete(
//   "/api/list/:listId/card/:cardId",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     List.findById(req.params.listId)
//       .then((list) => {
//         if (!list) {
//           return res.status(404).send("List not found");
//         }

//         // Remove the card from the list
//         list.cards = list.cards.filter(
//           (card) => card.toString() !== req.params.cardId
//         );

//         return list.save();
//       })
//       .then((updatedList) => {
//         res
//           .status(200)
//           .json({ message: "Card deleted successfully", updatedList });
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
