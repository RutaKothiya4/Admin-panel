require("dotenv").config();
const express = require("express");
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const postRoutes = require("./routes/postRoutes");

const cors = require("cors");
const path = require("path");

dbConnect(); // Connect to MongoDB

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "client", "public", "uploads"))
);

app.get("/client/public/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(
    __dirname,
    "../../client/public/uploads/",
    filename
  );

  res.sendFile(filepath, (err) => {
    if (err) {
      console.error("File send error:", err);
      res.status(404).send("Image not found");
    }
  });
});

// Enable CORS for React app with credentials support
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/quotes", postRoutes);

// Centralized error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});
