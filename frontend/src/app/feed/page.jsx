"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import api from "../../api";
import FeedList from "@/components/feed/FeedList";


export default function Page() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFeedData() {
      try {
        const [postsRes, cafesRes] = await Promise.all([
          api.get("/posts"),
          api.get("/cafes"),
        ]);

        setPosts(Array.isArray(postsRes.data.posts) ? postsRes.data.posts : []);
        setCafes(Array.isArray(cafesRes.data.cafes) ? cafesRes.data.cafes : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    }

    fetchFeedData();
  }, []);

  async function handleCreatePost(formData) {
    if (!isLoaded || !isSignedIn) {
      throw new Error("Please sign in to create a post.");
    }

    const token = await getToken();
    const res = await api.post("/posts", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts((prev) => [res.data, ...prev]);
  }

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
      <FeedList
      posts={posts}
      cafes={cafes}
      isSignedIn={isSignedIn}
      onCreatePost={handleCreatePost}
    />

  );
}
