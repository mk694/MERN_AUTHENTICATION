import Users from "../models/userModel.js";

const authAdmin = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.user.id });

    if (user.role !== 1)
      return res.status(500).json({ message: "Admin resources access denied" });

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default authAdmin;
