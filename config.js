// config.js

module.exports = {
  urls: {
    mercariHome: 'https://jp.mercari.com/',
  },
  selectors: {
    searchInput: '#__next > div.sc-afb8959c-0.bA-DVcr > header > div > div > div.navigationSection__6d8930f1.centerSection__6d8930f1 > div > div > div.inputContainer__9b09c9a3 > form > div.sc-de99d471-2.dPZxdm.mer-spacing-l-16 > input',
    autocomplete: '#search-bar-autocomplete > div > div.merList.separator__17a1e07b > div:nth-child(1) > div.content__884ec505 > a',
    firstBooksOption: '#main > div.merList.border__17a1e07b.separator__17a1e07b > div:nth-child(6) > div.content__884ec505 > a',
    secondBooksOption: '#main > div.merList.border__17a1e07b.separator__17a1e07b > div:nth-child(2) > div.content__884ec505 > a',
    businessRelatedBooksOption: '#main > div.merList.border__17a1e07b.separator__17a1e07b > div:nth-child(10)',
    categoryBooks: '#main > div.merList.border__17a1e07b.separator__17a1e07b > div:nth-child(8) > div.content__884ec505 > a',
    browsingHistoryItem: '#search-bar-autocomplete > div > section > div.merList.border__17a1e07b.separator__17a1e07b > div',
    latestBrowsingHistory: '#search-bar-autocomplete > div > section > div.merList.border__17a1e07b.separator__17a1e07b > div:nth-child(1) > div.content__884ec505 > a',
    sidebarAccordion: '#accordion_content > div',
    sidebarCondition1: '#accordion_content > div > div:nth-child(1) > div > div.selectWrapper__da4764db > select > option[value="5"]',
    sidebarCondition2: '#accordion_content > div > div:nth-child(2) > div > div.selectWrapper__da4764db > select > option[value="72"]',
    sidebarCondition3: '#accordion_content > div > div.merFormGroup.mer-spacing-b-16 > div > label:nth-child(8)',
  },
  timeouts: {
    navigation: 60000,
    selector: 30000,
    stabilization: 5000,
  },
};
