const express = require("express");
const router = express.Router();
const passport = require("passport");
const { List } = require("../model");

// Get all lists
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    List.find()
      .then((lists) => res.status(200).json(lists))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Error fetching lists", error: err });
      });
  }
);

// Get a list by ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    List.findById(req.params.id)
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
    List.find().then((list) => {
      const request = req.body.title;
      const existingList = list.find((item) => item.title === request);

      if (existingList) {
        return res.status(400).json({
          message: "There is already a list created with the title " + request,
        });
      }
      const newList = new List({
        title: req.body.title,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
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
    List.findByIdAndUpdate(
      req.params.ID,
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
    List.findByIdAndDelete(req.params.id)
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
