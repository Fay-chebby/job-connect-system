const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved inside the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
    // This ensures unique filenames by prefixing current timestamp
  },
});

//  does File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file input
  } else {
    cb(
      new Error("Only .jpeg, .jpg, .png, and .pdf formats are allowed"),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
