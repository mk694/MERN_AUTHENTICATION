import jwt from "jsonwebtoken";

const authHeader = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(404).json("Authentication failed");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(404).json("Authentication failed");

      req.user = decoded; //user is a token recieved
    });
    next();
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
};

export default authHeader;
