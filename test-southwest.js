/**
 * Southwest.com Bot Detection Test
 *
 * This script tests if Southwest.com blocks headless browser automation.
 * It attempts to:
 * 1. Load the homepage
 * 2. Navigate to the low fare calendar
 * 3. Detect any anti-bot measures
 * 4. Take screenshots for visual inspection
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SOUTHWEST_URL = 'https://www.southwest.com';
const SCREENSHOTS_DIR = './test-screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function testSouthwestAccess() {
  console.log('🧪 Starting Southwest.com Bot Detection Test...\n');

  const browser = await puppeteer.launch({
    headless: true, // Start with headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent to look like a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Add extra headers to look more human
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    console.log('📡 Navigating to Southwest.com...');
    const startTime = Date.now();

    // Try to load the homepage
    const response = await page.goto(SOUTHWEST_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;
    console.log(`✓ Page loaded in ${loadTime}ms`);
    console.log(`✓ Status: ${response.status()}`);
    console.log(`✓ URL: ${page.url()}\n`);

    // Take screenshot of homepage
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-homepage.png'), fullPage: true });
    console.log('📸 Screenshot saved: 01-homepage.png');

    // Wait a bit to let any dynamic content load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for common anti-bot indicators
    console.log('\n🔍 Checking for Anti-Bot Measures...\n');

    const checks = {
      cloudflare: await page.evaluate(() => {
        return document.body.innerText.toLowerCase().includes('cloudflare') ||
               document.body.innerText.toLowerCase().includes('checking your browser') ||
               document.querySelector('title')?.innerText.toLowerCase().includes('attention required');
      }),

      recaptcha: await page.evaluate(() => {
        return !!document.querySelector('iframe[src*="recaptcha"]') ||
               !!document.querySelector('.g-recaptcha') ||
               document.body.innerText.includes('reCAPTCHA');
      }),

      blocked: await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('access denied') ||
               text.includes('blocked') ||
               text.includes('forbidden') ||
               text.includes('not authorized');
      }),

      title: await page.title(),
    };

    console.log('Anti-Bot Detection Results:');
    console.log(`  Cloudflare Challenge: ${checks.cloudflare ? '❌ DETECTED' : '✓ Not detected'}`);
    console.log(`  reCAPTCHA: ${checks.recaptcha ? '❌ DETECTED' : '✓ Not detected'}`);
    console.log(`  Access Blocked: ${checks.blocked ? '❌ BLOCKED' : '✓ Not blocked'}`);
    console.log(`  Page Title: "${checks.title}"\n`);

    // Check if we can find flight search elements
    console.log('🔎 Looking for Flight Search Elements...\n');

    const flightSearchElements = await page.evaluate(() => {
      return {
        bookFlightTab: !!document.querySelector('[data-qa="booking-form--flight-tab"]') ||
                       !!document.querySelector('a[href*="flight"]'),
        originInput: !!document.querySelector('input[id*="origin"]') ||
                     !!document.querySelector('input[placeholder*="From"]'),
        destinationInput: !!document.querySelector('input[id*="destination"]') ||
                          !!document.querySelector('input[placeholder*="To"]'),
        dateInput: !!document.querySelector('input[type="date"]') ||
                   !!document.querySelector('input[placeholder*="date"]'),
        searchButton: !!document.querySelector('button[type="submit"]') ||
                      !!document.querySelector('button:contains("Search")'),
      };
    });

    console.log('Flight Search Elements Found:');
    Object.entries(flightSearchElements).forEach(([key, found]) => {
      console.log(`  ${key}: ${found ? '✓ Found' : '✗ Not found'}`);
    });

    // Try to navigate to Low Fare Calendar
    console.log('\n📅 Attempting to access Low Fare Calendar...');

    try {
      // Look for low fare calendar link
      const lowFareLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const lfLink = links.find(link =>
          link.textContent.toLowerCase().includes('low fare') ||
          link.href.includes('low-fare-calendar')
        );
        return lfLink ? lfLink.href : null;
      });

      if (lowFareLink) {
        console.log(`✓ Found Low Fare Calendar link: ${lowFareLink}`);
        await page.goto(lowFareLink, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-low-fare-calendar.png'), fullPage: true });
        console.log('📸 Screenshot saved: 02-low-fare-calendar.png');
      } else {
        console.log('✗ Could not find Low Fare Calendar link');

        // Try direct URL
        console.log('Trying direct URL...');
        await page.goto('https://www.southwest.com/air/low-fare-calendar/', {
          waitUntil: 'networkidle2',
          timeout: 20000
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-low-fare-calendar-direct.png'), fullPage: true });
        console.log('📸 Screenshot saved: 02-low-fare-calendar-direct.png');
      }
    } catch (error) {
      console.log(`✗ Error accessing Low Fare Calendar: ${error.message}`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-error.png'), fullPage: true });
      console.log('📸 Error screenshot saved: 02-error.png');
    }

    // Final page content analysis
    console.log('\n📊 Page Content Analysis...\n');

    const contentAnalysis = await page.evaluate(() => {
      return {
        bodyLength: document.body.innerText.length,
        hasMainContent: document.body.innerText.length > 1000,
        hasScripts: document.querySelectorAll('script').length,
        hasStyles: document.querySelectorAll('link[rel="stylesheet"]').length +
                   document.querySelectorAll('style').length,
        hasForms: document.querySelectorAll('form').length,
        hasInputs: document.querySelectorAll('input').length,
      };
    });

    console.log('Content Statistics:');
    console.log(`  Body text length: ${contentAnalysis.bodyLength} characters`);
    console.log(`  Scripts: ${contentAnalysis.hasScripts}`);
    console.log(`  Stylesheets: ${contentAnalysis.hasStyles}`);
    console.log(`  Forms: ${contentAnalysis.hasForms}`);
    console.log(`  Input fields: ${contentAnalysis.hasInputs}`);

    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60) + '\n');

    const isBlocked = checks.cloudflare || checks.recaptcha || checks.blocked;
    const hasContent = contentAnalysis.hasMainContent && contentAnalysis.hasInputs > 0;

    if (isBlocked) {
      console.log('❌ RESULT: Southwest.com appears to block automation');
      console.log('   Anti-bot measures detected. Web scraping may be difficult.\n');
      console.log('   Recommendations:');
      console.log('   - Try using stealth plugins');
      console.log('   - Use residential proxies');
      console.log('   - Add random delays and human-like behavior');
      console.log('   - Consider alternative data sources\n');
    } else if (hasContent) {
      console.log('✅ RESULT: Southwest.com appears accessible via automation');
      console.log('   No obvious blocking detected. Web scraping looks viable!\n');
      console.log('   Next steps:');
      console.log('   - Implement flight search automation');
      console.log('   - Add respectful rate limiting');
      console.log('   - Implement error handling');
      console.log('   - Use stealth mode for production\n');
    } else {
      console.log('⚠️  RESULT: Unclear - page loaded but content seems limited');
      console.log('   May need additional investigation.\n');
    }

    console.log('Screenshots saved to: ./test-screenshots/');
    console.log('Review the screenshots to verify the findings.\n');

  } catch (error) {
    console.error('\n❌ Error during test:');
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Run the test
testSouthwestAccess().catch(console.error);
