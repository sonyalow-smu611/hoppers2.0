"use client";
import PostCard from "./Postcard";

export default function FeedList({ posts = [], onToggleLike }) {
  const iterablePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="relative min-h-screen">
      <div className="max-w-md mx-auto py-4">
        {iterablePosts.map((post) => (
          <PostCard key={post.id} post={post} onToggleLike={onToggleLike} />
        ))}
      </div>
    </div>
  );
}
