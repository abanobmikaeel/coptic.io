import Link from "next/link";

export default function DeveloperSection() {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-playfair">
          For Developers
        </h2>
        <p className="text-gray-400">Build applications with our simple REST API</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-blue-400 mb-3 flex justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">Calendar API</h3>
          <p className="text-gray-400 text-sm">Feast days & seasons</p>
        </div>

        <div className="text-center">
          <div className="text-blue-400 mb-3 flex justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">Readings API</h3>
          <p className="text-gray-400 text-sm">Daily scripture readings</p>
        </div>

        <div className="text-center">
          <div className="text-blue-400 mb-3 flex justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">TypeScript</h3>
          <p className="text-gray-400 text-sm">Full type support</p>
        </div>
      </div>

      <div className="bg-gray-950/80 p-6 rounded-lg text-left font-mono text-sm overflow-x-auto border border-gray-800 mb-6">
        <pre className="text-gray-300">
          <code>{`// Fetch today's readings
const res = await fetch('https://copticio-production.up.railway.app/api/readings');
const data = await res.json();`}</code>
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/docs"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
        >
          View Documentation
        </Link>
        <a
          href="https://github.com/abanobmikaeel/coptic.io"
          className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors py-3 px-6 rounded-lg border border-gray-700 hover:border-gray-500 font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
}
