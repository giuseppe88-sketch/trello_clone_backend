const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend's URL
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true, // Allow cookies to be sent with requests
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
const bodyParser = require("body-parser");
const morgan = require("morgan");

const mongoose = require("mongoose");
const usersRouter = require("./routes/users"); // Import the users routes
const listsRouter = require("./routes/list"); // Import the lists routes
const listsCardsRouter = require("./routes/listCards"); // Import the lists routes
const cardsRouter = require("./routes/cards"); // Import the lists routes

require("uuid");

// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require("./middlewares/auth")(app);
require("./middlewares/passport");

app.use(morgan("common"));

let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:5173",
];

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
app.use("/api/listsCards", listsCardsRouter);

mongoose.set('debug', true)
// mongoose.connect('mongodb://localhost:27017/trelloDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// respond with "hello world" when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("hello world");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
