// // routes/personalDetails.js

// const express = require('express');
// const router = express.Router();
// const PersonalDetails = require('../model/PersonalDetails'); // Updated the import

// // POST: Save personal details
// router.post('/', async (req, res) => {
//     try {
//         const newPersonalDetails = new PersonalDetails(req.body);
//         await newPersonalDetails.save();
//         res.status(201).json(newPersonalDetails); // Return the saved data
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const PersonalDetails = require("../model/PersonalDetails");
const multer = require("multer");
const path = require("path");

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Store files in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
    }
});

const upload = multer({ storage: storage });

// Route for uploading personal details
router.post("/", upload.single('image'), async (req, res) => {
  try {
     // Check if username or email already exists
     const existingUser = await PersonalDetails.findOne({ username: req.body.username });
     if (existingUser) {
         return res.status(400).json({ message: `Username '${req.body.username}' already exists. Please choose another one.` });
     }

     const existingEmail = await PersonalDetails.findOne({ email: req.body.email });
     if (existingEmail) {
         return res.status(400).json({ message: `Email '${req.body.email}' is already registered. Please use a different email.` });
     }

      const personalDetails = new PersonalDetails({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
          password: req.body.password, // Hash this in production
          dob: req.body.dob,
          gender: req.body.gender,
          pinCode: req.body.pinCode,
          city: req.body.city,
          state: req.body.state,
          phoneNumber: req.body.phoneNumber,
          anotherPhone: req.body.anotherPhone,
          image: req.file.path // Save the path to the uploaded image
      });

      await personalDetails.save();
      res.status(201).json({ message: "Personal details saved successfully!" });
  } catch (error) {
      console.error("Error saving personal details:", error); // Log the error
      res.status(500).json({ error: error.message });
  }
});
// Route to fetch personal details by userId
router.get("/", async (req, res) => {
    const userId = req.query.userId; // Ensure `userId` is passed in the frontend request

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const userDetails = await EmployeeModel.findById(userId); // Confirm EmployeeModel is correct
        if (userDetails) {
            res.json(userDetails);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;
