const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const BackendError = require("../classes/backendError");

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB, the client's guides are about 0.3-1 MB

// guide PDFs are first saved to uploads/tmp (cleaned nightly) with a random name,
// the controller checks them and moves them to data/guides
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, "../../data/uploads/tmp"));
        },
        filename: (req, file, cb) => {
            cb(null, randomUUID() + ".pdf");
        }
    }),
    limits: { fileSize: MAX_FILE_SIZE, files: 2 },
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
        cb(isPdf ? null : new BackendError(400, "Only PDF files are allowed."), isPdf);
    }
}).fields([
    { name: "file_fi", maxCount: 1 },
    { name: "file_sv", maxCount: 1 }
]);

// turn multer's errors (too large file etc.) into 400 responses instead of generic 500
const guideUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (!err) return next();
        if (err instanceof BackendError) return next(err);
        if (err.code === "LIMIT_FILE_SIZE") return next(new BackendError(400, "PDF file is too large (max 20 MB)."));
        if (err instanceof multer.MulterError) return next(new BackendError(400, "Invalid file upload."));
        next(err);
    });
};

module.exports = guideUpload;
