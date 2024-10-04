const { chromium } = require('playwright');
const readline = require('readline');
const config = require('./config');

// Utility functions for reusable actions

// Function to navigate to a specified URL
async function navigateToPage(page, url, successMessage) {
  await page.goto(url, { waitUntil: 'load', timeout: config.timeouts.navigation });
  console.log(successMessage);
  await pause(); // Pause after navigation for observation
}

// Function to click an element, with an option to wait for navigation
async function clickElement(page, selector, successMessage, shouldWaitForNavigation = false) {
  await page.waitForSelector(config.selectors[selector], { timeout: config.timeouts.selector });
  await page.click(config.selectors[selector]);
  console.log(successMessage);
  if (shouldWaitForNavigation) {
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
  }
  await pause(); // Pause after each click for observation
}

// Function to verify if a dropdown has a specific value selected
async function verifyDropdownSelection(page, selector, expectedValue, itemName) {
  await page.waitForSelector(config.selectors[selector], { timeout: config.timeouts.selector });
  const selectedValue = await page.$eval(config.selectors[selector], select => select.value);
  if (selectedValue === expectedValue) {
    console.log(`Verified that "${itemName}" is selected correctly in the dropdown.`);
  } else {
    console.error(`Incorrect value selected. Expected: "${itemName}" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
  await pause(); // Pause after verification for observation
}

// Function to verify if a checkbox is selected
async function verifyCheckboxSelection(page, selector, itemName) {
  await page.waitForSelector(config.selectors[selector], { timeout: config.timeouts.selector });
  const isChecked = await page.$eval(config.selectors[selector], checkbox => checkbox.checked);
  if (isChecked) {
    console.log(`Verified that "${itemName}" is selected (checked) correctly.`);
  } else {
    console.error(`The checkbox for "${itemName}" is not checked.`);
  }
  await pause(); // Pause after verification for observation
}

// Function to verify the count of browsing history entries
async function verifyBrowsingHistoryCount(page, browsingHistorySelector, expectedCount) {
  await page.waitForSelector(config.selectors[browsingHistorySelector], { timeout: config.timeouts.selector });
  const historyItems = await page.$$(config.selectors[browsingHistorySelector]);
  if (historyItems.length === expectedCount) {
    console.log(`Successfully found ${expectedCount} browsing history entries.`);
  } else {
    console.error(`Expected ${expectedCount} browsing history entries, but found ${historyItems.length}`);
  }
  await pause(); // Pause after verification for observation
}

// Function to verify the browsing history order is as expected
async function verifyBrowsingHistoryOrder(page, browsingHistorySelector, expectedHistory) {
  await page.waitForSelector(config.selectors[browsingHistorySelector], { timeout: config.timeouts.selector });
  const historyItems = await page.$$(config.selectors[browsingHistorySelector]);

  if (historyItems.length !== expectedHistory.length) {
    console.error(`Expected ${expectedHistory.length} browsing history entries, but found ${historyItems.length}`);
    return;
  }

  for (let i = 0; i < expectedHistory.length; i++) {
    const historyText = await historyItems[i].textContent();
    const normalizedHistoryText = historyText.trim();
    if (!normalizedHistoryText.includes(expectedHistory[i])) {
      console.error(`Expected "${expectedHistory[i]}", but found "${normalizedHistoryText}"`);
      return;
    }
  }

  console.log('Verified that the latest browsing history is showing correctly in the expected order.');
  await pause(); // Pause after verification for observation
}

// Function to pause execution for a specified time (default is 3 seconds)
async function pause(duration = 3000) {
  await new Promise(resolve => setTimeout(resolve, duration));
}

(async () => {
  // Step 1: Launch a browser instance and create a new page
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 2: Navigate to the Mercari homepage
    await navigateToPage(page, config.urls.mercariHome, 'Navigated to Mercari homepage successfully.');

    // Step 3-6: Perform initial category selection from the search bar
    await clickElement(page, 'searchInput', 'Clicked on the search bar successfully.');
    await clickElement(page, 'autocomplete', 'Selected the autocomplete suggestion successfully.', true);
    await clickElement(page, 'firstBooksOption', 'Selected the "Books, Music & Games" option successfully.', true);
    await clickElement(page, 'secondBooksOption', 'Selected the "Books" option successfully.', true);
    await clickElement(page, 'businessRelatedBooksOption', 'Selected the "Computers & Technology" option successfully.', true);

    // Step 7-10: Repeat category actions for the search bar
    await clickElement(page, 'searchInput', 'Clicked on the search bar again successfully.');
    await clickElement(page, 'autocomplete', 'Selected the "Select by category" suggestion successfully.');
    await clickElement(page, 'firstBooksOption', 'Selected the "Books, Music & Games" option successfully.', true);
    await clickElement(page, 'secondBooksOption', 'Selected the "Books" option successfully.', true);
    await clickElement(page, 'categoryBooks', 'Selected the "Computers & Technology" option successfully.', true);

    // Step 11: Click the search bar again
    await clickElement(page, 'searchInput', 'Clicked on the search bar again successfully.');

    // Step 12: Verify the browsing history count is 2
    await verifyBrowsingHistoryCount(page, 'browsingHistoryItem', 2);

    // Step 13: Click on the latest browsing history entry
    await clickElement(page, 'latestBrowsingHistory', 'Clicked on the latest browsing history successfully.', true);

    // Step 14: Input "javascript" in the search bar and perform a search
    await page.waitForSelector(config.selectors.searchInput, { timeout: config.timeouts.selector });
    await page.fill(config.selectors.searchInput, 'javascript');
    await page.press(config.selectors.searchInput, 'Enter');
    console.log('Searched with the keyword "javascript" successfully.');
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    await pause(); // Pause for observation

    // Step 15-17: Verify dropdown and checkbox selections in the sidebar
    await verifyDropdownSelection(page, 'firstBooksOption', '5', '本・雑誌・漫画');
    await verifyDropdownSelection(page, 'secondBooksOption', '72', '本');
    await verifyCheckboxSelection(page, 'categoryBooks', 'コンピュータ・IT');

    // Step 18: Navigate back to the Mercari top page
    await navigateToPage(page, config.urls.mercariHome, 'Navigated back to the Mercari homepage successfully.');

    // Step 19-20: Click on the search bar again and verify browsing history count (should be 3)
    await clickElement(page, 'searchInput', 'Clicked on the search bar again successfully.');
    await verifyBrowsingHistoryCount(page, 'browsingHistoryItem', 3);

    // Step 21: Verify the browsing history order is correct
    await verifyBrowsingHistoryOrder(page, 'browsingHistoryItem', [
      'javascript, コンピュータ・IT',
      'コンピュータ・IT',
      'ビジネス・経済'
    ]);

  } catch (error) {
    console.error('An error occurred during one of the steps:', error);
  } finally {
    // Leave the browser open for inspection
    console.log('Leaving the browser open for inspection...');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Press Enter to close the browser...', async () => {
      await browser.close();
      rl.close();
    });
  }
})();
