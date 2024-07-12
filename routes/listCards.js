const express = require("express");
const router = express.Router();
const passport = require("passport");
const { List, Card } = require("../models/model");

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
router.delete(
  "/:listId/card/:cardId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Find the list that matches the listId and belongs to the authenticated user
      const list = await List.findOne({ _id: req.params.listId, userId: req.user._id });
      
      // Check if the list exists
      if (!list) {
        console.log('List not found');
        return res.status(404).send("List not found");
      }

      // Log the cards before deletion
      console.log('Cards before deletion:', list.cards);

      // Filter out the card to be deleted from the list's cards array
      list.cards = list.cards.filter(
        (card) => card.toString() !== req.params.cardId
      );

      // Log the cards after deletion
      console.log('Cards after deletion:', list.cards);

      // Save the updated list back to the database
      const updatedList = await list.save();

      // Check if the list was updated
      if (!updatedList) {
        console.log('Failed to save updated list');
        return res.status(500).send("Failed to save updated list");
      }

      // Respond with a success message and the updated list
      console.log('Card deleted successfully');
      return res.status(200).json({ message: "Card deleted successfully", updatedList });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).send("Error: " + err);
    }
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
