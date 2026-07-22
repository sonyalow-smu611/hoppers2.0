"use client";
import PostCard from "./Postcard";

export default function FeedList({ posts = [], onToggleLike }) {
  const iterablePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {iterablePosts.map((post) => (
        <PostCard key={post.id} post={post} onToggleLike={onToggleLike} />
      ))}
    </div>
  );
}
