interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">How This Works</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* What is this app */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What is this app?</h3>
              <p className="text-gray-700 leading-relaxed">
                Southwest Flight Finder helps you discover the best low-fare Southwest Airlines flights from Columbus (CMH)
                to popular destinations across the United States. Simply enter your travel dates, and the app will search
                for the cheapest available flights.
              </p>
            </section>

            {/* How to use */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How to use</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li><strong>Enter your dates:</strong> Select when you want to fly (single day or date range)</li>
                <li><strong>Click "Search Flights":</strong> The app searches and displays results in seconds</li>
                <li><strong>Browse results:</strong> Flights are sorted by price (lowest first)</li>
              </ol>
            </section>

            {/* Destinations */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">15 Destinations Searched</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">East Coast & Midwest</h4>
                  <ul className="space-y-1">
                    <li>• Baltimore (BWI)</li>
                    <li>• Washington DC (DCA)</li>
                    <li>• Nashville (BNA)</li>
                    <li>• Chicago (MDW)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">South & Texas</h4>
                  <ul className="space-y-1">
                    <li>• Orlando (MCO)</li>
                    <li>• Fort Lauderdale (FLL)</li>
                    <li>• Tampa (TPA)</li>
                    <li>• Dallas (DAL)</li>
                    <li>• Houston (HOU)</li>
                    <li>• Austin (AUS)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mountain & West</h4>
                  <ul className="space-y-1">
                    <li>• Denver (DEN)</li>
                    <li>• Phoenix (PHX)</li>
                    <li>• Las Vegas (LAS)</li>
                    <li>• Los Angeles (LAX)</li>
                    <li>• San Diego (SAN)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Caching */}
            <section className="mb-8 bg-blue-50 rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Smart Caching (6 Hours)</h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                If you search for the <strong>exact same dates</strong> within a 6-hour period, the app shows
                previously searched results instead of performing a new search. This saves API calls and provides
                instant results!
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Example:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You search Feb 10 at 2:00 PM → Fresh search</li>
                  <li>Someone searches Feb 10 at 3:00 PM → Cached (same date, within 6 hours)</li>
                  <li>You search Feb 10 at 8:30 PM → Fresh search (more than 6 hours passed)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Look for "Fresh results" or "Cached • Updated X ago" at the bottom of results.
              </p>
            </section>

            {/* API Usage Warning */}
            <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3">⚠️ Search Wisely - API Limits</h3>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold text-lg">
                  Each search uses ~15 API calls (we have 250/month)
                </p>
                <p className="leading-relaxed">
                  When you search, the app queries 15 popular destinations. This consumes approximately
                  15 SerpAPI calls per search (one per destination).
                </p>
                <div className="bg-white rounded p-3 mt-3">
                  <p className="font-semibold mb-2">Tips to conserve API calls:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Search specific dates (have a real trip in mind)</li>
                    <li>Check if results are cached first</li>
                    <li>Review results carefully instead of searching repeatedly</li>
                    <li>Don't test the app randomly - each search counts!</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Price Info */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">💰 Understanding Prices</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <p className="text-red-800 font-semibold">
                  ⚠️ Prices shown do NOT include taxes and fees
                </p>
                <p className="text-red-700 text-sm mt-1">
                  The final price at checkout will be $50-100+ higher
                </p>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li><strong>"Great Deal!" badge:</strong> Significantly cheaper than average for that route</li>
                <li><strong>Fare classes:</strong> "Wanna Get Away" is Southwest's lowest fare tier</li>
              </ul>
            </section>

            {/* Tips */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">✈️ Tips for Best Deals</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Be flexible with dates - prices vary significantly</li>
                <li>✅ Look for "Great Deal!" badges</li>
                <li>✅ Book 7+ days in advance for better prices</li>
                <li>✅ Consider 1-stop flights to save money</li>
                <li>✅ Remember to add $50-100+ for taxes & fees</li>
              </ul>
            </section>

            {/* FAQs */}
            <section className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3">❓ Frequently Asked Questions</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold">Can I book through this app?</p>
                  <p className="text-sm">No, this app only searches. Book directly on Southwest.com or Google Flights.</p>
                </div>
                <div>
                  <p className="font-semibold">Are prices guaranteed?</p>
                  <p className="text-sm">Prices are accurate at search time but can change. Always verify on Southwest.com.</p>
                </div>
                <div>
                  <p className="font-semibold">Can I search from other cities?</p>
                  <p className="text-sm">Currently only Columbus (CMH) is supported as the departure city.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full bg-swa-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
