// mercariSearchHistoryTest_normalized.js

const { chromium } = require('playwright');
const readline = require('readline');
const config = require('./config');

// Utility functions for reusable actions
async function navigateTo(page, url, successMessage) {
  await page.goto(url, { waitUntil: 'load', timeout: config.timeouts.navigation });
  await page.waitForTimeout(config.timeouts.stabilization);
  console.log(successMessage);
}

async function clickAndNavigate(page, selector, successMessage) {
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

async function verifySelectedValue(page, selector, expectedValue, itemName) {
  await page.waitForSelector(selector, { timeout: config.timeouts.selector });
  const selectedValue = await page.$eval(selector, select => select.value);
  if (selectedValue === expectedValue) {
    console.log(`Verified that "${itemName}" is selected correctly in the dropdown.`);
  } else {
    console.error(`Incorrect value selected. Expected: "${itemName}" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
}

(async () => {
  // Step 1: Launch a browser instance
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 2: Go to the Mercari homepage
    await navigateTo(page, config.urls.mercariHome, 'Navigated to Mercari homepage successfully.');

    // Step 3: Perform search actions
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar successfully.');
    await clickElement(page, config.selectors.autocomplete, 'Selected the autocomplete suggestion successfully.');
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the search results page successfully.');

    // Steps 4-6: Select Categories
    const categorySteps = [
      { selector: config.selectors.firstBooksOption, message: 'Selected the "Books, Music & Games" option successfully.' },
      { selector: config.selectors.secondBooksOption, message: 'Selected the "Books" option successfully.' },
      { selector: config.selectors.businessRelatedBooksOption, message: 'Selected the "Computers & Technology" option successfully.' },
    ];
    for (const step of categorySteps) {
      await clickAndNavigate(page, step.selector, step.message);
    }

    // Steps 7-10: Repeat similar category actions
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar again successfully.');
    await clickElement(page, config.selectors.autocomplete, 'Selected the "Select by category" suggestion successfully.');

    const repeatCategorySteps = [
      { selector: config.selectors.firstBooksOption, message: 'Selected the "Books, Music & Games" option successfully.' },
      { selector: config.selectors.secondBooksOption, message: 'Selected the "Books" option successfully.' },
      { selector: config.selectors.categoryBooks, message: 'Selected the "Computers & Technology" option successfully.' },
    ];
    for (const step of repeatCategorySteps) {
      await clickAndNavigate(page, step.selector, step.message);
    }

    // Step 11: Click the search bar again
    await clickElement(page, config.selectors.searchInput, 'Clicked on the search bar again successfully.');

    // Step 12: Verify there are 2 browsing histories
    await page.waitForSelector(config.selectors.browsingHistoryItem, { timeout: config.timeouts.selector });
    let historyItems = await page.$$(config.selectors.browsingHistoryItem);
    if (historyItems.length === 2) {
      console.log('Successfully found 2 browsing history entries.');
    } else {
      console.error(`Expected 2 browsing history entries, but found ${historyItems.length}`);
    }

    // Step 13: Verify the latest browsing history
    await page.waitForSelector(config.selectors.latestBrowsingHistory, { timeout: config.timeouts.selector });
    const latestHistoryText = (await page.textContent(config.selectors.latestBrowsingHistory)).trim();
    if (/コンピュータ・IT|コンピュータ\/IT/.test(latestHistoryText)) {
      console.log('Latest browsing history is correctly set to "Computers & Technology / コンピュータ・IT".');
    } else {
      console.error(`Latest browsing history is incorrect: Found "${latestHistoryText}" instead.`);
    }

    // Step 14: Click on the latest browsing history
    await clickAndNavigate(page, config.selectors.latestBrowsingHistory, 'Clicked on the latest browsing history successfully.');

    // Step 15: Input "javascript" in the search bar and search
    const searchInputSelector = config.selectors.searchInput;
    await page.waitForSelector(searchInputSelector, { timeout: config.timeouts.selector });
    await page.fill(searchInputSelector, 'javascript');
    console.log('Input "javascript" in the search bar successfully.');
    await page.press(searchInputSelector, 'Enter');
    console.log('Searched with the keyword "javascript" successfully.');
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('Navigated to the search results page successfully.');

    // Step 16: Verify that "本・雑誌・漫画" is selected in the dropdown
    await verifySelectedValue(page, '#accordion_content > div > div:nth-child(1) > div > div.selectWrapper__da4764db > select', '5', '本・雑誌・漫画');

    // Step 17: Verify that "本" is selected in the dropdown
    await verifySelectedValue(page, '#accordion_content > div > div:nth-child(2) > div > div.selectWrapper__da4764db > select', '72', '本');

    // Step 18: Verify that "コンピュータ・IT" is selected (checked)
    const checkboxSelector = '#accordion_content > div > div.merFormGroup.mer-spacing-b-16 > div > label:nth-child(8) > input';
    await page.waitForSelector(checkboxSelector, { timeout: config.timeouts.selector });
    const isChecked = await page.$eval(checkboxSelector, checkbox => checkbox.checked);
    if (isChecked) {
      console.log('Verified that "コンピュータ・IT" is selected (checked) correctly.');
    } else {
      console.error('The checkbox for "コンピュータ・IT" is not checked.');
    }

    // Step 19: Go back to the Mercari top page
    await navigateTo(page, config.urls.mercariHome, 'Navigated back to the Mercari homepage successfully.');

    // Step 20: Click on the search bar again
    await clickElement(page, searchInputSelector, 'Clicked on the search bar again successfully.');

    // Step 21: Verify that there are 3 browsing histories
    await page.waitForSelector(config.selectors.browsingHistoryItem, { timeout: config.timeouts.selector });
    historyItems = await page.$$(config.selectors.browsingHistoryItem);
    if (historyItems.length === 3) {
      console.log('Successfully found 3 browsing history entries.');
    } else {
      console.error(`Expected 3 browsing history entries, but found ${historyItems.length}`);
    }

    // Step 22: Verify that the latest browsing history is showing correctly
    const expectedHistory = ['javascript, コンピュータ・IT', 'コンピュータ・IT', 'ビジネス・経済'];
    let verificationPassed = true;
    for (let i = 0; i < expectedHistory.length; i++) {
      const historyText = (await historyItems[i].textContent()).trim();
      if (!historyText.includes(expectedHistory[i])) {
        console.error(`Expected "${expectedHistory[i]}", but found "${historyText}"`);
        verificationPassed = false;
      }
    }
    if (verificationPassed) {
      console.log('Verified that the latest browsing history is showing correctly in the expected order.');
    } else {
      console.error('The browsing history is not in the expected order.');
    }
  } catch (error) {
    console.error('An error occurred during the script execution:', error);
  } finally {
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
  }
})();