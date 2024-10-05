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
    console.log(`22. Verified that "${itemName}" is selected correctly in the dropdown.`);
  } else {
    console.error(` Incorrect value selected. Expected: "${itemName}" (value: ${expectedValue}), but found value: ${selectedValue}`);
  }
}

(async () => {
  // Step 1: Launch a browser instance
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 2: Go to the Mercari homepage
    await navigateTo(page, config.urls.mercariHome, '1. Navigated to Mercari homepage successfully.');
    await page.waitForTimeout(500); 

    // Step 3: Perform search actions
    await clickElement(page, config.selectors.searchInput, '2. Clicked on the search bar successfully.');
    await page.waitForTimeout(500); 
    await clickElement(page, config.selectors.autocomplete, '3. Selected the autocomplete suggestion successfully.');
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('4. Navigated to the search results page successfully.');

    // Steps 4-6: Select Categories
    const categorySteps = [
      { selector: config.selectors.firstBooksOption, message: '5. Selected the "Books, Music & Games" option successfully.' },
      { selector: config.selectors.secondBooksOption, message: '6. Selected the "Books" option successfully.' },
      { selector: config.selectors.businessRelatedBooksOption, message: '7. Selected the "Computers & Technology" option successfully.' },
    ];
    for (const step of categorySteps) {
      await clickAndNavigate(page, step.selector, step.message);
    }

    // Steps 7-10: Repeat similar category actions
    await clickElement(page, config.selectors.searchInput, '8. Clicked on the search bar again successfully.');
    // await page.waitForTimeout(500); 
    await clickElement(page, config.selectors.autocomplete, '9. Selected the "Select by category" suggestion successfully.');

    const repeatCategorySteps = [
      { selector: config.selectors.firstBooksOption, message: '10. Selected the "Books, Music & Games" option successfully.' },
      { selector: config.selectors.secondBooksOption, message: '11. Selected the "Books" option successfully.' },
      { selector: config.selectors.categoryBooks, message: '12. Selected the "Computers & Technology" option successfully.' },
    ];
    for (const step of repeatCategorySteps) {
      await clickAndNavigate(page, step.selector, step.message);
    }

    // Step 11: Click the search bar again
    await clickElement(page, config.selectors.searchInput, '13. Clicked on the search bar again successfully.');
    // await page.waitForTimeout(500); 

    // Step 12: Verify there are 2 browsing histories
    await page.waitForSelector(config.selectors.browsingHistoryItem, { timeout: config.timeouts.selector });
    let historyItems = await page.$$(config.selectors.browsingHistoryItem);
    if (historyItems.length === 2) {
      console.log('14. Successfully found 2 browsing history entries.');
    } else {
      console.error(`15. Expected 2 browsing history entries, but found ${historyItems.length}`);
    }
    // await page.waitForTimeout(500); 

    // Step 13: Verify the latest browsing history
    await page.waitForSelector(config.selectors.latestBrowsingHistory, { timeout: config.timeouts.selector });
    const latestHistoryText = (await page.textContent(config.selectors.latestBrowsingHistory)).trim();
    if (/コンピュータ・IT|コンピュータ\/IT/.test(latestHistoryText)) {
      console.log('16. Latest browsing history is correctly set to "Computers & Technology / コンピュータ・IT".');
    } else {
      console.error(`17. Latest browsing history is incorrect: Found "${latestHistoryText}" instead.`);
    }
    // await page.waitForTimeout(500); 

    // Step 14: Click on the latest browsing history
    await clickAndNavigate(page, config.selectors.latestBrowsingHistory, '18. Clicked on the latest browsing history successfully.');
    // await page.waitForTimeout(500); 

    // Step 15: Input "javascript" in the search bar and search
    const searchInputSelector = config.selectors.searchInput;
    await page.waitForSelector(searchInputSelector, { timeout: config.timeouts.selector });
    await page.fill(searchInputSelector, 'javascript');
    console.log('19. Input "javascript" in the search bar successfully.');
    // await page.waitForTimeout(500); 
    await page.press(searchInputSelector, 'Enter');
    console.log('20. Searched with the keyword "javascript" successfully.');
    // await page.waitForTimeout(500); 
    await page.waitForNavigation({ waitUntil: 'load', timeout: config.timeouts.navigation });
    console.log('21. Navigated to the search results page successfully.');
    // await page.waitForTimeout(500); 

   // Step 16: Verify that "本・雑誌・漫画" is selected in the dropdown
await verifySelectedValue(page, config.selectors.categoryDropdown1, '5', '本・雑誌・漫画');
await page.waitForTimeout(2000); // Wait 2 seconds to verify

// Step 17: Verify that "本" is selected in the dropdown
await verifySelectedValue(page, config.selectors.categoryDropdown2, '72', '本');
await page.waitForTimeout(2000); // Wait 2 seconds to verify

// Step 18: Verify that "コンピュータ・IT" is selected (checked)
const checkboxSelector = config.selectors.computerITCheckbox;
await page.waitForSelector(checkboxSelector, { timeout: config.timeouts.selector });
const isChecked = await page.$eval(checkboxSelector, checkbox => checkbox.checked);
if (isChecked) {
  console.log('Verified that "コンピュータ・IT" is selected (checked) correctly.');
} else {
  console.error('The checkbox for "コンピュータ・IT" is not checked.');
}
await page.waitForTimeout(3000); // Wait 3 seconds to verify


    // Step 19: Go back to the Mercari top page
    await navigateTo(page, config.urls.mercariHome, '24. Navigated back to the Mercari homepage successfully.');
    // await page.waitForTimeout(500); 

    // Step 20: Click on the search bar again
    await clickElement(page, searchInputSelector, '25. Clicked on the search bar again successfully.');
    // await page.waitForTimeout(500); 

    // Step 21: Verify that there are 3 browsing histories
    await page.waitForSelector(config.selectors.browsingHistoryItem, { timeout: config.timeouts.selector });
    historyItems = await page.$$(config.selectors.browsingHistoryItem);
    if (historyItems.length === 3) {
      console.log('26. Successfully found 3 browsing history entries.');
    } else {
      console.error(` Expected 3 browsing history entries, but found ${historyItems.length}`);
    }
    // await page.waitForTimeout(500); 

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
      console.log('27. Verified that the latest browsing history is showing correctly in the expected order.');
    // await page.waitForTimeout(500); 
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