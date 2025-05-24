import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

const bookRouter = Router();

bookRouter.post("/", auth, async (req, res) => {
    const { name, genre } = req.body;
    // console.log("user", req.user);


    if (!name || !genre || !Array.isArray(genre)) {
        res.status(400).json({ msg: "Name & genres[Array] are required " })
    }

    try {

        const newBook = new Book({
            name,
            genre,
            author: req.user.id,
            reviews: []
        });

        await newBook.save();
        res.status(200).json(newBook);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }

});

bookRouter.get("/", async (req, res) => {
    const { page = 1, limit = 5, author, genre } = req.query;

    const filter = {};

    try {
        if (author) {
            const user = await User.findOne({ username: author });
            if (user) {
                filter.author = user._id;
            }
            else {
                filter.author = author;
            }
        }

        if (genre) {
            const genreArr = genre.split(",").map(g => g.trim());
            filter.genre = { $in: genreArr };
        }

        const books = await Book.find(filter)
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Book.countDocuments(filter);

        res.json({
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            books
        });
    } catch (err) {
        console.log("Error", err);
        res.status(500).json({ msg: "Some errory while fetching books!" });
    }

});

bookRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    try {

        const book = await Book.findById(id)
            .populate('author', ['username', 'email']);
            // .populate('reviews', ['rating', 'description']);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const reviews = await Review.find({bookId: book._id})
                                    .populate('reviewer', 'username')
                                    .sort({updatedAt: -1})
                                    .skip((page-1)*limit)
                                    .limit(parseInt(limit));
                                    
        const allReviews = await Review.find({bookId: book._id});
        let sumRating = allReviews.reduce((total, review) => {
            return total + review.rating
        }, 0);
        let rating = (sumRating/(allReviews.length)).toFixed(2);

        res.status(200).json({ book, rating, reviews });

    } catch (error) {
        console.log("Error! ", error);
        res.status(500).json({ msg: "Error fetching book!" });
    }

});

bookRouter.post("/:id/reviews", auth, async (req, res) => {
    const { id: bookId } = req.params;
    const { description, rating } = req.body;
    const userId = req.user.id;

    try {

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            res.status(404).json({ msg: "Book not found" });
        }

        const existing = await Review.findOne({ bookId, reviewer: userId });
        if (existing) {
            res.status(400).json({ msg: "You've already reviewed this book!" });
        }

        const review = new Review({
            bookId,
            reviewer: userId,
            description,
            rating,
        });

        await review.save();

        book.reviews.push(review._id);
        await book.save();

        res.status(200).json({ msg: "Review saved!", review });

    } catch (error) {
        console.log("Error ", error);
        res.status(500).json({ msg: "Some error occurred!", error });
    }
});

export default bookRouter;
