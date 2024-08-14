const express = require("express");
const router = express.Router();
const passport = require("passport");
const { Lists } = require("../models/model");

// Get all lists
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Lists.find({ userId: req.user._id })
      .then((lists) => res.status(200).json(lists))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Error fetching lists", error: err });
      });
  }
);

// Get a list by IDs
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Lists.findOne({ _id: req.params.id, userId: req.user._id })
      .then((list) => {
        if (!list) {
          return res.status(404).json({ message: "List not found" });
        }
        res.status(200).json(list);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Error fetching list", error: err });
      });
  }
);

// POST/PUT ENDPOINT

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Lists.find({ userId: req.user._id }).then((list) => {
      const request = req.body.title;
      const requestId = request.user.id;
      const existingList = list.find((item) => item.title === request);

      if (existingList) {
        return res.status(400).json({
          message: "There is already a list created with the title " + request,
        });
      }
      
      const listCount = Lists.countDocuments({ userId: req.user._id });
      
      const newList = new Lists({
        title: req.body.title,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: req.user._id, // Ensure the list is associated with the authenticated user
        order: listCount, // Ensure the list has the correct order number
      });
      newList
        .save()
        .then((list) => {
          res.status(201).json(list);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    });
  }
);
router.put(
  "/:ID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Lists.findByIdAndUpdate(
      { _id: req.params.ID, userId: req.user._id },
      {
        title: req.body.title,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .then((list) => {
        if (!list) {
          return res.status(404).send("List not found");
        }
        res.status(200).json(list);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// DELETE
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Lists.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
      .then((deletedList) => {
        if (!deletedList) {
          return res.status(404).send("List not found");
        }
        res
          .status(200)
          .json({ message: "List deleted successfully", deletedList });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

module.exports = router;
