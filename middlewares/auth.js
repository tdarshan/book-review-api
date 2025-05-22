import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) {
        res.status(403).json({msg: "Auth Token not found"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error", error);
        res.status(404).json({msg: "Invalid token"});
    }
}