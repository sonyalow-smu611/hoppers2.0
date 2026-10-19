export default function ReviewsCard({ reviewList = mockReviewList }) {
  const cafeReviews = reviewList[0];
  const averageRating =
    cafeReviews.reviews.reduce((sum, review) => sum + review.rating, 0) /
    cafeReviews.reviews.length;
  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-3xl border shadow-sm p-5 space-y-4">
      <h2 className="text-2xl font-bold text-primary">
        {cafeReviews.cafe_name}
      </h2>
      <p className="text-md font-semibold text-primary">
        Average Rating: {"★".repeat(Math.floor(averageRating))}
      </p>
      <br />
      {cafeReviews.reviews.map((review) => {
        return (
          <div
            key={review.user_id}
            className="space-y-2 pb-4 border-b last:border-b-0"
          >
            <p className="text-sunset-coral text-sm mb-2">
              {"★".repeat(review.rating)}
            </p>
            <p className="text-muted-foreground text-sm mb-2">{review.text_review}</p>
          </div>
        );
      })}
    </div>
  );
}
