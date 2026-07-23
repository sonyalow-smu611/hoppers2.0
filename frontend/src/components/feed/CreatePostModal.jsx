"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Button as AriaButton,
  ComboBox,
  Group,
  Input as AriaInput,
  Label as AriaLabel,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from "react-aria-components";
import { ChevronDownIcon, XIcon } from "lucide-react";
import api from "@/api";
import supabase from "@/lib/supabase";
import RatingGroupStars from "@/components/ui/rating-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
const COMPARE_LIMIT = 1000;

export default function CreatePostModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  // cafes for the dropdown — fetched once when the modal opens
  const [cafes, setCafes] = useState([]);
  const [cafeId, setCafeId] = useState(null);
  const [cafesLoading, setCafesLoading] = useState(true);
  const [cafesError, setCafesError] = useState(null);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // File[]
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/cafes", {
          params: { compact: true, limit: COMPARE_LIMIT },
        });
        if (active) setCafes(res.data?.cafes ?? []);
      } catch (err) {
        if (active) {
          setCafesError(
            err?.response?.data?.error ||
              err?.message ||
              "Failed to load cafés.",
          );
        }
      } finally {
        if (active) setCafesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    return supabase.storage
      .from("post-photos")
      .getPublicUrl(filePath).data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cafeId || !rating || !description) {
      return alert(
        "Please choose a café, give a rating and write a review.",
      );
    }

    setSubmitting(true);
    try {
      const photoUrls = [];
      for (const file of photos) {
        photoUrls.push(await uploadOne(file));
      }

      const token = await getToken();
      await api.post(
        "/posts",
        {
          cafe_id: cafeId,
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

  const noCafes = !cafesLoading && !cafesError && cafes.length === 0;
  const cafePickerDisabled = cafesLoading || !!cafesError || noCafes;
  const submitDisabled =
    submitting || cafesLoading || !!cafesError || !cafeId;

  const cafePlaceholder = cafesLoading
    ? "Loading cafés…"
    : cafesError
      ? "Couldn’t load cafés"
      : noCafes
        ? "No cafés available yet"
        : "Choose a café…";

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
            {user?.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Posting as
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {displayName}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Write a review
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* cafe picker (fetched from /cafes?compact=true) */}
          <div>
            <AriaLabel className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Café
            </AriaLabel>
            <ComboBox
              isDisabled={cafePickerDisabled}
              items={cafes}
              selectedKey={cafeId}
              onSelectionChange={(key) => setCafeId(key ?? null)}
              placeholder={cafePlaceholder}
              className="w-full"
            >
              <Group className="flex w-full items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-blue-500 data-[disabled]:opacity-60">
                <AriaInput className="flex-1 bg-transparent outline-none dark:text-white placeholder:text-gray-400" />
                <AriaButton
                  className="text-gray-400 ml-auto outline-none data-[disabled]:opacity-50"
                  aria-label="Open café list"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </AriaButton>
              </Group>
              <Popover
                placement="bottom start"
                className="z-[60] w-[var(--trigger-width)] max-w-[28rem] max-h-72 overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg outline-none"
              >
                <ListBox className="outline-none p-1">
                  {cafes.map((cafe) => (
                    <ListBoxItem
                      key={cafe.id}
                      id={cafe.id}
                      textValue={cafe.name}
                      className="px-2 py-1.5 mx-1 rounded text-sm cursor-pointer text-gray-900 dark:text-gray-100 outline-none data-[focused]:bg-blue-100 dark:data-[focused]:bg-gray-700 data-[selected]:bg-blue-600 data-[selected]:text-white data-[focused]:data-[selected]:bg-blue-700"
                    >
                      <span className="block truncate">{cafe.name}</span>
                      {cafe.address ? (
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                          {cafe.address}
                        </span>
                      ) : null}
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              {cafesError ? (
                <Text
                  slot="errorMessage"
                  className="text-xs text-red-600 mt-1"
                >
                  {cafesError}
                </Text>
              ) : null}
            </ComboBox>
            {!cafesError && noCafes ? (
              <p className="text-xs text-gray-500 mt-1">
                No cafés are available to review yet. Please check back later.
              </p>
            ) : null}
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
            disabled={submitDisabled}
            title={
              cafesError
                ? "Cannot post: cafés failed to load"
                : !cafeId
                  ? "Please choose a café first"
                  : undefined
            }
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      </div>
    </div>
  );
}
