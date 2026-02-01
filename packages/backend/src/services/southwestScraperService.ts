// import puppeteer, { Browser, Page } from 'puppeteer'; // Not used in mock mode
import { Flight, CMH, getAirport } from '@swa-flight-finder/shared';

// let browserInstance: Browser | null = null; // Not used in mock mode
// const browserInstance: any = null; // Not used in mock mode

/**
 * Get or create a browser instance (singleton pattern)
 * COMMENTED OUT - Not used in mock mode
 */
/*
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    console.log('🌐 Launching browser for Southwest scraping...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });
  }
  return browserInstance;
}
*/

/**
 * Scrape Southwest.com for Wanna Get Away fares
 * TEMPORARY: Using mock data for testing consolidation
 */
export async function scrapeSouthwestFlights(
  origin: string,
  dateFrom: string,
  dateTo: string
): Promise<Flight[]> {
  console.log(`✈️  Southwest scraper (MOCK MODE) for ${origin} flights (${dateFrom} to ${dateTo})`);

  // Skip actual browser automation for now - just generate mock data
  // This lets us test the consolidation logic
  const destinations = ['LAS', 'MCO', 'LAX', 'DEN', 'BWI'];
  const allFlights: Flight[] = [];

  for (const destCode of destinations) {
    try {
      const flights = await generateMockSouthwestFlights(origin, destCode, dateFrom, dateTo);
      allFlights.push(...flights);
      console.log(`  ✓ Generated ${flights.length} mock Southwest flights to ${destCode}`);
    } catch (error) {
      console.log(`  ✗ Error generating flights for ${destCode}:`, error instanceof Error ? error.message : 'Unknown');
    }
  }

  return allFlights;
}

/**
 * Generate mock Southwest flights for testing
 */
async function generateMockSouthwestFlights(
  origin: string,
  destination: string,
  dateFrom: string,
  _dateTo: string
): Promise<Flight[]> {
  const originAirport = origin === 'CMH' ? CMH : getAirport(origin);
  const destAirport = getAirport(destination);

  if (!originAirport || !destAirport) {
    return [];
  }

  // Generate 2 mock "Wanna Get Away" flights with lower prices
  const mockFlights: Flight[] = [];
  const baseDate = new Date(dateFrom);

  for (let i = 0; i < 2; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate cheaper "Wanna Get Away" fare (typically $70-$120)
    const basePrice = Math.floor(Math.random() * 5000) + 7000; // $70-$120
    const departureHour = 6 + Math.floor(Math.random() * 14);
    const departureMinute = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
    const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute}`;

    const arrivalHour = departureHour + 2 + Math.floor(Math.random() * 2);
    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${departureMinute}`;

    const flight: Flight = {
      id: `southwest-${destination}-${dateStr}-${i}`,
      flightNumber: `WN ${2000 + Math.floor(Math.random() * 3000)}`,
      origin: originAirport,
      destination: destAirport,
      departureDate: dateStr,
      departureTime,
      arrivalDate: dateStr,
      arrivalTime,
      price: basePrice,
      duration: 120 + Math.floor(Math.random() * 60),
      stops: 0,
      isDeal: false, // Will be calculated later
      source: 'southwest',
      fareClass: 'Wanna Get Away',
    };

    mockFlights.push(flight);
  }

  return mockFlights;
}

/**
 * Scrape flights for a specific destination
 * COMMENTED OUT - Not used in mock mode
 */
/*
async function scrapeDestination(
  page: Page,
  origin: string,
  destination: string,
  dateFrom: string,
  _dateTo: string
): Promise<Flight[]> {
  // Skip actual scraping for now and return mock flights for testing
  console.log(`  → Generating mock Southwest flights for ${destination}`);

  const originAirport = origin === 'CMH' ? CMH : getAirport(origin);
  const destAirport = getAirport(destination);

  if (!originAirport || !destAirport) {
    return [];
  }

  // Generate 2-3 mock "Wanna Get Away" flights with lower prices
  const mockFlights: Flight[] = [];
  const baseDate = new Date(dateFrom);

  for (let i = 0; i < 2; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate cheaper "Wanna Get Away" fare
    const basePrice = Math.floor(Math.random() * 5000) + 7000; // $70-$120
    const departureTime = `${6 + Math.floor(Math.random() * 14)}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`;

    const flight: Flight = {
      id: `southwest-${destination}-${dateStr}-${i}`,
      flightNumber: `WN ${2000 + Math.floor(Math.random() * 3000)}`,
      origin: originAirport,
      destination: destAirport,
      departureDate: dateStr,
      departureTime,
      arrivalDate: dateStr,
      arrivalTime: `${parseInt(departureTime.split(':')[0]) + 2}:${departureTime.split(':')[1]}`,
      price: basePrice,
      duration: 120,
      stops: 0,
      isDeal: false, // Will be calculated later
      source: 'southwest',
      fareClass: 'Wanna Get Away',
    };

    mockFlights.push(flight);
  }

  return mockFlights;
}
*/

/**
 * Close browser instance
 * COMMENTED OUT - Not used in mock mode
 */
export async function closeBrowser(): Promise<void> {
  // Not used in mock mode
  // if (browserInstance) {
  //   await browserInstance.close();
  //   browserInstance = null;
  //   console.log('🔒 Browser closed');
  // }
}

/**
 * Parse Southwest Low Fare Calendar results
 * This would extract flight data from the results page
 * TODO: Implement actual parsing
 */
/*
async function parseFlightResults(page: Page, _origin: string, _destination: string): Promise<Flight[]> {
  const flights: Flight[] = [];
  await page.evaluate(() => []);
  return flights;
}
*/
