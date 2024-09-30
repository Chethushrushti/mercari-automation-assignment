const { chromium } = require('playwright');
const readline = require('readline');
const config = require('./config');

(async () => {
  // Step 1: Launch a browser instance
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 2: Go to the Mercari homepage with increased timeout and load event waiting
  try {
    await page.goto(config.urls.mercariHome, { waitUntil: 'load', timeout: config.timeouts.navigation });
    await page.waitForTimeout(config.timeouts.stabilization); // Additional wait for the page to stabilize
    console.log('Navigated to Mercari homepage successfully.');
  } catch (error) {
    console.error('Failed to navigate to Mercari homepage:', error);
    await browser.close();
    return; // Exit if the navigation fails
  }

  // Step 3: Click on the search bar and  Click on "Select by category" (カテゴリーからさがす)
  try {
    // Click on the search bar
    await page.waitForSelector(config.selectors.searchInput, { timeout: config.timeouts.selector });
    await page.click(config.selectors.searchInput);
    console.log('Clicked on the search bar successfully.');

    // Wait for the autocomplete options to appear
    await page.waitForSelector(config.selectors.autocomplete, { timeout: config.timeouts.selector });

    // "Select by category" (カテゴリーからさがす)
    await page.click(config.selectors.autocomplete);
    console.log('Selected the autocomplete suggestion from the search bar successfully.');

    // Wait for the navigation to the search results page
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the search results page successfully.');
  } catch (error) {
    console.error('Failed to click on the search bar and select the autocomplete suggestion:', error);
    await browser.close();
    return; // Exit if the typing or navigation fails
  }

  // Step 4: Select "Books, Music & Games" as the tier 1 category (本・音楽・ゲーム)
  try {
    await page.waitForSelector(config.selectors.firstBooksOption, { timeout: config.timeouts.selector });
    await page.click(config.selectors.firstBooksOption);
    console.log('Selected the first "Books" option successfully.');

    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the Books page successfully.');
  } catch (error) {
    console.error('Failed to select the first "Books" option:', error);
    await browser.close();
    return; // Exit if the selection fails
  }

  // Step 5: Select "Books" as the tier 2 category (本)
  try {
    await page.waitForSelector(config.selectors.secondBooksOption, { timeout: config.timeouts.selector });
    await page.click(config.selectors.secondBooksOption);
    console.log('Selected the second "Books" option successfully.');

    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the second Books page successfully.');
  } catch (error) {
    console.error('Failed to select the second "Books" option:', error);
    await browser.close();
    return; // Exit if the selection fails
  }

  // Step 6:  Select "Computers & Technology" as the tier 3 category (コンピュータ/IT)
  try {
    await page.waitForSelector(config.selectors.categoryBooks, { timeout: config.timeouts.selector });
    await page.click(config.selectors.categoryBooks);
    console.log('Selected the "Category of Books" option successfully.');

    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the Category of Books page successfully.');
  } catch (error) {
    console.error('Failed to select the "Category of Books" option:', error);
    await browser.close();
    return; // Exit if the selection fails
  }

  // Close the browser after inspection
  console.log('Leaving the browser open for inspection...');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Press Enter to close the browser...', async () => {
    await browser.close();
    rl.close();
  });

})();
