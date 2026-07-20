"use client";
import { useState } from "react";
import NewPost from "./NewPost";
import PostCard from "../feed/Postcard"


export default function FeedList({
  posts = [],
  cafes = [],
  isSignedIn = false,
  onCreatePost,
}) {
  // to render NewPost after + button is clicked
  const [modalOpen, setModalOpen] = useState(false);
  const iterablePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="relative min-h-screen">
      <div className="max-w-md mx-auto py-4">
        {iterablePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {isSignedIn && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 text-2xl shadow-lg"
        >
          +
        </button>
      )}
      {modalOpen && (
        <NewPost
          cafes={cafes}
          onSubmit={onCreatePost}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
