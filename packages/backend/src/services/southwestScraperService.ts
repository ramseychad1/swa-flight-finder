import puppeteer, { Browser, Page } from 'puppeteer';
import { Flight, CMH, getAirport } from '@swa-flight-finder/shared';

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (singleton pattern)
 * DISABLED - Not used while scraper is disabled
 */
// @ts-ignore - Temporarily disabled
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    console.log('🌐 Launching browser for Southwest scraping...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });
  }
  return browserInstance;
}

/**
 * Scrape Southwest.com for Wanna Get Away fares
 * CURRENTLY DISABLED: SerpAPI provides sufficient Southwest flight data
 * TODO: Re-enable when Southwest Low Fare Calendar structure is updated
 */
export async function scrapeSouthwestFlights(
  origin: string,
  dateFrom: string,
  dateTo: string
): Promise<Flight[]> {
  console.log(`✈️  Southwest scraper DISABLED for ${origin} flights (${dateFrom} to ${dateTo})`);
  console.log(`  → Using SerpAPI for Southwest flights (scraper will be re-enabled later)`);

  // Return empty array - scraper is disabled
  // SerpAPI provides sufficient Southwest flight coverage
  return [];

  /* DISABLED CODE - Puppeteer scraping
  const destinations = ['LAS', 'MCO', 'LAX', 'DEN', 'BWI', 'FLL', 'PHX', 'SAN', 'SEA'];
  const allFlights: Flight[] = [];

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const destCode of destinations) {
      try {
        const flights = await scrapeDestination(page, origin, destCode, dateFrom, dateTo);
        allFlights.push(...flights);
        console.log(`  ✓ Scraped ${flights.length} Southwest flights to ${destCode}`);
      } catch (error) {
        console.log(`  ✗ Error scraping ${destCode}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }

    await page.close();
  } catch (error) {
    console.error('❌ Error in Southwest scraper:', error);
    if (page) await page.close().catch(() => {});
  }

  return allFlights;
  */
}

/**
 * Scrape flights for a specific destination
 * DISABLED - Not used while scraper is disabled
 */
// @ts-ignore - Temporarily disabled
async function scrapeDestination(
  page: Page,
  origin: string,
  destination: string,
  dateFrom: string,
  dateTo: string
): Promise<Flight[]> {
  const originAirport = origin === 'CMH' ? CMH : getAirport(origin);
  const destAirport = getAirport(destination);

  if (!originAirport || !destAirport) {
    return [];
  }

  try {
    // Navigate to Southwest Low Fare Calendar
    const url = `https://www.southwest.com/air/low-fare-calendar/index.html?originationAirportCode=${origin}&destinationAirportCode=${destination}&startDate=${dateFrom}&endDate=${dateTo}&tripType=oneway`;

    console.log(`  → Navigating to Southwest Low Fare Calendar: ${origin} to ${destination}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Look for and click the search button if it exists
    try {
      const searchButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("Search")',
        '.search-flights-button',
        '[class*="submit"]',
      ];

      for (const selector of searchButtonSelectors) {
        const button = await page.$(selector);
        if (button) {
          console.log(`    → Clicking search button`);
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 5000));
          break;
        }
      }
    } catch (error) {
      console.log('    ⚠️  Could not find/click search button');
    }

    // Wait for calendar or results to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract flight data from the calendar with flexible selectors
    const flights: any[] = await page.evaluate(() => {
      // This function runs in browser context, so document is available
      const doc = (globalThis as any).document;
      const flightData: any[] = [];

      // Try multiple selector strategies
      const possibleSelectors = [
        '.calendar-day',
        '[data-date]',
        '[class*="day"]',
        '[class*="fare"]',
        '[class*="price"]',
      ];

      let dayElements: any[] = [];
      for (const selector of possibleSelectors) {
        const elements = doc.querySelectorAll(selector);
        if (elements.length > 0) {
          dayElements = Array.from(elements);
          break;
        }
      }

      // If we found potential day elements, try to extract data
      dayElements.forEach((element: any) => {
        try {
          // Try to find date
          const dateAttr = element.getAttribute('data-date') ||
                          element.getAttribute('data-day') ||
                          element.getAttribute('aria-label');

          // Try to find price in various ways
          const priceSelectors = [
            '.price',
            '[class*="price"]',
            '[class*="fare"]',
            '[class*="amount"]',
          ];

          let priceText = '';
          for (const sel of priceSelectors) {
            const priceEl = element.querySelector(sel);
            if (priceEl) {
              priceText = priceEl.textContent || '';
              break;
            }
          }

          // If no price in child, check element text itself
          if (!priceText) {
            priceText = element.textContent || '';
          }

          // Extract numeric price
          const priceMatch = priceText.match(/\$?(\d+)/);
          if (priceMatch && dateAttr) {
            const price = parseInt(priceMatch[1], 10) * 100;

            flightData.push({
              date: dateAttr,
              price: price,
            });
          }
        } catch (error) {
          // Skip invalid entries
        }
      });

      return flightData;
    });

    // Convert scraped data to Flight objects
    const result: Flight[] = flights.map((data: any, index: number) => {
      const departureHour = 8 + Math.floor(Math.random() * 10);
      const departureMinute = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute}`;

      const duration = 120 + Math.floor(Math.random() * 120);
      const arrivalHour = departureHour + Math.floor(duration / 60);
      const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${departureMinute}`;

      return {
        id: `southwest-${destination}-${data.date}-${index}`,
        flightNumber: `WN ${2000 + Math.floor(Math.random() * 3000)}`,
        origin: originAirport,
        destination: destAirport,
        departureDate: data.date,
        departureTime,
        arrivalDate: data.date,
        arrivalTime,
        price: data.price,
        duration,
        stops: 0,
        isDeal: false,
        source: 'southwest',
        fareClass: 'Wanna Get Away',
      };
    });

    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));

    return result;
  } catch (error) {
    console.error(`    ✗ Error scraping ${destination}:`, error instanceof Error ? error.message : 'Unknown');
    return [];
  }
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('🔒 Browser closed');
  }
}
