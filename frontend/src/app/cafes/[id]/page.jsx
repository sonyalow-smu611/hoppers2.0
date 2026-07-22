"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/api";
import PostCard from "@/components/feed/Postcard";

export default function CafeDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [cafe, setCafe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [cafeRes, postsRes] = await Promise.all([
          api.get("/cafes"),
          api.get(`/posts?cafe_id=${id}`),
        ]);
        if (!active) return;
        setCafe(
          (cafeRes.data.cafes || []).find((c) => String(c.id) === String(id)) || null,
        );
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error("Failed to load cafe:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Link
        href="/feed"
        className="text-sm text-gray-500 hover:text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to feed
      </Link>

      {cafe ? (
        <div className="mb-6">
          {cafe.picture && (
            <img
              src={cafe.picture}
              alt={cafe.name}
              className="w-full h-48 sm:h-64 object-cover rounded-xl mb-3"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{cafe.name}</h1>
          {cafe.address && <p className="text-gray-500 text-sm">{cafe.address}</p>}
          {cafe.description && <p className="text-sm mt-2 text-gray-700">{cafe.description}</p>}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">Cafe not found in our directory.</p>
      )}

      <h2 className="text-lg font-semibold mb-3">Reviews ({posts.length})</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
