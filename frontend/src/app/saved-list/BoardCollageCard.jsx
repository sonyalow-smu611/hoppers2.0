import Link from "next/link";
import ListPrivacyButton from "./ListPrivacyButton";

function BoardCollage({ photos }) {
  const images = photos.slice(0, 3);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[5/4] items-center justify-center rounded-2xl bg-muted">
        <span className="text-sm text-muted-foreground">No photos yet</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[5/4] overflow-hidden rounded-2xl bg-muted">
        <img
          src={images[0]}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid aspect-[5/4] grid-cols-2 gap-0.5 overflow-hidden rounded-2xl bg-muted">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid aspect-[5/4] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl bg-muted">
      <img
        src={images[0]}
        alt=""
        className="row-span-2 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <img
        src={images[1]}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <img
        src={images[2]}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}

export default function BoardCollageCard({ board }) {
  const href = `/saved-list/${encodeURIComponent(board.title)}`;
  const photos = board.cafes.map((cafe) => cafe.picture).filter(Boolean);

  return (
    <article className="group space-y-2">
      <div className="relative">
        <Link href={href} className="block overflow-hidden rounded-2xl">
          <BoardCollage photos={photos} />
        </Link>
        <div className="absolute top-2 right-2">
          <ListPrivacyButton
            userId={board.user_id}
            title={board.title}
            isPrivate={board.list_type}
            className="bg-card/90 shadow-sm hover:bg-card"
          />
        </div>
      </div>

      <Link href={href} className="block px-0.5">
        <h2 className="font-semibold leading-tight group-hover:underline">
          {board.title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {board.cafes.length} cafe{board.cafes.length !== 1 ? "s" : ""}
        </p>
      </Link>
    </article>
  );
}
