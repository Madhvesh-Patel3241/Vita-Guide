// routes/formRoutes.js
const express = require("express");
const Form = require("../model/FormModel");
const multer = require("multer");

const sendEmail = require("../utils/emailService");
const questions = require("../model/questions.js"); // ✅ Use require()

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/"; // ✅ Files will be saved in 'uploads/' folder
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
}); // Stores file in memory (optional: use diskStorage for saving to disk)
const upload = multer({ storage: storage });

// Route to get the questionnaire dynamically
router.get("/questions", (req, res) => {
  res.json(questions);
});

router.post(
  "/submitVaccinationFile",
  upload.single("file"),
  async (req, res) => {
    console.log("Submit Vaccination File", req.file);
  }
);

router.post("/submit", async (req, res) => {
  try {
    const newForm = new Form(req.body.submitData);
    console.log(req.body);
    await newForm.save();

    // Send email to admin
    // const adminEmail = "admin@example.com";
    // await sendEmail(
    //   adminEmail,
    //   "New Form Submission",
    //   JSON.stringify(req.body, null, 2)
    // );

    // // Send thank you email to user
    // await sendEmail(
    //   req.body.contactDetails.email,
    //   "Thank You for Your Submission",
    //   "Thank you for filling out the form. We will contact you soon."
    // );

    res
      .status(201)
      .json({ message: "Form submitted successfully and emails sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/responses", async (req, res) => {
  try {
    const responses = await Form.find();
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
