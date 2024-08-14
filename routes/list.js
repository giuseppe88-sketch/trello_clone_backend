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
      const existingList = list.find((item) => item.title === request);

      if (existingList) {
        return res.status(400).json({
          message: "There is already a list created with the title " + request,
        });
      }
      
      const listCount = list.length;
      
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


router.put(
  "/reorder/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const listId = req.params.id;
      const newOrder = req.body.order; // The new desired order for this list

      // Fetch the list to be reordered
      const listToUpdate = await Lists.findOne({ _id: listId, userId: req.user._id });

      if (!listToUpdate) {
        return res.status(404).send("List not found");
      }

      // Fetch all lists belonging to the user, sorted by order
      const lists = await Lists.find({ userId: req.user._id }).sort('order');

      // Determine the current position of the list
      const currentOrder = listToUpdate.order;

      if (newOrder === currentOrder) {
        // If the new order is the same as the current one, there's nothing to change
        return res.status(200).json(listToUpdate);
      }

      // Remove the list from its current position
      const remainingLists = lists.filter(list => list._id.toString() !== listId);

      // Insert the list at the new position
      remainingLists.splice(newOrder, 0, listToUpdate);

      // Update the order of all lists
      for (let i = 0; i < remainingLists.length; i++) {
        remainingLists[i].order = i;
        await remainingLists[i].save();
      }

      // Update the title and timestamp of the reordered list
      // listToUpdate.title = req.body.title;
      // listToUpdate.updatedAt = new Date();
      await listToUpdate.save();

      res.status(200).json(listToUpdate);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
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
