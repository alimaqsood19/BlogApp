const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    //Creating the puppeteer page
    const page = await browser.newPage();

    //Instance of CustomPage
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property]; //Combining access to three diff objects
      } //browser has two purpose to create the new page and to close the browser after testing, with proxy we can access those methods
    });
  }
  //Whenever we create a new instance of CustomPage we are saving a reference of page to it
  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory(); //returns a new promise, takes the result of it and assigns it to the user variable
    const { session, sig } = sessionFactory(user); //Now we have session and sig from sessionFactory

    //Maniuplating cookies on chromium browser to simulate that we are logged in:
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    //Refresh the page so the app re-renders once we have "logged in" with the set cookies
    await this.page.goto('localhost:3000/blogs'); //Redirect back to blogs route which is desired

    //add WaitFor function to wait for this element to appear after the refresh from above
    await this.page.waitFor('a[href="/auth/logout"]'); //waits for logout button to appear
  }

  async getContentsOf(selector) {
    //Wheenver we want to get the contents of a selector we can call this function
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
