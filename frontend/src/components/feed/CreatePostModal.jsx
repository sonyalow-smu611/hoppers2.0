"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { XIcon } from "lucide-react";
import api from "@/api";
import supabase from "@/lib/supabase";
import RatingGroupStars from "@/components/ui/rating-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function CreatePostModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [cafeName, setCafeName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // File[]
  const [submitting, setSubmitting] = useState(false);

  const displayName =
    user?.username || user?.firstName || user?.fullName || "Guest";

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    setPhotos((prev) => [...prev, ...incoming]);
  }

  function removePhoto(idx) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadOne(file) {
    const ext = file.name.split(".").pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("post-photos")
      .upload(filePath, file, { contentType: file.type });
    if (error) throw error;
    return supabase.storage.from("post-photos").getPublicUrl(filePath).data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cafeName || !rating || !description) {
      return alert("Please fill in the cafe, your rating and a review.");
    }

    setSubmitting(true);
    try {
      // 1. upload all photos directly to Supabase Storage
      const photoUrls = [];
      for (const file of photos) {
        photoUrls.push(await uploadOne(file));
      }

      // 2. create the post (photos as array, author captured from Clerk)
      const token = await getToken();
      await api.post(
        "/posts",
        {
          cafe_name: cafeName,
          rating,
          description,
          visited_at: new Date().toISOString(),
          photos: photoUrls,
          author_name: displayName,
          author_avatar: user?.imageUrl || null,
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
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto"
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

        {/* header: real Clerk avatar + name */}
        <div className="flex items-center gap-3 mb-5">
          <Avatar className="size-10">
            {user?.imageUrl ? <AvatarImage src={user.imageUrl} alt={displayName} /> : null}
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
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

          {/* photos (multiple) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photos (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="w-full text-sm"
            />
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
