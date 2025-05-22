import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 3000;

import { connectDB } from './db.js';
connectDB();

// Routes import
import authRouter from './routes/auth.route.js';
import bookRouter from './routes/book.routes.js';

// Auth middleware
import { auth } from './middlewares/auth.js';


const app = express();

const router = express.Router();


app.use(express.json());

app.get("/", auth, (req, res) => {
    console.log(req.user);
    res.json({msg: "API Served here!"});
});

app.use('/user/auth', authRouter);


app.use('/books', bookRouter);

app.listen(port, () => {
    console.log(`app is running on ${port}`);
});