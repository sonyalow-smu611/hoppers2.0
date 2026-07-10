"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../api";
import FeedList from "@/components/feed/FeedList";

export default function Page() {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const token = await getToken();
      const res = await api.get("/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(Array.isArray(res.data?.posts) ? res.data.posts : []);
      setLoading(false);
    }
    fetchPosts();
  }, [getToken]);

  async function handleCreatePost(formData) {
    const token = await getToken();
    const res = await api.post("/posts", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => [res.data, ...prev]);
  }

  async function handleToggleLike(postId) {
    const token = await getToken();
    const res = await api.post(
      `/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: res.data.likes } : p))
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <FeedList
      posts={posts}
      onCreatePost={handleCreatePost}
      onToggleLike={handleToggleLike}
    />
  );
}
