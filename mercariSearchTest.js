const { chromium } = require('playwright');
const readline = require('readline');
const config = require('./config');

// Utility functions for reusable actions

// Function to navigate to a specified URL
async function navigateToPage(page, url, successMessage) {
  await page.goto(url, { waitUntil: 'load', timeout: config.timeouts.navigation });
  await page.waitForTimeout(config.timeouts.stabilization); // Additional wait for the page to stabilize
  console.log(successMessage);
  await pause(); // Pause for observation
}

// Function to click an element, with an option to wait for navigation
async function clickElement(page, selector, successMessage, shouldWaitForNavigation = false) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  await page.click(selector);
  console.log(successMessage);
  if (shouldWaitForNavigation) {
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
  }
  await pause(); // Pause for observation
}

// Function to verify dropdown selection
async function verifyDropdownSelection(page, selector, expectedValue, expectedText) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  const selectedValue = await page.$eval(selector, (select) => select.value);
  if (selectedValue === expectedValue) {
    console.log(`Verified that "${expectedText}" is selected correctly in the dropdown.`);
  } else {
    console.error(`Incorrect value selected. Expected: "${expectedText}" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
  await pause();
}

// Function to verify checkbox selection
async function verifyCheckboxSelection(page, selector, expectedText) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  const isChecked = await page.$eval(selector, (checkbox) => checkbox.checked);
  if (isChecked) {
    console.log(`Verified that "${expectedText}" is selected (checked) correctly.`);
  } else {
    console.error(`The checkbox for "${expectedText}" is not checked.`);
  }
  await pause();
}

// Function to pause execution for a specified time (default is 2 seconds)
async function pause(duration = 2000) {
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

    // Step 3: Click on the search bar and then select "Select by category" (カテゴリーからさがす)
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar successfully.');
    await clickElement(page, config.selectors.autocomplete, 'Selected the autocomplete suggestion from the search bar successfully.', true);

    // Step 4: Select "Books, Music & Games" as the tier 1 category (本・音楽・ゲーム)
    await clickElement(page, config.selectors.firstBooksOption, 'Selected the first "Books" option successfully.', true);

    // Step 5: Select "Books" as the tier 2 category (本)
    await clickElement(page, config.selectors.secondBooksOption, 'Selected the second "Books" option successfully.', true);

    // Step 6: Select "Computers & Technology" as the tier 3 category (コンピュータ/IT)
    await clickElement(page, config.selectors.categoryBooks, 'Selected the "Category of Books" option successfully.', true);

    // Step 7: Verify the search conditions on the left sidebar are set correctly
    await verifyDropdownSelection(page, config.selectors.dropdownFirstSelection, '5', '本・雑誌・漫画');
    await verifyDropdownSelection(page, config.selectors.dropdownSecondSelection, '72', '本');
    await verifyCheckboxSelection(page, config.selectors.checkboxThirdSelection, 'コンピュータ・IT');

  } catch (error) {
    // Handle any errors that occur during execution
    console.error('An error occurred:', error);
    await browser.close();
    return; // Exit if an error occurs
  }

  // Keep the browser open for inspection until the user closes it
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
