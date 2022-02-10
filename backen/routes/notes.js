const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//route 1 get all the notes using GET : /api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
});

//route 2 get add a new note using POST : /api/notes/addnote
router.post("/addnote",fetchuser,[
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a vali email").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
        });
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
  }
);



//route 3 get add a new note using PUT : /api/notes/updatenote
router.put("/updatenote/:id",fetchuser,async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};


        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        // fin the note to be upate
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("not foun")
        }
        if(note.user.toString() !== req.user.id){
            return res.status(404).send("not allowe")
        }
        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json(note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
  }
);


//route 4 delete a note using delete : /api/notes/deletenote
router.delete("/deletenote/:id",fetchuser,async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};

        // fin the note to delete
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("not foun")
        }

        // allow deletetion if user owns this note
        if(note.user.toString() !== req.user.id){
            return res.status(404).send("not allowe")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success" : "Note has been deleted", note : note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
  }
);

module.exports = router;
