export default function RegenerateFixButtons() {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1.5 rounded-xl bg-white/10">Regenerate</button>
      <button className="px-3 py-1.5 rounded-xl bg-white/10">Fix Bugs</button>
      <a href="#" className="px-3 py-1.5 rounded-xl bg-accent text-black">Download</a>
    </div>
  );
}
