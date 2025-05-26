import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || "BDJBGJSBGKJ_AHKJBDKJ";

export const authenticateToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies);

  const token = req.cookies?.token;
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    console.log('VERIFYING SECRET:', SECRET_KEY);
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Token decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

