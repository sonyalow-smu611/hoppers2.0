"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../api";
import FeedList from "@/components/feed/FeedList";
import CreatePostModal from "@/components/feed/CreatePostModal";

export default function Page() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = await getToken();
        const res = await api.get("/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setPosts(res.data.posts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [getToken, reloadKey]);

  async function handleToggleLike(postId) {
    const token = await getToken();
    const res = await api.post(
      `/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: res.data.likes } : p)),
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Header row with title and button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feed</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Write a Review
        </button>
      </div>

      <FeedList posts={posts} onToggleLike={handleToggleLike} />

      {modalOpen && (
        <CreatePostModal
          onClose={() => setModalOpen(false)}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
