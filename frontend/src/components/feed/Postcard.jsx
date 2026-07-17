function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-amber-400" : "text-muted-foreground"}>
          {i <= rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function PostCard({ post, onToggleLike }) {
  const { id, rating, text_review, visited_at, photos, comments } = post;

  // format the date to be human readable e.g. "10 May 2026, 9:15 AM"
  const formattedDate = new Date(visited_at).toLocaleString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">

      {/* Rating */}
      <StarRating rating={rating} />

      {/* Review text */}
      <p className="mt-2 mb-2">{text_review}</p>

      {/* Photo */}
      {photos && (
        <img
          src={photos}
          alt="Review photo"
          className="w-full rounded-lg object-cover max-h-60 mb-2"
        />
      )}

      {/* Comments / caption */}
      {comments && (
        <p className="text-sm text-gray-500 italic">"{comments}"</p>
      )}

      {/* Visited date */}
      <p className="text-xs text-gray-400 mt-2">📅 Visited: {formattedDate}</p>

    </div>
  );
}