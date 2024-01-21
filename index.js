const puppeteer = require('puppeteer');

(async () => {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: 'new' });

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the OpenAI page
    await page.goto('https://www.openai.com/');
    await page.screenshot({ path: 'openai.png' });

    // Get and print the title of the page
    const pageTitle = await page.title();
    console.log('The title of the OpenAI page is:', pageTitle);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
