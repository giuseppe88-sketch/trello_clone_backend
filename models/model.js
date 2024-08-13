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
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cards" }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    }, // Add userId to associate list with a user
    order: { type: Number, required: true }
  },
  { timestamps: true },

);

const cardSchema = mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lists",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "doing", "done", "inProgress", "inTesting", "closed"],
      default: "todo",
    },
    position: { type: Number, required: true },
    order: { type: Number, required: true }

  },
  { timestamps: true }
);

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let Users = mongoose.model("Users", userSchema);
let Lists = mongoose.model("Lists", listSchema);
let Cards = mongoose.model("Cards", cardSchema);

module.exports.Users = Users;
module.exports.Lists = Lists;
module.exports.Cards = Cards;
