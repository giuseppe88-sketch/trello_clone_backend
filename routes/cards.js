const express = require("express");
const router = express.Router();
const passport = require("passport");
const { Card } = require("../model");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    List.find({ userId: req.user._id })
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
    List.findOne({ _id: req.params.id, userId: req.user._id })
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
    Card.findByIdAndUpdate(
      { _id: req.params.ID, userId: req.user._id },
      {
        title: req.body.title,
        description: req.body.description,
        position: req.body.position,
        updatedAt: new Date(),
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
