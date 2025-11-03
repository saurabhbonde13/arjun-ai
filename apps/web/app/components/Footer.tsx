import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="section mt-10 border-t border-white/10">
      <div className="container grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-semibold">ArjunAI</div>
          <p className="mt-3 text-zinc-400">Where prompts hit the target.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold text-zinc-300">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li><Link href="/home">Home</Link></li>
              <li><Link href="/demo">Demo</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-300">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li><Link href="/about">About</Link></li>
              <li><a href="#" aria-disabled>Blog</a></li>
              <li><a href="#" aria-disabled>Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-zinc-500 md:text-right">
          © {new Date().getFullYear()} ArjunAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
