"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { XIcon } from "lucide-react";
import api from "@/api";
import supabase from "@/lib/supabase";
import RatingGroupStars from "@/components/ui/rating-group";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function CreatePostModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [cafeName, setCafeName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // real Clerk user — no more "test" placeholder. Falls back gracefully if not signed in.
  const displayName =
    user?.username || user?.firstName || user?.fullName || "Guest";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cafeName || !rating || !description) {
      return alert("Please fill in the cafe, your rating and a review.");
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
        photoUrl = supabase.storage
          .from("post-photos")
          .getPublicUrl(filePath).data.publicUrl;
      }

      // 2. create the post
      const token = await getToken();
      await api.post(
        "/posts",
        {
          cafe_name: cafeName,
          rating,
          description,
          visited_at: new Date().toISOString(),
          photos: photoUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onCreated?.();
      onClose?.();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* header: signed-in user (replaces the "test" placeholder) */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Posting as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {displayName}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Write a review
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* cafe name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cafe
            </label>
            <input
              type="text"
              placeholder="e.g. Nylon Coffee Roasters"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* rating */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your rating
            </label>
            <RatingGroupStars value={rating} onValueChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {rating}/5 — {RATING_LABELS[rating - 1]}
              </p>
            )}
          </div>

          {/* review */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Review
            </label>
            <textarea
              placeholder="Share your experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* photo (optional) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
            {photo && (
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                className="mt-2 w-full max-h-40 object-cover rounded-lg"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post review"}
          </button>
        </form>
      </div>
    </div>
  );
}
