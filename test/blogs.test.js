const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build(); //Creates new browser window and page tab for us
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login(); //simulates a login by attaching cookies/session etc
    await page.click('a.btn-floating');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form .title label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title'); //Enters in text into the selected input
      await page.type('.content input', 'My Content');
      await page.click('form button'); //Submits the form
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green'); //Since this is an ajax request to a backend api, we need to wait a little longer for the content to appear so we need to add a waitFor statement
      await page.waitFor('.card'); //Waiting for class of card since now will know were back at the blogs page

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.title .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  test('User cannot create blog posts', async () => {
    const result = await page.evaluate(() => {
      //passing in an arrow function to the .evaluate method needed because chromium needs to turn the code into a string -> into js -> execute and then return the result back to our testing environment
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'My Title', content: 'My Content' })
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('User cannot get a list of blogs', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });
});
