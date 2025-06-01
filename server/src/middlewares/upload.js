const multer = require("multer");
const path = require("path");

// Configure storage destination and filename format
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "client", "public", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-profilePhoto${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// Allow only specific image MIME types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, PNG, and WEBP image files are allowed"),
      false
    );
  }
  cb(null, true);
};

// Multer configuration with 2MB file size limit
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

module.exports = upload;
