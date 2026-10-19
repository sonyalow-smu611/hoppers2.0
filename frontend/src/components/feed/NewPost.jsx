"use client";
import { useState } from "react";

// props from FeedList 
export default function NewPost({ cafes = [], onSubmit, onClose }) {
  const [cafeId, setCafeId] = useState(cafes[0]?.id ? String(cafes[0].id) : '');
  const [textReview, setTextReview] = useState('');
  const [rating, setRating] = useState(5);
  const [visitedAt, setVisitedAt] = useState('');
  const [photos, setPhotos] = useState('');
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
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-foreground/50 flex items-center justify-center">
      <div className="bg-card text-card-foreground p-4 rounded-lg w-80 space-y-2 shadow-xl">
        <select
          required
          value={cafeId}
          onChange={(e) => setCafeId(e.target.value)}
          className="w-full border border-input bg-background rounded px-2 py-1 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
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
          className="w-full border border-input bg-background rounded px-2 py-1 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border border-input bg-background rounded px-2 py-1 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <input
          type="datetime-local"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="w-full border border-input bg-background rounded px-2 py-1 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <input
          placeholder="Photo URL"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          className="w-full border border-input bg-background rounded px-2 py-1 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50">
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
        <button type="button" onClick={onClose} disabled={isSubmitting} className="ml-2 rounded-md border border-input px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">Cancel</button>
      </div>
    </form>
  );
}
