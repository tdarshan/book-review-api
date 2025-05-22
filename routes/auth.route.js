import { Router } from "express";
import User from "../models/User.js";
import {signToken} from '../utils/jwt.js';

const authRouter = Router();

authRouter.get('/', (req, res) => {
    res.json({ path: "/user/auth/", msg: "inside /user/auth router", ststus: 200 });
});


authRouter.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        
        const doesExists = await User.findOne({
            $or: [
                {username}, {email}
            ]
        });

        if(doesExists) {
            res.status(400).json({msg: "User with username/password already exists"});
        }

        const newUser = await User.create({username, email, password});

        res.status(200).json({
            user: {
                id: newUser._id,
                usename: newUser.username,
                email: newUser.email,
            },
        });

    } catch (error) {
        console.log("Error", error);
        res.json({error});
    }

});

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });

        if(!user || !(await user.comparePassword(password))) {
            res.status(401).json({msg: "Invalid credentails"});
        }

        const cUser = await User.findById(user._id).select('-password');
        const token = signToken({id: user._id, username: user.username, email: user.email});

        // const isVerified = verifyToken(token);


        res.status(200).json({user: cUser, token});
        
    } catch (error) {
        console.log("Error", error);
        res.json({error});
    }

});


export default authRouter;