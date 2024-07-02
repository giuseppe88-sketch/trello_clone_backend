const express = require("express");
const router = express.Router();
const passport = require("passport");
const { Card } = require("../model");


router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Card.find()
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
    "/api/card/:ID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Card.findOne({ _id: req.params.ID })
        .then((CardId) => {
          res.status(200).json(CardId);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error:" + err);
        });
    }
  );

  router.post(
    "/:listId/card",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const newCard = new Card({
        listId: req.params.listId,
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
            req.params.listId,
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
    "/:ID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Card.findByIdAndUpdate(
        req.params.ID,
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

  router.delete(
    "/:listId/card/:cardId",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      List.findById(req.params.listId)
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
