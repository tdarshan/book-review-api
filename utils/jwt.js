import jwt from 'jsonwebtoken';

export const signToken = (userId) => {
    return jwt.sign(userId, process.env.JWT_SECRET, {expiresIn: '1d'});
}

// export const verifyToken = (token) => {
//     return jwt.verify(token, process.env.JWT_SECRET);
// }