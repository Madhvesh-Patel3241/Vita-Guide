const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const EmployeeModel = require("./model/childdetail");
const PersonalDetails = require("./routes/personalDetails");
const path = require("path");
const feedbackRoutes = require("./routes/feedbackRoutes");
const vitaminRoutes = require("./routes/vitamins");
const Symptom = require("./model/symptom");
const symptomsRoutes = require("./routes/symptoms");
const DietPlan = require("./model/DietPlan");
const cookieParser = require("cookie-parser");
const vitaminSideEffects = require("./routes/vitaminSideEffects");
const vitamins = require("./routes/vitaminInfo");
const dietPlanRoutes = require("./routes/dietplan");
const { generateToken, verifyToken } = require("./utils/jwthelper");
const app = express();
const formRoutes = require("./routes/formRoutes");

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/employee")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Login endpoint
// app.post("/login", (req, res) => {
//     const { email, password } = req.body;
//     EmployeeModel.findOne({ email: email })
//         .then(user => {
//             if (user) {
//                 if (user.password === password) {
//                     res.json("Success");
//                 } else {
//                     res.status(401).json("The password is incorrect"); // 401 Unauthorized
//                 }
//             } else {
//                 res.status(404).json("No record existed"); // 404 Not Found
//             }
//         })
//         .catch(err => res.status(500).json({ error: err.message })); // Handle errors
// });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await EmployeeModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No record existed" });
    }

    // Direct password comparison
    if (user.password !== password) {
      return res.status(401).json({ error: "The password is incorrect" });
    }

    const token = generateToken(user._id, user.email);

    const userData = {
      _id: user._id,
      email: user.email,
      // Add other user fields as needed
    };
    console.log(token);

    res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register endpoint
app.post("/register", (req, res) => {
  EmployeeModel.create(req.body)
    .then((employees) => res.status(201).json(employees)) // 201 Created
    .catch((err) => res.status(400).json({ error: err.message })); // 400 Bad Request
});

// PersonalDetails route
app.use("/api/personal-details", PersonalDetails);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/symptoms", symptomsRoutes);

app.use("/api/vitamin-side-effects", vitaminSideEffects);

app.use("/api/vitamins", vitamins);

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.post("/send-email", (req, res) => {
  const { email } = req.body;

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use other email services as well
    auth: {
      user: "jishnum2017123@gmail.com", // Your Gmail email
      pass: "bxfyujamjxlqnwbe", // Your Gmail password (or app password)
    },
  });

  const mailOptions = {
    from: "jishnum2017123@gmail.com",
    to: email,
    subject: "Hello from VitaGuide",
    text: "Diet Plan",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email" });
    } else {
      return res.status(200).json({ message: "Email sent successfully!" });
    }
  });
});

app.use("/api/form", formRoutes);
app.post("/api/form", (req, res) => {
  console.log("Received form data:", req.body);
  res.status(200).json({ message: "Form submitted successfully!" });
});

app.listen(3001, () => console.log("Server running on port 3001"));

app.get("/api/symptoms", async (req, res) => {
  try {
    const symptoms = await Symptom.find({});
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to handle symptom submissions
app.post("/api/symptoms", async (req, res) => {
  try {
    const symptomData = new Symptom(req.body);
    await symptomData.save();

    // Predict deficiencies based on symptoms
    const deficiencyPrediction = predictDeficiency(req.body.signsSymptoms);

    res.status(201).json({
      message: "Data saved successfully",
      deficiencies: deficiencyPrediction,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to save data", details: error.message });
  }
});

// Function to predict deficiencies based on symptoms
// Function to predict deficiency based on symptoms
const predictDeficiency = (symptoms) => {
  const deficiencies = [];

  if (
    symptoms.fatigue ||
    symptoms.paleSkin ||
    symptoms.paleConjunctiva ||
    symptoms.frequentBruising ||
    symptoms.restlessLegsSyndrome
  ) {
    deficiencies.push("Iron Deficiency");
  }

  if (
    symptoms.drySkin ||
    symptoms.hairLoss ||
    symptoms.brittleNails ||
    symptoms.frequentHeadaches ||
    symptoms.jointPain
  ) {
    deficiencies.push("Vitamin D Deficiency");
  }

  if (
    symptoms.moodChanges ||
    symptoms.poorAppetite ||
    symptoms.frequentColds ||
    symptoms.swollenGums
  ) {
    deficiencies.push("Vitamin B12 Deficiency");
  }

  if (
    symptoms.slowGrowth ||
    symptoms.noWeightGain ||
    symptoms.delayedWalking ||
    symptoms.sensitivityToLight
  ) {
    deficiencies.push("Vitamin A Deficiency");
  }

  if (symptoms.diarrhea || symptoms.constipation || symptoms.skinRashes) {
    deficiencies.push("Fiber Deficiency");
  }

  if (symptoms.lowAttentionSpan || symptoms.squinting || symptoms.jointPain) {
    deficiencies.push("Omega-3 Fatty Acids Deficiency");
  }

  if (symptoms.muscleCramps || symptoms.insomnia) {
    deficiencies.push("Magnesium Deficiency");
  }

  return deficiencies.length
    ? deficiencies
    : ["No specific deficiency detected"];
};

app.post("/api/diet-plan", async (req, res) => {
  try {
    const dietData = new DietPlan(req.body);
    await dietData.save();

    const generatedPlan = generateDietPlan(req.body.vitaminDeficiency);

    res.status(201).json({
      message: "Diet data saved successfully",
      dietPlan: generatedPlan,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to save data", details: error.message });
  }
});

app.use("/api/vitamins", vitaminRoutes);

// Start server
