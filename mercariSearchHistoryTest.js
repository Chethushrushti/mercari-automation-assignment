const { chromium } = require('playwright');
const readline = require('readline');
const config = require('./config');

// Utility functions for reusable actions
async function navigateToHome(page) {
  await page.goto(config.urls.mercariHome, { waitUntil: 'load', timeout: config.timeouts.navigation });
  await page.waitForTimeout(config.timeouts.stabilization);
  console.log('Navigated to Mercari homepage successfully.');
}

async function clickAndWait(page, selector, successMessage) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  await page.click(selector);
  console.log(successMessage);
  await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
}

async function clickElement(page, selector, successMessage) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  await page.click(selector);
  console.log(successMessage);
}

(async () => {
  // Step 1: Launch a browser instance
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  // Step 2: Go to the Mercari homepage
  try {
    await navigateToHome(page);
  } catch (error) {
    console.error('Failed to navigate to Mercari homepage:', error);
    await browser.close();
    return;
  }
  // Steps: Repeated Actions in a Normalized Way
  try {
    // Step 3: Click search bar and "Select by category"
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar successfully.');
    await clickElement(page, config.selectors.autocomplete, 'Selected the autocomplete suggestion successfully.');
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the search results page successfully.');

    // Step 4-6: Select Categories
    await clickAndWait(page, config.selectors.firstBooksOption, 'Selected the "Books, Music & Games" option successfully.');
    await clickAndWait(page, config.selectors.secondBooksOption, 'Selected the "Books" option successfully.');
    await clickAndWait(page, config.selectors.businessRelatedBooksOption, 'Selected the "Computers & Technology" option successfully.');

    // Step 7-10: Repeat similar category actions
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar again successfully.');
    await clickElement(page, config.selectors.autocomplete, 'Selected the "Select by category" suggestion successfully.');
    await clickAndWait(page, config.selectors.firstBooksOption, 'Selected the "Books, Music & Games" option successfully.');
    await clickAndWait(page, config.selectors.secondBooksOption, 'Selected the "Books" option successfully.');
    await clickAndWait(page, config.selectors.categoryBooks, 'Selected the "Computers & Technology" option successfully.');

    // Step 11: Click the search bar again
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar again successfully.');

    // Step 12: Verify there are 2 browsing histories
    await page.waitForSelector(config.selectors.browsingHistoryItem, { timeout: config.timeouts.selector });
    const historyItems = await page.$$(config.selectors.browsingHistoryItem);
    if (historyItems.length === 2) {
      console.log('Successfully found 2 browsing history entries.');
    } else {
      console.error(`Expected 2 browsing history entries, but found ${historyItems.length}`);
    }

    // Step 13: Verify the latest browsing history
    await page.waitForSelector(config.selectors.latestBrowsingHistory, { timeout: config.timeouts.selector });
    const latestHistoryText = await page.textContent(config.selectors.latestBrowsingHistory);
   
    // Normalize text comparison by trimming whitespace and ensuring consistency
    const normalizedText = latestHistoryText.trim();
    if (normalizedText.includes('コンピュータ・IT') || normalizedText.includes('コンピュータ/IT')) {
      console.log('Latest browsing history is correctly set to "Computers & Technology / コンピュータ/IT".');
    } else {
      console.error(`Latest browsing history is incorrect: Found "${normalizedText}" instead.`);
    }
  } catch (error) {
    console.error('An error occurred during one of the steps:', error);
    await browser.close();
    return;
  }

  // Step 14: Click on the latest browsing history
try {
  // Wait for the latest browsing history item to be available
  await page.waitForSelector(config.selectors.latestBrowsingHistory, { timeout: config.timeouts.selector });

  // Click on the latest browsing history item
  await page.click(config.selectors.latestBrowsingHistory);
  console.log('Clicked on the latest browsing history successfully.');

  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
  console.log('Navigated to the page from the latest browsing history successfully.');
} catch (error) {
  console.error('Failed to click on the latest browsing history:', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 15: Input "javascript" in the search bar and search with the keyword
try {
  const searchInputSelector = config.selectors.searchInput; // Assuming this is the same search input used previously
  // Wait for the search input element to be available
  await page.waitForSelector(searchInputSelector, { timeout: config.timeouts.selector });
  // Type "javascript" in the search bar
  await page.fill(searchInputSelector, 'javascript');
  console.log('Input "javascript" in the search bar successfully.');
  // Submit the search by pressing Enter
  await page.press(searchInputSelector, 'Enter');
  console.log('Searched with the keyword "javascript" successfully.');
  // Wait for the search results to load
  await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
  console.log('Navigated to the search results page successfully.');
} catch (error) {
  console.error('Failed to input "javascript" in the search bar and search:', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 16: Verify that "本・雑誌・漫画" is selected in the dropdown
try {
  const dropdownSelector = '#accordion_content > div > div:nth-child(1) > div > div.selectWrapper__da4764db > select';
  // Wait for the dropdown element to be available
  await page.waitForSelector(dropdownSelector, { timeout: config.timeouts.selector });
  // Get the value of the selected option in the dropdown
  const selectedValue = await page.$eval(dropdownSelector, select => select.value);
  // Expected value for "本・雑誌・漫画" (based on the value attribute in the HTML)
  const expectedValue = '5';
  if (selectedValue === expectedValue) {
    console.log('Verified that "本・雑誌・漫画" is selected correctly in the dropdown.');
  } else {
    console.error(`Incorrect value selected. Expected: "本・雑誌・漫画" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
} catch (error) {
  console.error('Failed to verify the selected value in the dropdown:', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 17: Verify that "本" is selected in the dropdown
try {
  const dropdownSelector = '#accordion_content > div > div:nth-child(2) > div > div.selectWrapper__da4764db > select';
  // Wait for the dropdown element to be available
  await page.waitForSelector(dropdownSelector, { timeout: config.timeouts.selector });

  // Get the value of the selected option in the dropdown
  const selectedValue = await page.$eval(dropdownSelector, select => select.value);
  // Expected value for "本" (based on the value attribute in the HTML)
  const expectedValue = '72';
  if (selectedValue === expectedValue) {
    console.log('Verified that "本" is selected correctly in the dropdown.');
  } else {
    console.error(`Incorrect value selected. Expected: "本" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
} catch (error) {
  console.error('Failed to verify the selected value in the dropdown for "本":', error);
  await browser.close();
  return; // Exit if the action fails
}
// Step 18: Verify that "コンピュータ・IT" is selected (checked)
try {
  const checkboxSelector = '#accordion_content > div > div.merFormGroup.mer-spacing-b-16 > div > label:nth-child(8) > input';
  // Wait for the checkbox element to be available
  await page.waitForSelector(checkboxSelector, { timeout: config.timeouts.selector });
  // Check if the checkbox is checked
  const isChecked = await page.$eval(checkboxSelector, checkbox => checkbox.checked);
  if (isChecked) {
    console.log('Verified that "コンピュータ・IT" is selected (checked) correctly.');
  } else {
    console.error('The checkbox for "コンピュータ・IT" is not checked.');
  }
} catch (error) {
  console.error('Failed to verify if "コンピュータ・IT" is selected (checked):', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 19: Go back to the Mercari top page (https://jp.mercari.com/)
try {
  // Navigate back to the Mercari homepage
  await page.goto(config.urls.mercariHome, { waitUntil: 'load', timeout: config.timeouts.navigation });
  console.log('Navigated back to the Mercari homepage successfully.');
} catch (error) {
  console.error('Failed to navigate back to the Mercari homepage:', error);
  await browser.close();
  return; // Exit if the action fails
}
// Step 20: Click on the search bar again
try {
  const searchInputSelector = config.selectors.searchInput; // Assuming it's the same search bar selector used previously
 
  // Wait for the search input element to be available
  await page.waitForSelector(searchInputSelector, { timeout: config.timeouts.selector });
  // Click the search bar
  await page.click(searchInputSelector);
  console.log('Clicked on the search bar again successfully.');
} catch (error) {
  console.error('Failed to click on the search bar again:', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 21: Verify that there are 3 browsing histories
try {
  const browsingHistorySelector = config.selectors.browsingHistoryItem; // Assuming the browsing history items have the same selector
  // Wait for the browsing history section to be available
  await page.waitForSelector(browsingHistorySelector, { timeout: config.timeouts.selector });
  // Get all browsing history elements
  const historyItems = await page.$$(browsingHistorySelector);
  // Check if the number of browsing history items is 3
  if (historyItems.length === 3) {
    console.log('Successfully found 3 browsing history entries.');
  } else {
    console.error(`Expected 3 browsing history entries, but found ${historyItems.length}`);
  }
} catch (error) {
  console.error('Failed to verify the number of browsing history entries:', error);
  await browser.close();
  return; // Exit if the action fails
}

// Step 14 : Verify that the latest browsing history is showing correctly
try {
  const browsingHistorySelector = config.selectors.browsingHistoryItem; // Assuming the browsing history items have the same selector
  // Wait for the browsing history section to be available
  await page.waitForSelector(browsingHistorySelector, { timeout: config.timeouts.selector });
  // Get all browsing history elements
  const historyItems = await page.$$(browsingHistorySelector);
  // Expected browsing history order
  const expectedHistory = [
    'javascript, コンピュータ・IT',
    'コンピュータ・IT',
    'ビジネス・経済'
  ];

  // Verify each browsing history item matches the expected value
  let verificationPassed = true;
  for (let i = 0; i < expectedHistory.length; i++) {
    const historyText = await historyItems[i].textContent();
    const normalizedHistoryText = historyText.trim();
    if (!normalizedHistoryText.includes(expectedHistory[i])) {
      console.error(`Expected "${expectedHistory[i]}", but found "${normalizedHistoryText}"`);
      verificationPassed = false;
    }
  }
  if (verificationPassed) {
    console.log('Verified that the latest browsing history is showing correctly in the expected order.');
  } else {
    console.error('The browsing history is not in the expected order.');
  }
} catch (error) {
  console.error('Failed to verify the latest browsing history:', error);
  await browser.close();
  return; // Exit if the action fails
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

