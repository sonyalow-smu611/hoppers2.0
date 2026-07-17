"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import api from "../../api";
import FeedList from "@/components/feed/FeedList";
// import postData from "../../../public/postdata.json"

export default function Page() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const token = await getToken();
        const res = await api.get("/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.posts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    const postData = fetchPosts();
  }, [getToken]);

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
          onClick={() => router.push("/feed/create")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Write a Review
        </button>
      </div>

      <FeedList
        posts={posts} // just pass posts directly
        onToggleLike={handleToggleLike}
      />
    </div>
  );
}
