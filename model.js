const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
});

const listSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Add userId to associate list with a user

  },
  { timestamps: true }
);

const cardSchema = mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
    position: { type: Number, required: true },
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

let Users = mongoose.model("Users", userSchema);
let List = mongoose.model("List", listSchema);
let Card = mongoose.model("Card", cardSchema);

module.exports.Users = Users;
module.exports.List = List;
module.exports.Card = Card;
