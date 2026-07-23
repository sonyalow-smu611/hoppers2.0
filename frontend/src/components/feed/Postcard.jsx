/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function StarRating({ rating }) {
  const r = Number(rating) || 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? "text-amber-400" : "text-gray-300"}>
          {i <= r ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

// photos is stored as a JSON array string; older rows may be a single URL string
function parsePhotos(photos) {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [photos];
  } catch {
    return [photos];
  }
}

function PhotoGrid({ urls }) {
  if (!urls.length) return null;
  if (urls.length === 1) {
    return (
      <img
        src={urls[0]}
        alt="Review"
        className="w-full max-h-96 object-cover"
      />
    );
  }
  const shown = urls.slice(0, 4);
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((u, i) => (
        <div key={i} className="relative">
          <img src={u} alt="Review" className="w-full h-32 sm:h-40 object-cover" />
          {i === 3 && urls.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
              +{urls.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PostCard({ post }) {
  const {
    rating, text_review, visited_at, photos, comments,
    cafe_id, cafes, cafe, author_name, author_avatar, user_id,
  } = post || {};

  const photoUrls = parsePhotos(photos);
  // support both the `cafes` join shape (main) and the `cafe` alias
  const cafeName = cafe?.name || cafes?.name;
  const author = author_name && author_name.trim() ? author_name : "Anonymous";
  const formattedDate = visited_at
    ? new Date(visited_at).toLocaleDateString("en-SG", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  return (
    <div className="break-inside-avoid mb-4 border rounded-xl bg-white shadow-sm overflow-hidden">
      {/* header: avatar + author + cafe link + rating (Facebook-style) */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="size-9">
          {author_avatar ? <AvatarImage src={author_avatar} alt={author} /> : null}
          <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{author}</p>
          {cafeName && cafe_id ? (
            <Link
              href={`/cafe/${cafe_id}`}
              className="text-xs text-gray-500 hover:text-blue-600 hover:underline truncate block"
            >
              📍 {cafeName}
            </Link>
          ) : null}
        </div>
        <StarRating rating={rating} />
      </div>

      {/* review body */}
      {text_review && (
        <p className="px-3 pb-2 text-sm text-gray-800 whitespace-pre-line">{text_review}</p>
      )}

      {/* photos (multi) */}
      {photoUrls.length > 0 && <PhotoGrid urls={photoUrls} />}

      {/* footer */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
        {formattedDate && <span>📅 {formattedDate}</span>}
        {comments && <span className="italic truncate">· &ldquo;{comments}&rdquo;</span>}
      </div>
    </div>
  );
}
