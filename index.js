import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 3000;

import { connectDB } from './db.js';
connectDB();

// Routes import
import authRouter from './routes/auth.route.js';
import bookRouter from './routes/book.routes.js';
import reviewRouter from './routes/review.route.js';

// Auth middleware
import { auth } from './middlewares/auth.js';
import User from './models/User.js';
import Book from './models/Book.js';


const app = express();

const router = express.Router();


app.use(express.json());

app.get("/", auth, (req, res) => {
    console.log(req.user);
    res.json({ msg: "API Served here!" });
});


app.use('/user/auth', authRouter);

app.use('/books', bookRouter);

app.use('/reviews', reviewRouter);

app.get('/search', async (req, res) => {
    const { query } = req.query;

    // If not then redirection to --GET : /books route-- 
    if (!query) {
        res.redirect('/books');
    }


    try {
        const machingUsers = await User.find({
            username: { $regex: query, $options: 'i' }
        }).select('_id');

        const authorIds = machingUsers.map(user => user._id);

        const books = await Book.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { author: { $in: authorIds } }
            ]
        }).populate('author', 'username')
            .populate({
                path: 'reviews',
                select: ['rating', 'description']
            });

        res.status(200).json(books);

    } catch (error) {
        console.log("Error", error);
        res.status(500).json({ msg: "Some error occurred!" });
    }

});

app.listen(port, () => {
    console.log(`app is running on ${port}`);
});