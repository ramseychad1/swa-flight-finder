# Southwest Flight Finder - User Guide

## What is this app?

Southwest Flight Finder helps you discover the best low-fare Southwest Airlines flights from Columbus (CMH) to popular destinations across the United States. Simply enter your travel dates, and the app will search for the cheapest available flights.

## How to use the app

1. **Enter your dates**: Select when you want to fly. You can search for a single day or a date range.
2. **Click "Search Flights"**: The app will search for flights and display results in a few seconds.
3. **Browse results**: Flights are sorted by price (lowest first), showing you the best deals at the top.

## Where does it search?

The app searches Southwest flights from Columbus (CMH) to **20 popular destinations**:

### East Coast
- **Baltimore (BWI)** - Baltimore/Washington International
- **Washington DC (DCA)** - Ronald Reagan Washington National
- **Nashville (BNA)** - Nashville International

### Midwest
- **Chicago (MDW)** - Chicago Midway International

### South
- **Orlando (MCO)** - Orlando International
- **Fort Lauderdale (FLL)** - Fort Lauderdale-Hollywood International
- **Tampa (TPA)** - Tampa International
- **New Orleans (MSY)** - Louis Armstrong New Orleans International
- **Dallas (DAL)** - Dallas Love Field
- **Houston (HOU)** - William P. Hobby Airport
- **Austin (AUS)** - Austin-Bergstrom International

### Mountain
- **Denver (DEN)** - Denver International
- **Phoenix (PHX)** - Phoenix Sky Harbor International

### West Coast
- **Las Vegas (LAS)** - Harry Reid International
- **Los Angeles (LAX)** - Los Angeles International
- **San Diego (SAN)** - San Diego International
- **San Jose (SJC)** - Norman Y. Mineta San José International
- **Oakland (OAK)** - Oakland International
- **Seattle (SEA)** - Seattle-Tacoma International
- **Portland (PDX)** - Portland International

## Understanding the results

### Price information
- **Prices shown do NOT include taxes and fees** - The final price at checkout will be higher (typically $50-100+ more)
- **"Great Deal!" badge** - Flights marked with this badge are significantly cheaper than average for that route

### Data source
- **Powered by Google Flights** - Results come from Google Flights via SerpAPI, which includes real-time Southwest pricing
- **Fresh results** - Newly searched data
- **Cached** - Data was searched recently and is being reused (see below)

## Important: How caching works

To conserve API usage and reduce costs, the app uses **smart caching**:

### What is caching?
If you search for the exact same dates within a 6-hour period, the app will show you the **previously searched results** instead of performing a new search. This is called "cached" or "stored" data.

### When will I see cached results?
- ✅ You search Feb 10 - Feb 10 at 2:00 PM
- ✅ Someone else searches Feb 10 - Feb 10 at 3:00 PM → **Shows cached results** (same search, within 6 hours)
- ✅ You search Feb 10 - Feb 10 again at 7:00 PM → **Shows cached results** (same search, within 6 hours)
- ❌ You search Feb 10 - Feb 10 at 8:30 PM → **Performs new search** (more than 6 hours since original search)

### How to tell if results are cached
Look at the bottom of the results section:
- **"Fresh results"** = Just searched live
- **"Cached • Updated X minutes/hours ago"** = Using stored data from a previous search

### Why does this matter?
- ✅ **Saves API calls** - Reduces costs
- ✅ **Faster results** - Instant response for repeated searches
- ⚠️ **Prices may have changed** - If data is several hours old, actual prices might be slightly different

**Tip:** If you want completely fresh data, try searching a different date or wait until the 6-hour cache expires.

## API usage & search wisely

### Each search uses approximately 15 API calls
When you click "Search Flights," the app searches all 20 destinations. This consumes about **15 SerpAPI calls** (some destinations may not return results, which uses fewer calls).

### We have a monthly limit
The app uses a **free SerpAPI plan with 250 searches per month**. You can see the current usage at the top of the page:
- **Green** (< 70% used) = Plenty of searches remaining
- **Yellow** (70-90% used) = Getting close to the limit
- **Red** (> 90% used) = Almost at the limit

### Search tips to conserve API calls
1. ✅ **Search specific dates** - Don't search randomly; have a real trip in mind
2. ✅ **Check if results are cached first** - If someone recently searched your dates, you'll get instant results without using API calls
3. ✅ **Search once, review carefully** - Take your time browsing the results instead of searching repeatedly
4. ❌ **Don't search the same dates multiple times** - If you just searched, wait a moment and check if data is cached
5. ❌ **Don't "test" the app repeatedly** - Each search counts toward our monthly limit

### What happens if we hit the limit?
If the monthly limit is reached, the app will stop returning results until the next month. Plan your searches accordingly!

## Understanding flight details

Each flight card shows:
- **Destination city and airport name**
- **Price** (excluding taxes & fees)
- **Departure date and time**
- **Arrival date and time**
- **Flight number** (e.g., WN 1234)
- **Duration** (e.g., 2h 15m)
- **Stops** (Nonstop, 1 stop, etc.)
- **Fare class** (e.g., "Wanna Get Away" - Southwest's lowest fare)

## Tips for finding the best deals

1. **Be flexible with dates** - Prices can vary significantly by day
2. **Look for the "Great Deal!" badge** - These are notably cheaper than typical fares
3. **Book early** - Advance bookings (7+ days out) are usually cheaper
4. **Consider layovers** - Direct flights cost more; 1-stop flights may save money
5. **Remember taxes & fees** - Add $50-100+ to the displayed price for the real cost

## Frequently asked questions

**Q: Why are some dates not available?**
A: Southwest may not have flights available for that date, or they haven't released fares yet for dates far in the future.

**Q: Can I book flights through this app?**
A: No, this app only searches for flights. You'll need to book directly on Southwest.com or Google Flights.

**Q: Are these prices guaranteed?**
A: Prices are accurate at the time of search but can change at any time. Always check Southwest.com for the final price before booking.

**Q: Why don't I see all Southwest destinations?**
A: The app currently searches 20 popular destinations from Columbus. If you need a different destination, it may not be included.

**Q: Can I search from a different origin city?**
A: Currently, the app only supports Columbus (CMH) as the departure city.

**Q: What if I get an error?**
A: Try refreshing the page. If the error persists, we may have reached the monthly API limit or there may be a temporary issue with the data provider.

## Need help?

If you encounter issues or have questions, please check:
1. Your internet connection
2. The API usage meter (we may be at the monthly limit)
3. Try searching different dates

---

**Remember: Search wisely and help us conserve API calls for everyone! 🛫**
