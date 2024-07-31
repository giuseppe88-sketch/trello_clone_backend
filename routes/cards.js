const express = require("express");
const router = express.Router();
const passport = require("passport");
const { Cards } = require("../models/model");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Cards.find({ userId: req.user._id })
      .then((card) => {
        res.status(200).json(card);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

router.get(
  "/card/:ID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Cards.findOne({ _id: req.params.ID, userId: req.user._id })
      .then((CardId) => {
        res.status(200).json(CardId);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

router.put(
  "/:ID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Cards.findByIdAndUpdate(
      { _id: req.params.ID, userId: req.user._id },
      {
        title: req.body.title,
        description: req.body.description,
        position: req.body.position,
        updatedAt: new Date(),
        position: req.body.position,
        listId: req.body.listId,
      },
      { new: true }
    )
      .then((card) => {
        if (!card) {
          return res.status(404).send("Card not found");
        }
        res.status(200).json(card);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

module.exports = router;
