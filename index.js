const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const scrapeAmazon = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: './user_data',
    });

    const page = await browser.newPage();

    await page.goto('https://www.amazon.in/s?k=condoms', {
      waitUntil: 'load'
    });

    let productList = [];
    let pageCounter = 1;

    const logProductInfo = (title, price, image) => {
      console.log(`${pageCounter} Title: ${title}, Price: ${price}, Image: ${image}`);
    };

    const scrapeProduct = async (product) => {
      try {
        const titleElement = await product.$('h2 span');
        const priceElement = await product.$('.a-price .a-offscreen');
        const imageElement = await product.$('.s-image');

        const title = titleElement ? await page.evaluate(el => el.textContent.trim(), titleElement) : null;
        const price = priceElement ? await page.evaluate(el => el.textContent.trim(), priceElement) : null;
        const image = imageElement ? await page.evaluate(el => el.getAttribute('src'), imageElement) : null;

        if (title !== null && price !== null) {
          productList.push({ title, price, image });
          logProductInfo(title, price, image || 'Image not found');
        } else {
          console.log(`Skipping product due to missing title or price.`);
        }
      } catch (error) {
        console.error('An error occurred while scraping product:', error);
      }
    };

    // Wait for the main content area to be present
    await page.waitForSelector('.s-main-slot');

    while (true) {
      const products = await page.$$('.s-main-slot .s-result-item');

      for (const product of products) {
        await scrapeProduct(product);
      }

      const nextButton = await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator');
      const isNextButtonDisabled = await nextButton.evaluate(button => button.classList.contains('s-pagination-disabled'));

      if (isNextButtonDisabled) {
        break;
      } else {
        await nextButton.click();
        await page.waitForTimeout(2000); // Add a delay to ensure the page loads completely
        pageCounter++;
      }

      // Save data to CSV periodically (adjust the threshold as needed)
      if (pageCounter % 5 === 0 && productList.length > 0) {
        const csvWriter = createCsvWriter({
          path: 'products.csv',
          header: [
            { id: 'title', title: 'Title' },
            { id: 'price', title: 'Price' },
            { id: 'image', title: 'Image' }
          ],
          append: true
        });

        await csvWriter.writeRecords(productList);

        console.log(`Data written to products.csv (page ${pageCounter})`);
      }
    }

    // Save the remaining data to CSV
    if (productList.length > 0) {
      const csvWriter = createCsvWriter({
        path: 'products.csv',
        header: [
          { id: 'title', title: 'Title' },
          { id: 'price', title: 'Price' },
          { id: 'image', title: 'Image' }
        ],
        append: true
      });

      await csvWriter.writeRecords(productList);

      console.log('Final data written to products.csv');
    }

    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

scrapeAmazon();
