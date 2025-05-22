import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Review from '../models/Review.js';

const reviewRouter = Router();

reviewRouter.put('/:id', auth, async (req, res) => {
    const { id: reviewId } = req.params;
    const userId = req.user.id;

    const { description, rating } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
        res.status(400).json({ msg: "Rating must be between 1 to 5!" });
    }

    try {

        const review = await Review.findById(reviewId);
        if (!review) {
            res.status(404).json({ msg: "Review Not found!" });
        }

        if (review.reviewer.toString() !== req.user.id) {
            res.status(403).json({ msg: "You are not allowed to update this review" });
        }

        if (description !== undefined) {
            review.description = description;
        }

        if (rating !== undefined) {
            review.rating = rating;
        }

        await review.save();

        res.status(200).json({ msg: "Review updated!", review });

    } catch (error) {
        console.log("Error ", error);
        res.status(500).json({ msg: "Some Error occurred!" });
    }

});

reviewRouter.delete('/:id', auth, async (req, res) => {
    const { id: reviewId } = req.params;

    try {
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.reviewer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You are not allowed to delete this review' });
        }

        await Book.findByIdAndUpdate(review.bookId, {
            $pull: { reviews: review._id }
        });

        await Review.findByIdAndDelete(id);

        res.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.log("Error ", error);
        res.status(500).json({ msg: "something went wrong" });
    }
});

export default reviewRouter;