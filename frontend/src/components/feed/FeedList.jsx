"use client";
import { useState } from "react";
import PostCard from "./Postcard";
import NewPost from "./NewPost";

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
