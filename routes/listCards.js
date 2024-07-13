const express = require("express");
const router = express.Router();
const passport = require("passport");
const { List, Card } = require("../models/model");
const { validationResult } = require("express-validator");

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

router.put(
  "/:listId/card/:cardId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    List.findOne({ _id: req.params.listId, userId: req.user._id })
      .then((list) => {
        if (!list) {
          return res.status(404).send("List not found");
        } else {
          Card.findByIdAndUpdate(
            { _id: req.params.cardId },
            {
              title: req.body.title,
              description: req.body.description,
              position: req.body.position,
              updatedAt: new Date(),
            },
            { new: true }
          )
            .then((updatedCard) => {
              if (!updatedCard) {
                return res.status(404).send("Card not found");
              }
              res.status(200).json({ message: "Card updated", updatedCard });
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send("Error: " + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.delete(
  "/api/:listId/card/:cardId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { listId, cardId } = req.params;
    const userId = req.user._id;

    console.log(
      `Received delete request: listId=${listId}, cardId=${cardId}, userId=${userId}`
    );

    List.findOneAndUpdate(
      { _id: listId, userId },
      { $pull: { cards: cardId } },
      { new: true, useFindAndModify: false }
    )
      .then((result) => {
        if (!result) {
          console.log(
            `List not found or card not found in the list: listId=${listId}, cardId=${cardId}`
          );
          return res
            .status(404)
            .send("List not found or card not found in the list");
        }
        console.log(`Card deleted successfully: ${JSON.stringify(result)}`);
        res.status(200).json({ message: "Card deleted successfully", result });
      })
      .catch((err) => {
        console.error(`Error deleting card: ${err}`);
        res.status(500).send("Error: " + err);
      });
  }
);

// router.delete(
//   "/:listId/card/:cardId",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     List.findOne({ _id: req.params.listId, userId: req.user._id })
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

module.exports = router;
