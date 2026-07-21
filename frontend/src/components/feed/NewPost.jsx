"use client";
import { useState } from 'react';
import api from "@/api";

// props from FeedList 
export default function NewPost({ cafes = [], onSubmit, onClose }) {
  const [cafeId, setCafeId] = useState(cafes[0]?.id ? String(cafes[0].id) : '');
  const [textReview, setTextReview] = useState('');
  const [rating, setRating] = useState(5);
  const [visitedAt, setVisitedAt] = useState('');
  const [photos, setPhotos] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cafeId) {
      setError('Please choose a cafe.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        cafe_id: Number(cafeId),
        rating,
        text_review: textReview,
        visited_at: visitedAt || undefined,
        photos,
        comments,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-80 space-y-2">
        <select
          required
          value={cafeId}
          onChange={(e) => setCafeId(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="" disabled>
            Choose cafe
          </option>
          {cafes.map((cafe) => (
            <option key={cafe.id} value={cafe.id}>
              {cafe.name ?? `Cafe #${cafe.id}`}
            </option>
          ))}
        </select>
        <textarea
          required
          placeholder="Review"
          value={textReview}
          onChange={(e) => setTextReview(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border rounded px-2 py-1"
        />
        <input
          type="datetime-local"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          placeholder="Photo URL"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        <textarea
          placeholder="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
        <button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  );
}
