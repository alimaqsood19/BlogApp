// const puppeteer = require('puppeteer');
// const sessionFactory = require('./factories/sessionFactory');
// const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page'); //CustomPage class

let page;

beforeEach(async () => {
  //Before each test
  // browser = await puppeteer.launch({ headless: false }); //Creates a browser for us
  // page = await browser.newPage(); //Creates a new tab/page in the browser we just created

  page = await Page.build(); //Gives us back page instance by caling the static build function
  //page will allow us to make clicks or render different things, tests will interact with this page variable
  await page.goto('localhost:3000'); //Once page is launched, telling page to visit this URL
});

afterEach(async () => {
  //performed after each test, in this case closes the browser
  // await browser.close();
  await page.close();
});

test('the header has the correct text', async () => {
  //Grab content on DOM through a selector
  const text = await page.getContentsOf('a.brand-logo');
  // const text = await page.$eval('a.brand-logo', el => el.innerHTML); //$eval, $ allowed variable, serialized into text, sent to chromium executed,
  // result is serialized back to JS and sent back to nodejs runtime

  expect(text).toEqual('Blogster');
});

test('clicking login starts oAuth flow', async () => {
  await page.waitFor('.right a');
  await page.click('.right a');

  const url = await page.url(); //grabs the url from current page

  expect(url).toMatch(/accounts\.google\.com/); //backward slash to escape period so it doesnt mess up regex
});

test('When signed in, shows logout button', async () => {
  //attempt to sign in and make sure a logout button appears if were truly signed in
  // const id = '5ae9422164ce642ca2d72aba'; //Existing user in DB ID - instead were now using userFactory

  await page.login(); //Calling the customPage login method

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML); //Grabs the innerHTML of the logout button

  expect(text).toEqual('Logout');
});
