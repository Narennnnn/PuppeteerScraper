const puppeteer = require('puppeteer');

(async () => {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({ 
      headless: 'new', 
      defaultViewport: null,
      userDataDir: './user_data',
    });

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the Flipkart page
    await page.goto('https://www.flipkart.com/search?q=gaming%20products&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off');

    // Wait for the product list to load
    await page.waitForSelector('._1YokD2 ._3Mn1Gg');//parent div

    // Get the list of products
    const products = await page.$$('._1YokD2 ._3Mn1Gg');

    // Loop through each product and print its title
    for (const product of products) {
      // Find the title element within each product using the _13oc-S class
      const titleElement = await product.$('a.s1Q9rs');//content selector to pick

      // Check if the title element is found
      if (titleElement) {
        const title = await page.evaluate(el => el.textContent.trim(), titleElement);
        console.log(title);
      } else {
        // console.log('Title element not found for the current product.');
      }
    }

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
