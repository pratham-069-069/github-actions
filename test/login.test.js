// Import Selenium
import { Builder, By, until, Key } from 'selenium-webdriver';
// Import Chrome-specific helpers to allow headless/configuration options
import chrome from 'selenium-webdriver/chrome.js';
// Import Mocha test functions
import { describe, it, before, after, beforeEach } from 'mocha';
// Import Chai assertion library
import { expect } from 'chai';
// Import path module to handle file paths correctly
import path from 'path';
// Import url module to handle file URLs correctly
import { fileURLToPath } from 'url';

// Get current directory in ES modules (equivalent to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the file path - works on both Windows and Linux
const fileUrl = `file://${path.resolve(__dirname, '..', 'login.html').replace(/\\/g, '/')}`;

// 'describe' creates a test suite
describe('Login Page Test Suite', function () {
  
  // Increase Mocha's default timeout for Selenium
  this.timeout(30000); 

  let driver;

  // 'before' runs once before any tests
  before(async function () {
    // Use headless Chrome with common safe flags so the driver can start in
    // CI/headless environments and avoid GUI-related hangs.
    const options = new chrome.Options()
      // Use the newer headless mode when available; fall back if needed.
      .addArguments('--headless=new')
      .addArguments('--no-sandbox')
      .addArguments('--disable-dev-shm-usage')
      .addArguments('--disable-gpu')
      .addArguments('--window-size=1920,1080');

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  // 'after' runs once after all tests are done
  after(async function () {
    await driver.quit();
  });

  // 'beforeEach' runs before EACH 'it' block (test case)
  // This is perfect for ensuring we are on the login page
  beforeEach(async function () {
    await driver.get(fileUrl);
  });

  // --- Test Cases ---

  it('TC10: Should have the correct page title on load', async function () {
    const title = await driver.getTitle();
    expect(title).to.equal('Login - MyApp'); // [cite: 95]
  });

  it('TC01: Should log in successfully with valid credentials', async function () {
    await driver.findElement(By.id('username')).sendKeys('admin'); // [cite: 111]
    await driver.findElement(By.id('password')).sendKeys('admin123'); // [cite: 111]
    await driver.findElement(By.id('loginBtn')).click(); // [cite: 112]

    // Wait for the title to change, which signals success [cite: 113]
    await driver.wait(until.titleIs('Dashboard MyApp'), 5000); // [cite: 114]
    const title = await driver.getTitle();
    expect(title).to.equal('Dashboard MyApp');
  });

  it('TC02: Should display an error message with invalid credentials', async function () {
    await driver.findElement(By.id('username')).sendKeys('wronguser'); // [cite: 122]
    await driver.findElement(By.id('password')).sendKeys('wrongpass'); // [cite: 123]
    await driver.findElement(By.id('loginBtn')).click(); // [cite: 124]

    // Wait for the error message to appear
    const errorMsg = await driver.findElement(By.id('errorMsg'));
    await driver.wait(until.elementIsVisible(errorMsg), 5000);

    // Check that the error message is displayed [cite: 126]
    const isDisplayed = await errorMsg.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('TC03: Should display validation messages when both fields are blank', async function () {
    // Leave both fields blank and click login
    await driver.findElement(By.id('loginBtn')).click();

    // Wait for the validation message to appear
    const validationMsg = await driver.findElement(By.id('validationMsg'));
    await driver.wait(until.elementIsVisible(validationMsg), 5000);

    // Check that the validation message is displayed and has correct text
    const isDisplayed = await validationMsg.isDisplayed();
    const messageText = await validationMsg.getText();
    expect(isDisplayed).to.be.true;
    expect(messageText).to.equal('Username and password are required');
  });

  it('TC04: Should show "Password required" message when only username is filled', async function () {
    // Fill only username field
    await driver.findElement(By.id('username')).sendKeys('testuser');
    await driver.findElement(By.id('loginBtn')).click();

    // Wait for the validation message to appear
    const validationMsg = await driver.findElement(By.id('validationMsg'));
    await driver.wait(until.elementIsVisible(validationMsg), 5000);

    // Check that the validation message is displayed and has correct text
    const isDisplayed = await validationMsg.isDisplayed();
    const messageText = await validationMsg.getText();
    expect(isDisplayed).to.be.true;
    expect(messageText).to.equal('Password required');
  });

  it('TC05: Should show "Username required" message when only password is filled', async function () {
    // Fill only password field
    await driver.findElement(By.id('password')).sendKeys('testpass');
    await driver.findElement(By.id('loginBtn')).click();

    // Wait for the validation message to appear
    const validationMsg = await driver.findElement(By.id('validationMsg'));
    await driver.wait(until.elementIsVisible(validationMsg), 5000);

    // Check that the validation message is displayed and has correct text
    const isDisplayed = await validationMsg.isDisplayed();
    const messageText = await validationMsg.getText();
    expect(isDisplayed).to.be.true;
    expect(messageText).to.equal('Username required');
  });

  it('TC06: Should mask the password input', async function () {
    const passField = await driver.findElement(By.id('password'));
    const fieldType = await passField.getAttribute('type');
    // Check if the input's 'type' attribute is 'password' [cite: 95]
    expect(fieldType).to.equal('password');
  });

  it('TC07: Should toggle the "Remember Me" checkbox', async function () {
    const checkbox = await driver.findElement(By.id('rememberMe'));
    
    // 1. Verify it's unchecked by default
    expect(await checkbox.isSelected()).to.be.false;

    // 2. Click it and verify it's checked
    await checkbox.click();
    expect(await checkbox.isSelected()).to.be.true; // [cite: 95]

    // 3. Click it again and verify it's unchecked
    await checkbox.click();
    expect(await checkbox.isSelected()).to.be.false;
  });

  it('TC08: Should navigate when "Forgot Password?" link is clicked', async function () {
    await driver.findElement(By.id('forgotPassword')).click();

    // Wait for the URL to contain the new page name [cite: 95]
    await driver.wait(until.urlContains('forgot-password.html'), 5000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('forgot-password.html');
  });

  it('TC09: Should return to login page when using "Back" button (Demo Behavior)', async function () {
    // This test checks the simple behavior of our demo page.
    // A real app with session handling should *prevent* going back to the login page. [cite: 95]

    // 1. Log in
    await driver.findElement(By.id('username')).sendKeys('admin');
    await driver.findElement(By.id('password')).sendKeys('admin123');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.titleIs('Dashboard MyApp'), 5000);

    // 2. Go back
    await driver.navigate().back();

    // 3. Verify we are back on the login page (in our demo)
    await driver.wait(until.titleIs('Login - MyApp'), 5000);
    const title = await driver.getTitle();
    expect(title).to.equal('Login - MyApp');
  });
});