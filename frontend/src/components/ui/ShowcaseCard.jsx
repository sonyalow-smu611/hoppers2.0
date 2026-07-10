export default function ShowcaseCard({ children }) {
  return (
    <div
      className="
    flex-1
    rounded-lg
    border border-dashed border-black/10
    p-6
  "
    >
      <div className="w-full h-full">{children}</div>
    </div>
  );
}
