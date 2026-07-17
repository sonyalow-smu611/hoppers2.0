"use client";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import api from "../../../api";
import supabase from "../../../lib/supabase";

export default function CreatePostPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [cafeName, setCafeName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreatePost() {
    if (!cafeName || !rating || !description) {
      return alert("Please fill in all fields");
    }

    setSubmitting(true);
    try {
      // 1. upload photo directly to Supabase Storage (optional)
      let photoUrl = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-photos")
          .upload(filePath, photo, { contentType: photo.type });
        if (upErr) {
          console.error("Photo upload failed:", upErr);
          alert("Photo upload failed: " + upErr.message);
          return;
        }
        photoUrl = supabase.storage.from("post-photos").getPublicUrl(filePath).data.publicUrl;
      }

      // 2. create the post (JSON; photo is now a public URL)
      const token = await getToken();
      await api.post("/posts", {
        cafe_name: cafeName,
        rating,
        description,
        visited_at: new Date().toISOString(),
        photos: photoUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/feed");   // redirect back to feed after posting
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← Back to Feed
      </button>

      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>

      {/* Username — read only from Clerk */}
      <div className="mb-4">
        <input
          type="text"
          // value={user?.username || user?.fullName || "Loading..."}
          value="test"
          disabled
          className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
        />
      </div>

      {/* Cafe Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Cafe Name</label>
        <input
          type="text"
          placeholder="e.g. Nylon Coffee Roasters"
          value={cafeName}
          onChange={(e) => setCafeName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rating > 0 ? `${rating} / 5` : "Select a rating"}
        </p>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          placeholder="How was your experience?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 h-28"
        />
      </div>

      {/* Photo (optional) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="w-full border rounded px-3 py-2"
        />
        {photo && (
          <img
            src={URL.createObjectURL(photo)}
            alt="Preview"
            className="mt-2 w-full max-h-48 object-cover rounded"
          />
        )}
      </div>

      {/* Auto timestamp */}
      <p className="text-xs text-gray-400 mb-4">
        📅 Posting at: {new Date().toLocaleString("en-SG")}
      </p>

      <button
        onClick={handleCreatePost}
        disabled={submitting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
      >
        {submitting ? "Posting..." : "Submit Review"}
      </button>

    </div>
  );
}
