export default function ShowcaseCard({ name, description, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-1">
        <h3 className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{name}</h3>
        {description ? <p className="text-sm text-black/60 dark:text-white/60">{description}</p> : null}
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-black/10 bg-black/2 p-6 dark:border-white/10 dark:bg-white/2">
        {children}
      </div>
    </div>
  );
}
