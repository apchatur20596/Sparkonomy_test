export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300/40 to-sky-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-300/30 to-purple-200/30 blur-3xl" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-gradient-to-t from-amber-200/30 to-transparent blur-3xl" />
    </div>
  );
}
