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
  const { username, caption, rating, cafeName, foodOrdered, location } = post;

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">{username}</span>
      </div>

      <p className="mb-2">{caption}</p>
      <StarRating rating={rating} />

      <div className="text-sm text-gray-600 mt-2">
        <p className="font-medium">{cafeName}</p>
        <p>{foodOrdered}</p>
        <p>{location}</p>
      </div>

      {/* Likes */}
      {/* <button
        onClick={() => onToggleLike(id)}
        className="mt-3 flex items-center gap-1 text-red-500"
      >
        ❤️ {likes}
      </button> */}
    </div>
  );
}