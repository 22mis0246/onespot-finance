import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;   // 🔥 THIS IS IMPORTANT
    next();
  });
}
