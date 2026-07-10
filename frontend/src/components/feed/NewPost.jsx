"use client";
import { useState } from 'react';

// props from FeedList 
export default function NewPost({ onSubmit, onClose }) {
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5);
  const [cafeName, setCafeName] = useState('');
  const [foodOrdered, setFoodOrdered] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ caption, rating, cafeName, foodOrdered, location });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-80 space-y-2">
        <input placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <input placeholder="Cafe name" value={cafeName} onChange={(e) => setCafeName(e.target.value)} />
        <input placeholder="Food ordered" value={foodOrdered} onChange={(e) => setFoodOrdered(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        <button type="submit">Post</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}