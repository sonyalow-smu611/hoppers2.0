/* eslint-disable @next/next/no-img-element */

function StarRating({ rating }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= roundedRating ? "text-amber-400" : "text-muted-foreground"}>
          {i <= roundedRating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function PostCard({ post }) {
  const cafeName = post.cafes?.name ?? `Cafe #${post.cafe_id}`;
  const visitedAt = post.visited_at
    ? new Date(post.visited_at).toLocaleDateString()
    : null;

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">{cafeName}</span>
      </div>

      {post.photos && (
        <img
          src={post.photos}
          alt={cafeName}
          className="mb-3 aspect-video w-full rounded-md object-cover"
        />
      )}

      <p className="mb-2">{post.text_review}</p>
      <StarRating rating={post.rating} />

      <div className="text-sm text-gray-600 mt-2">
        {visitedAt && <p>Visited {visitedAt}</p>}
        {post.comments && <p>{post.comments}</p>}
      </div>
    </div>
  );
}
