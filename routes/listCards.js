const express = require("express");
const router = express.Router();
const passport = require("passport");
const { List, Card } = require("../model");

router.post(
  "/:listId/card",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newCard = new Card({
      listId: req.params.listId,
      userId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      position: req.body.position,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    newCard
      .save()
      .then((card) => {
        // Add the new card's ID to the list's cards array
        return List.findByIdAndUpdate(
          { _id: req.params.listId, userId: req.user._id },
          { $push: { cards: card._id } },
          { new: true }
        );
      })
      .then((list) => {
        res
          .status(201)
          .json({ message: "Card created and added to list", list });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

router.delete(
  "/:listId/card/:cardId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    List.findOne({ _id: req.params.listId, userId: req.user._id })
      .then((list) => {
        if (!list) {
          return res.status(404).send("List not found");
        }

        // Remove the card from the list
        list.cards = list.cards.filter(
          (card) => card.toString() !== req.params.cardId
        );

        return list.save();
      })
      .then((updatedList) => {
        res
          .status(200)
          .json({ message: "Card deleted successfully", updatedList });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

module.exports = router;
