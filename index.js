const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const scrapeAmazon = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: null,
      userDataDir: './user_data',
    });

    const page = await browser.newPage();

    await page.goto('https://www.amazon.in/s?k=condoms', {
      waitUntil: 'load'
    });

    let productList = [];
    let hasNextPage = true;

    while (hasNextPage) {
      await page.waitForSelector('.s-main-slot');

      const products = await page.$$('.s-main-slot .s-result-item');

      for (const product of products) {
        const titleElement = await product.$('h2 span');

        if (titleElement) {
          const title = await page.evaluate(el => el.textContent.trim(), titleElement);

          const priceElement = await product.$('.a-price .a-offscreen');

          if (priceElement) {
            const price = await page.evaluate(el => el.textContent.trim(), priceElement);

            const imageElement = await product.$('.s-image');

            if (imageElement) {
              const image = await page.evaluate(el => el.getAttribute('src'), imageElement);
              const productInfo = {
                title: title,
                price: price,
                image: image
              };
              productList.push(productInfo);
            } else {
              console.log(`Image not found for product: ${title}`);
            }
          } else {
            console.log(`Price not found for product: ${title}`);
          }
        }
      }

      const nextButton = await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator');
      const isNextButtonDisabled = await nextButton.evaluate(button => button.classList.contains('s-pagination-disabled'));

      if (isNextButtonDisabled) {
        hasNextPage = false;
      } else {
        await nextButton.click();
        await page.waitForTimeout(2000); // Add a delay to ensure the page loads completely
      }
    }

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

    console.log('Data written to products.csv');

    await browser.close();
  } catch (error) {
  }
};

scrapeAmazon();
