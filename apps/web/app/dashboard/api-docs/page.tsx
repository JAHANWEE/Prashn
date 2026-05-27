export default function ApiDocsPage() {
  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 bg-[#121319]/80 backdrop-blur-md border-b border-[#454653] z-40 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-[#bdc2ff]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            API Documentation
          </span>
        </div>
        <a href="http://localhost:8000/docs" target="_blank" className="flex items-center gap-2 bg-[#818cf8] text-[#101b8a] px-4 py-2 rounded-lg text-[12px] font-medium hover:brightness-110 transition-all" style={{ fontFamily: "var(--font-geist-mono)" }}>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Interactive Docs
        </a>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-8">
          <h2 className="text-[32px] font-semibold text-[#e4e1eb] mb-1" style={{ fontFamily: "var(--font-geist-sans)", lineHeight: "1.2", letterSpacing: "-0.02em" }}>
            Developer API
          </h2>
          <p className="text-base text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Use CanvasForms public APIs to read public forms and submit responses.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* API Reference Card */}
          <div className="col-span-12 lg:col-span-8 bg-[#0d0e14] border border-[#454653] rounded-xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <span className="inline-block px-2 py-0.5 bg-[#3c4a5e] text-[#abb9d2] rounded text-[10px] mb-2" style={{ fontFamily: "var(--font-geist-mono)" }}>v1.0.4</span>
                <h3 className="text-lg font-medium text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-sans)" }}>
                  API Reference Overview
                </h3>
              </div>
              <a href="http://localhost:8000/docs" target="_blank" className="flex items-center gap-2 bg-[#818cf8] text-[#101b8a] px-4 py-2 rounded-lg text-[12px] font-medium hover:brightness-110 transition-all" style={{ fontFamily: "var(--font-geist-mono)" }}>
                <span className="material-symbols-outlined text-sm">description</span>
                Open Scalar Docs
              </a>
            </div>
            <div className="space-y-4">
              {/* GET endpoint */}
              <div className="p-4 bg-[#1f1f26] border border-[#454653] rounded-lg flex items-center justify-between group cursor-pointer hover:border-[#bdc2ff] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="bg-green-800 text-green-100 px-4 py-1 rounded-lg text-xs font-bold" style={{ fontFamily: "var(--font-geist-mono)" }}>GET</span>
                  <span className="text-sm text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)" }}>/public/forms</span>
                </div>
                <span className="text-[12px] text-[#c6c5d5] group-hover:text-[#bdc2ff] transition-colors" style={{ fontFamily: "var(--font-geist-mono)" }}>List all published forms</span>
              </div>
              {/* POST endpoint */}
              <div className="p-4 bg-[#1f1f26] border border-[#454653] rounded-lg flex items-center justify-between group cursor-pointer hover:border-[#bdc2ff] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-800 text-blue-100 px-4 py-1 rounded-lg text-xs font-bold" style={{ fontFamily: "var(--font-geist-mono)" }}>POST</span>
                  <span className="text-sm text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)" }}>/public/forms/:slug/responses</span>
                </div>
                <span className="text-[12px] text-[#c6c5d5] group-hover:text-[#bdc2ff] transition-colors" style={{ fontFamily: "var(--font-geist-mono)" }}>Submit a new response</span>
              </div>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="col-span-12 lg:col-span-4 bg-[#0d0e14] border border-[#454653] rounded-xl p-6 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-[#bdc2ff] mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
                <h4 className="text-[12px] uppercase tracking-wider font-medium text-[#bdc2ff]" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
                  Authentication
                </h4>
              </div>
              <p className="text-sm text-[#c6c5d5] mb-6 leading-relaxed" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Include your API key in the request header to authenticate. Secure keys should never be exposed on the client side.
              </p>
            </div>
            <div className="bg-[#1b1b22] p-4 rounded-lg border border-dashed border-[#454653]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-mono)" }}>Active Key</span>
                <span className="text-[10px] text-[#bdc2ff] font-bold cursor-pointer hover:underline uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>Revoke</span>
              </div>
              <div className="bg-[#0d0e14] p-2 border border-[#454653] rounded flex justify-between items-center" style={{ fontFamily: "var(--font-geist-mono)" }}>
                <span className="text-xs text-[#e4e1eb] truncate opacity-80">sk_live_51M8X...93kL</span>
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-[#bdc2ff] text-[#908f9e]">content_copy</span>
              </div>
            </div>
          </div>

          {/* Code Example Panel */}
          <div className="col-span-12 bg-[#0d0e14] border border-[#454653] rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#454653] bg-[#1f1f26]">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#c6c5d5]">code</span>
                <h3 className="text-[12px] font-bold text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
                  Submission JSON Example
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-[#0d0e14] border border-[#454653] text-[#c6c5d5] rounded py-1 px-2 text-xs focus:ring-[#bdc2ff] focus:border-[#bdc2ff] outline-none" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  <option>cURL</option>
                  <option>JavaScript</option>
                  <option>Python</option>
                </select>
                <button className="material-symbols-outlined text-[#c6c5d5] hover:text-[#bdc2ff] transition-colors p-1 text-[18px]">content_copy</button>
              </div>
            </div>
            <div className="p-6 bg-[#0d0e14] overflow-x-auto">
              <pre className="text-sm text-[#e4e1eb]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                <code>{`"`}<span className="text-[#bdc2ff]">payload</span>{`": {
  "`}<span className="text-[#bdc2ff]">form_id</span>{`": "`}<span className="text-[#b9c7e0]">f_90210_alpha</span>{`",
  "`}<span className="text-[#bdc2ff]">responses</span>{`": [
    {
      "`}<span className="text-[#bdc2ff]">field_id</span>{`": "`}<span className="text-[#b9c7e0]">q_1</span>{`",
      "`}<span className="text-[#bdc2ff]">value</span>{`": "`}<span className="text-[#b9c7e0]">Engineering-Grade Minimalism</span>{`"
    },
    {
      "`}<span className="text-[#bdc2ff]">field_id</span>{`": "`}<span className="text-[#b9c7e0]">q_2</span>{`",
      "`}<span className="text-[#bdc2ff]">value</span>{`": `}<span className="text-[#f7bd3e]">5</span>{`
    },
    {
      "`}<span className="text-[#bdc2ff]">field_id</span>{`": "`}<span className="text-[#b9c7e0]">q_3</span>{`",
      "`}<span className="text-[#bdc2ff]">value</span>{`": `}<span className="text-[#ffb4ab]">true</span>{`
    }
  ],
  "`}<span className="text-[#bdc2ff]">metadata</span>{`": {
    "`}<span className="text-[#bdc2ff]">source</span>{`": "`}<span className="text-[#b9c7e0]">api_v1</span>{`",
    "`}<span className="text-[#bdc2ff]">timestamp</span>{`": "`}<span className="text-[#b9c7e0]">2023-11-21T14:48:00Z</span>{`"
  }
}`}</code>
              </pre>
            </div>
            <div className="px-6 py-3 bg-[#1b1b22] text-[#c6c5d5] text-[11px] flex items-center gap-2 border-t border-[#454653]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              <span className="material-symbols-outlined text-xs">info</span>
              All field IDs are unique within a form schema. Ensure your values match the defined field types.
            </div>
          </div>

          {/* Rate Limiting Card */}
          <div className="col-span-12 md:col-span-6 bg-[#0d0e14] border border-[#454653] rounded-xl p-6 flex items-start gap-6 hover:bg-[#1b1b22] transition-colors cursor-pointer">
            <div className="p-2 bg-[#bdc2ff]/10 text-[#bdc2ff] rounded-lg shrink-0">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-[#e4e1eb] mb-1" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>Rate Limiting</h4>
              <p className="text-sm text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
                10,000 requests per hour on the Developer Plan. Header{" "}
                <code className="bg-[#34343b] px-1 rounded text-[#bdc2ff] text-xs" style={{ fontFamily: "var(--font-geist-mono)" }}>X-RateLimit-Remaining</code>{" "}
                tracking available.
              </p>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="col-span-12 md:col-span-6 bg-[#0d0e14] border border-[#454653] rounded-xl p-6 flex items-start gap-6 hover:bg-[#1b1b22] transition-colors cursor-pointer">
            <div className="p-2 bg-[#c08d00]/10 text-[#f7bd3e] rounded-lg shrink-0">
              <span className="material-symbols-outlined">webhook</span>
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-[#e4e1eb] mb-1" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>Webhooks</h4>
              <p className="text-sm text-[#c6c5d5]" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Listen for real-time events. Configure endpoints in your account settings to receive POST payloads on form submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto w-full py-8 bg-[#0d0e14] border-t border-[#454653] flex flex-col items-center gap-2">
        <span className="text-[10px] font-black text-[#c6c5d5] uppercase tracking-widest" style={{ fontFamily: "var(--font-geist-mono)" }}>CanvasForms</span>
        <div className="flex gap-6">
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">Privacy</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">Terms</a>
          <a href="#" className="text-[11px] text-[#c6c5d5] opacity-70 hover:opacity-100 underline transition-opacity">Support</a>
        </div>
        <p className="text-[10px] text-[#c6c5d5] opacity-50">Built with CanvasForms © 2024</p>
      </footer>
    </>
  );
}
