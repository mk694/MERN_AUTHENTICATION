import fs from "fs";

const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ message: "No files found" });
    const file = req.files.file;

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      removeTmp(file.tempFilePath); //1mb
      return res.status(400).json({
        message: "File format is incorrect (must be JPEG / PNG)",
      });
    }

    if (file.size > 1024 * 1024) {
      removeTmp(file.tempFilePath); //1mb
      return res.status(400).json({
        message: "Image size too large",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeTmp = async (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

export default uploadImage;
