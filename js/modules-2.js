// Modules 4-5: Advanced Scenarios, CI/CD Integration

window.PLAYWRIGHT_MODULES.push({
  id: 'module-4',
  title: 'Module 4: Advanced Scenarios',
  icon: '🔮',
  sections: [
    {
      id: 'dialogs-frames',
      title: 'Handling Dialogs & Frames',
      content: `
        <h2>Handling Dialogs & Frames</h2>
        <p>Modern web applications frequently use browser-native dialogs (alert, confirm, prompt) and embed content through iframes. Testing these elements requires special techniques in Playwright. Unlike simple page interactions, dialogs are ephemeral — they appear, block execution, and must be handled before anything else can proceed. Frames introduce an entirely separate DOM context, meaning locators on the main page won't reach elements inside an iframe. Mastering both of these concepts is essential for writing robust end-to-end tests that cover real-world application behaviour.</p>

        <h3>JavaScript Dialogs: Alert, Confirm & Prompt</h3>
        <p>Browsers support three types of native dialogs via JavaScript: <code>alert()</code> displays a message, <code>confirm()</code> asks for OK/Cancel, and <code>prompt()</code> requests text input. In Playwright, these are handled through the <strong>dialog</strong> event on the page object. The critical rule is: <em>you must register your dialog handler <strong>before</strong> the action that triggers the dialog</em>. If you don't, Playwright will auto-dismiss the dialog and your test may miss it entirely.</p>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Always register <code>page.on('dialog', ...)</code> <strong>before</strong> performing the action that triggers the dialog. If you register it after, the dialog may already have been dismissed automatically by Playwright.</div>

        <h3>Handling an Alert Dialog</h3>
        <p>An <code>alert()</code> simply shows a message. You can read the message and accept (dismiss does the same thing for alerts):</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('handle alert dialog', async ({ page }) => {
  await page.goto('https://example.com');

  // Register the dialog handler BEFORE triggering the dialog
  page.on('dialog', async (dialog) => {
    console.log('Dialog message:', dialog.message());
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('Hello from alert!');
    await dialog.accept();
  });

  // Now perform the action that triggers the alert
  await page.click('#trigger-alert-btn');
});</code></pre>
        </div>

        <h3>Handling a Confirm Dialog</h3>
        <p>A <code>confirm()</code> dialog returns <code>true</code> if the user clicks OK, <code>false</code> for Cancel. Use <code>dialog.accept()</code> for OK and <code>dialog.dismiss()</code> for Cancel:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('handle confirm dialog - accept', async ({ page }) => {
  await page.goto('https://example.com');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Are you sure you want to delete?');
    await dialog.accept(); // Click OK
  });

  await page.click('#delete-btn');
  // Verify the item was deleted after accepting
  await expect(page.locator('#item-list')).not.toContainText('Deleted Item');
});

test('handle confirm dialog - dismiss', async ({ page }) => {
  await page.goto('https://example.com');

  page.on('dialog', async (dialog) => {
    await dialog.dismiss(); // Click Cancel
  });

  await page.click('#delete-btn');
  // Verify the item was NOT deleted after dismissing
  await expect(page.locator('#item-list')).toContainText('Still Here');
});</code></pre>
        </div>

        <h3>Handling a Prompt Dialog</h3>
        <p>A <code>prompt()</code> dialog accepts text input. Pass the desired text to <code>dialog.accept(text)</code>:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('handle prompt dialog', async ({ page }) => {
  await page.goto('https://example.com');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('Enter your name:');
    expect(dialog.defaultValue()).toBe(''); // Check default value
    await dialog.accept('Playwright Tester'); // Type and click OK
  });

  await page.click('#ask-name-btn');

  // Verify the entered name is displayed
  await expect(page.locator('#greeting')).toHaveText('Hello, Playwright Tester!');
});</code></pre>
        </div>

        <h3>Using once() for One-Time Dialog Handling</h3>
        <p>If you only expect a single dialog, <code>page.once('dialog', ...)</code> is cleaner because the handler automatically deregisters after firing once:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('one-time dialog handler', async ({ page }) => {
  await page.goto('https://example.com');

  // Handler fires once then removes itself
  page.once('dialog', async (dialog) => {
    await dialog.accept('Yes');
  });

  await page.click('#one-time-prompt');
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use <code>page.once('dialog', ...)</code> when you expect exactly one dialog. Use <code>page.on('dialog', ...)</code> when multiple dialogs may appear. You can also combine with <code>page.waitForEvent('dialog')</code> for promise-based flows.</div>

        <h3>Working with iFrames</h3>
        <p>An <code>&lt;iframe&gt;</code> creates an entirely separate browsing context inside your page. Elements within an iframe have their own DOM tree, so <code>page.locator()</code> cannot reach them directly. Playwright provides the <code>page.frameLocator()</code> method to drill into iframes and interact with their content as though it were part of the main page.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('interact with iframe content', async ({ page }) => {
  await page.goto('https://example.com/page-with-iframe');

  // Create a frame locator targeting the iframe
  const frame = page.frameLocator('#my-iframe');

  // Now interact with elements INSIDE the iframe
  await frame.locator('#username').fill('admin');
  await frame.locator('#password').fill('secret123');
  await frame.locator('button[type="submit"]').click();

  // Assert on content inside the iframe
  await expect(frame.locator('.welcome-message')).toHaveText('Welcome, admin!');
});</code></pre>
        </div>

        <h3>Selecting Frames by Different Attributes</h3>
        <p>You can target iframes using any valid CSS selector — by ID, class, name attribute, or even <code>nth()</code> for positional selection:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// By iframe id
const frameById = page.frameLocator('#payment-frame');

// By iframe name attribute
const frameByName = page.frameLocator('iframe[name="checkout"]');

// By iframe src attribute (partial match)
const frameBySrc = page.frameLocator('iframe[src*="payment-gateway"]');

// By position — first iframe on the page
const firstFrame = page.frameLocator('iframe').first();

// By position — third iframe on the page
const thirdFrame = page.frameLocator('iframe').nth(2);</code></pre>
        </div>

        <h3>Nested Frames</h3>
        <p>Sometimes an iframe contains another iframe inside it. Playwright handles this by chaining <code>frameLocator()</code> calls:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('interact with nested iframes', async ({ page }) => {
  await page.goto('https://example.com/nested-frames');

  // Outer iframe -> inner iframe -> element
  const outerFrame = page.frameLocator('#outer-frame');
  const innerFrame = outerFrame.frameLocator('#inner-frame');

  await innerFrame.locator('#deep-button').click();
  await expect(innerFrame.locator('#deep-result')).toHaveText('Clicked!');
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> <code>page.frameLocator()</code> returns a <strong>FrameLocator</strong> — not a Locator. You cannot call <code>.click()</code> directly on a FrameLocator. You must chain it with <code>.locator()</code> to target specific elements within the frame.</div>

        <h3>Using the Older frame() API</h3>
        <p>Playwright also provides a lower-level <code>page.frame()</code> API that returns a Frame object. While <code>frameLocator()</code> is the modern and recommended approach, the older API can be useful for advanced scenarios:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('using frame() API', async ({ page }) => {
  await page.goto('https://example.com/page-with-iframe');

  // Get frame by name
  const frame = page.frame({ name: 'my-frame' });

  // Get frame by URL pattern
  const paymentFrame = page.frame({ url: /payment/ });

  if (frame) {
    await frame.locator('#submit').click();
  }

  // List all frames on the page
  const allFrames = page.frames();
  console.log('Total frames:', allFrames.length);
});</code></pre>
        </div>
      `,
      quiz: {
        questions: [
          {
            question: 'When must you register the page.on("dialog") handler relative to the action that triggers the dialog?',
            options: [
              'Before the action that triggers the dialog',
              'After the action that triggers the dialog',
              'It does not matter — Playwright queues dialogs',
              'Only during page.goto()'
            ],
            correct: 0,
            explanation: 'You must register the dialog handler BEFORE the action that triggers the dialog. If registered after, Playwright auto-dismisses the dialog and your handler will never fire.'
          },
          {
            question: 'How do you provide text input to a JavaScript prompt() dialog in Playwright?',
            options: [
              'dialog.fill("text")',
              'dialog.type("text")',
              'dialog.accept("text")',
              'dialog.sendKeys("text")'
            ],
            correct: 2,
            explanation: 'For prompt dialogs, you pass the text as an argument to dialog.accept("text"). This enters the text and clicks OK.'
          },
          {
            question: 'What is the correct way to interact with an element inside an iframe?',
            options: [
              'page.locator("#iframe-element")',
              'page.frameLocator("#my-iframe").locator("#iframe-element")',
              'page.frame("#my-iframe").click("#iframe-element")',
              'page.insideFrame("#my-iframe").locator("#iframe-element")'
            ],
            correct: 1,
            explanation: 'Use page.frameLocator() with a CSS selector for the iframe, then chain .locator() to find elements within that frame\'s DOM.'
          }
        ]
      }
    },
    {
      id: 'network-interception',
      title: 'Network Interception & Mocking',
      content: `
        <h2>Network Interception & Mocking</h2>
        <p>One of Playwright's most powerful features is its ability to intercept, inspect, modify, and mock network requests. This capability is a game-changer for end-to-end testing because it lets you control the data your application receives without needing to set up backend servers or databases in a specific state. You can simulate API failures, test edge cases with specific data payloads, speed up tests by blocking unnecessary resources, and verify that your application sends the correct requests to your backend.</p>
        <p>Network interception works through <strong>route handlers</strong> — you tell Playwright to watch for requests matching a URL pattern, and when a matching request is made, Playwright pauses it and hands it to your callback function. From there, you can fulfill the request with mock data, continue the request (optionally modifying it), or abort it entirely.</p>

        <h3>Intercepting Requests with page.route()</h3>
        <p>The <code>page.route(url, handler)</code> method registers a handler for network requests matching a URL pattern. The URL can be a string, glob pattern, or regular expression:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('intercept and log API requests', async ({ page }) => {
  // Intercept ALL requests to the /api/ path
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    console.log(\`[\${request.method()}] \${request.url()}\`);

    // Let the request continue to the real server
    await route.continue();
  });

  await page.goto('https://example.com');
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> URL patterns use glob syntax by default. <code>**</code> matches any path segment(s). For example, <code>**/api/users</code> matches <code>https://example.com/api/users</code> as well as <code>https://staging.example.com/v2/api/users</code>.</div>

        <h3>Mocking API Responses with route.fulfill()</h3>
        <p>The most common use case for network interception is mocking API responses. Instead of making a real network call, you supply your own response data. This makes tests faster, more reliable, and completely independent of backend availability.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('mock REST API response', async ({ page }) => {
  // Mock the users endpoint with fake data
  await page.route('**/api/users', async (route) => {
    const mockUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
    ];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUsers),
    });
  });

  await page.goto('https://example.com/users');

  // The page now shows our mock data
  await expect(page.locator('.user-card')).toHaveCount(3);
  await expect(page.locator('.user-card').first()).toContainText('Alice Johnson');
});</code></pre>
        </div>

        <h3>Simulating Error Responses</h3>
        <p>Testing error states is just as important as testing the happy path. Mock error responses to ensure your UI handles failures gracefully:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('simulate 500 server error', async ({ page }) => {
  await page.route('**/api/users', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  await page.goto('https://example.com/users');

  // Verify error UI is shown
  await expect(page.locator('.error-message')).toBeVisible();
  await expect(page.locator('.error-message')).toContainText(
    'Something went wrong'
  );
});

test('simulate 404 not found', async ({ page }) => {
  await page.route('**/api/users/999', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'User not found' }),
    });
  });

  await page.goto('https://example.com/users/999');
  await expect(page.locator('.not-found')).toHaveText('User not found');
});</code></pre>
        </div>

        <h3>Modifying Requests with route.continue()</h3>
        <p>Sometimes you want the request to reach the real server, but with modifications — such as adding headers, changing the URL, or altering the request body:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('modify request headers', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    // Add custom headers to every API request
    const headers = {
      ...route.request().headers(),
      'X-Test-Header': 'playwright-e2e',
      'Authorization': 'Bearer test-token-12345',
    };

    await route.continue({ headers });
  });

  await page.goto('https://example.com');
});

test('redirect request to different URL', async ({ page }) => {
  // Redirect staging API calls to mock server
  await page.route('**/api/v1/**', async (route) => {
    const originalUrl = route.request().url();
    const newUrl = originalUrl.replace('api/v1', 'mock-api/v1');

    await route.continue({ url: newUrl });
  });

  await page.goto('https://example.com');
});</code></pre>
        </div>

        <h3>Aborting Requests with route.abort()</h3>
        <p>You can abort requests entirely to prevent certain resources from loading. This is extremely useful for blocking images, ads, analytics scripts, or third-party resources to make your tests run faster:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('block images and ads for faster tests', async ({ page }) => {
  // Block images
  await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', async (route) => {
    await route.abort();
  });

  // Block common ad/analytics scripts
  await page.route('**/*google-analytics*/**', (route) => route.abort());
  await page.route('**/*doubleclick*/**', (route) => route.abort());
  await page.route('**/*facebook*/**', (route) => route.abort());

  await page.goto('https://example.com');

  // Page loads faster without images and tracking scripts
  await expect(page.locator('h1')).toBeVisible();
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Blocking unnecessary resources (images, fonts, analytics) can speed up your tests by 30-50%. This is especially effective in CI environments where visual assets aren't needed.</div>

        <h3>Waiting for Specific Network Requests</h3>
        <p>Use <code>page.waitForResponse()</code> or <code>page.waitForRequest()</code> to wait for a specific network call to complete. This is ideal for verifying that your application sends the correct data to the backend:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('wait for API call and verify payload', async ({ page }) => {
  await page.goto('https://example.com/create-user');

  // Start waiting for the POST request BEFORE triggering it
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/users') &&
      response.request().method() === 'POST' &&
      response.status() === 201
  );

  // Fill out the form and submit
  await page.locator('#name').fill('New User');
  await page.locator('#email').fill('newuser@example.com');
  await page.locator('button[type="submit"]').click();

  // Wait for the response and inspect it
  const response = await responsePromise;
  const responseBody = await response.json();

  expect(responseBody.id).toBeDefined();
  expect(responseBody.name).toBe('New User');
});

test('verify request body sent by the app', async ({ page }) => {
  await page.goto('https://example.com/settings');

  // Wait for the PUT request
  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().includes('/api/settings') &&
      request.method() === 'PUT'
  );

  await page.locator('#theme-select').selectOption('dark');
  await page.locator('#save-settings').click();

  const request = await requestPromise;
  const postData = JSON.parse(request.postData());

  expect(postData.theme).toBe('dark');
});</code></pre>
        </div>

        <h3>Practical Example: Full API Mock for Frontend Testing</h3>
        <p>Here's a comprehensive example that mocks an entire API layer so the frontend can be tested in complete isolation:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test.describe('Todo App with Mocked API', () => {
  const mockTodos = [
    { id: 1, title: 'Write tests', completed: false },
    { id: 2, title: 'Fix bugs', completed: true },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock GET /api/todos — return list
    await page.route('**/api/todos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTodos),
        });
      } else if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData());
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 3, ...body }),
        });
      }
    });
  });

  test('displays todos from API', async ({ page }) => {
    await page.goto('https://example.com/todos');
    await expect(page.locator('.todo-item')).toHaveCount(2);
    await expect(page.locator('.todo-item').first()).toContainText('Write tests');
  });

  test('adds a new todo', async ({ page }) => {
    await page.goto('https://example.com/todos');
    await page.locator('#new-todo-input').fill('Learn Playwright');
    await page.locator('#add-todo-btn').click();
    await expect(page.locator('.todo-item')).toHaveCount(3);
  });
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Remember that <code>page.route()</code> must be called <strong>before</strong> the page navigates to the URL that triggers the requests. Routes set up after navigation will miss requests that have already been dispatched.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'Which method do you use to return a fake response for an intercepted network request?',
            options: [
              'route.continue()',
              'route.fulfill()',
              'route.respond()',
              'route.mock()'
            ],
            correct: 1,
            explanation: 'route.fulfill() lets you provide a custom response (status, headers, body) for an intercepted request without ever reaching the real server.'
          },
          {
            question: 'What does route.abort() do to an intercepted request?',
            options: [
              'Sends the request to the server but ignores the response',
              'Pauses the request until manually resumed',
              'Prevents the request from being sent and fails it',
              'Redirects the request to localhost'
            ],
            correct: 2,
            explanation: 'route.abort() completely blocks the request from being sent, causing it to fail as if there was a network error. This is useful for blocking images, ads, or analytics.'
          },
          {
            question: 'Which approach correctly waits for a specific API response after a button click?',
            options: [
              'Click the button, then call page.waitForResponse()',
              'Call page.waitForResponse() to get a promise, then click the button, then await the promise',
              'Use page.on("response") after clicking',
              'Use page.route() with a callback'
            ],
            correct: 1,
            explanation: 'You must start waiting BEFORE the action that triggers the request. Call page.waitForResponse() first (storing the promise), then perform the action, then await the promise.'
          }
        ]
      }
    },
    {
      id: 'authentication-state',
      title: 'Authentication State Reuse',
      content: `
        <h2>Authentication State Reuse</h2>
        <p>One of the biggest bottlenecks in end-to-end testing is authentication. If every test starts by navigating to a login page, filling in credentials, clicking submit, and waiting for the dashboard to load, you're wasting enormous amounts of time. In a test suite with 100+ tests, those extra 5-10 seconds per test add up to minutes of wasted CI time on every run. Playwright offers an elegant solution: <strong>save the authenticated browser state</strong> (cookies, localStorage, sessionStorage) after logging in once, and reuse that state across all subsequent tests.</p>

        <h3>The Problem: Slow, Repetitive Login</h3>
        <p>Consider this naive approach where every test logs in:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// ❌ BAD: Every test repeats the login flow
test('view dashboard', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('password123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard');

  // NOW the actual test begins...
  await expect(page.locator('h1')).toHaveText('Dashboard');
});

test('view profile', async ({ page }) => {
  // Same login code repeated again...
  await page.goto('https://example.com/login');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('password123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard');

  await page.click('a[href="/profile"]');
  await expect(page.locator('h1')).toHaveText('Profile');
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Repeating login in every test is not just slow — it also makes your tests fragile. If the login page changes (e.g., a new CAPTCHA or 2FA step), every single test breaks at once.</div>

        <h3>The Solution: Storage State</h3>
        <p>Playwright's <code>storageState</code> feature lets you save and restore cookies and localStorage. The workflow is:</p>
        <ol>
          <li><strong>Step 1:</strong> Create a setup script that performs the real login via the UI</li>
          <li><strong>Step 2:</strong> Save the authenticated state to a JSON file using <code>context.storageState()</code></li>
          <li><strong>Step 3:</strong> Load that state in your test config so every test starts already logged in</li>
        </ol>

        <h3>Step 1: Create the Auth Setup File</h3>
        <p>Create a special setup file (e.g., <code>auth.setup.ts</code>) that logs in and saves state. This file is defined as a <strong>project dependency</strong> in your Playwright config:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/auth.setup.js
import { test as setup, expect } from '@playwright/test';
import path from 'path';

// Define the path where auth state will be saved
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Step 1: Go to the login page
  await page.goto('https://example.com/login');

  // Step 2: Perform the login
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('password123');
  await page.locator('button[type="submit"]').click();

  // Step 3: Wait for the login to complete
  await page.waitForURL('**/dashboard');
  await expect(page.locator('.user-menu')).toBeVisible();

  // Step 4: Save the authenticated state (cookies + localStorage)
  await page.context().storageState({ path: authFile });
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Add <code>playwright/.auth/</code> to your <code>.gitignore</code> file. The auth state JSON contains session cookies and tokens that should never be committed to version control.</div>

        <h3>Step 2: Configure Projects with Dependencies</h3>
        <p>The modern approach (Playwright 1.31+) uses <strong>project dependencies</strong>. You define a "setup" project that runs first, and other projects depend on it:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  projects: [
    // === Setup project: runs first, performs login ===
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.js/,
    },

    // === Test projects: depend on setup, reuse auth state ===
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load the saved auth state for every test in this project
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'], // Run 'setup' project first
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});</code></pre>
        </div>

        <h3>Step 3: Write Tests — No Login Needed!</h3>
        <p>Now your tests start with the user already authenticated. No login code needed:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/dashboard.spec.js
import { test, expect } from '@playwright/test';

// ✅ No login code! storageState is loaded automatically from config
test('view dashboard widgets', async ({ page }) => {
  await page.goto('https://example.com/dashboard');
  await expect(page.locator('.widget')).toHaveCount(4);
  await expect(page.locator('.user-menu')).toContainText('admin');
});

test('navigate to settings', async ({ page }) => {
  await page.goto('https://example.com/settings');
  await expect(page.locator('h1')).toHaveText('Settings');
  await expect(page.locator('#current-user')).toHaveText('admin');
});</code></pre>
        </div>

        <h3>Multiple User Roles</h3>
        <p>If your application has different user roles (admin, editor, viewer), you can create separate auth states for each:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/auth-admin.setup.js
import { test as setup } from '@playwright/test';

const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('adminPass!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: adminAuthFile });
});

// tests/auth-user.setup.js
import { test as setup } from '@playwright/test';

const userAuthFile = 'playwright/.auth/user.json';

setup('authenticate as regular user', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.locator('#username').fill('viewer');
  await page.locator('#password').fill('viewerPass!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/home');
  await page.context().storageState({ path: userAuthFile });
});</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js — multiple role projects
projects: [
  { name: 'admin-setup', testMatch: /auth-admin\\.setup\\.js/ },
  { name: 'user-setup', testMatch: /auth-user\\.setup\\.js/ },
  {
    name: 'admin-tests',
    testMatch: /.*admin.*\\.spec\\.js/,
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['admin-setup'],
  },
  {
    name: 'user-tests',
    testMatch: /.*user.*\\.spec\\.js/,
    use: { storageState: 'playwright/.auth/user.json' },
    dependencies: ['user-setup'],
  },
]</code></pre>
        </div>

        <h3>API-Based Authentication (Even Faster)</h3>
        <p>For maximum speed, you can skip the UI login entirely and authenticate via API calls. This is faster because it bypasses page rendering:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/auth.setup.js — API-based login
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate via API', async ({ request, browser }) => {
  // Login via API — no page rendering needed
  const response = await request.post('https://example.com/api/login', {
    data: {
      username: 'admin',
      password: 'password123',
    },
  });

  const { token } = await response.json();

  // Create a browser context and inject the token
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: 'auth-token',
      value: token,
      domain: 'example.com',
      path: '/',
    },
  ]);

  // Save the context state
  await context.storageState({ path: authFile });
  await context.close();
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> The <code>storageState</code> JSON file contains cookies and localStorage entries. It does <strong>not</strong> include sessionStorage. If your app relies on sessionStorage for authentication, you'll need to use <code>page.evaluate()</code> in a <code>beforeEach</code> hook to set sessionStorage values manually.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does context.storageState({ path }) save?',
            options: [
              'Only cookies',
              'Cookies and localStorage',
              'Cookies, localStorage, and sessionStorage',
              'The entire DOM state'
            ],
            correct: 1,
            explanation: 'storageState() saves cookies and localStorage to a JSON file. sessionStorage is NOT included — if your app uses sessionStorage, you need to handle it separately.'
          },
          {
            question: 'In the modern project dependencies approach, how do test projects know to run the auth setup first?',
            options: [
              'By importing the setup file directly',
              'By listing it in a beforeAll hook',
              'By specifying it in the "dependencies" array of the project config',
              'By naming the file with a .setup extension'
            ],
            correct: 2,
            explanation: 'The "dependencies" array in a project configuration tells Playwright to run the specified project(s) before the current project. This ensures auth setup runs first.'
          },
          {
            question: 'Why should you add playwright/.auth/ to .gitignore?',
            options: [
              'The files are too large for git',
              'They contain session tokens and cookies that should not be committed',
              'Playwright regenerates them automatically',
              'They cause merge conflicts'
            ],
            correct: 1,
            explanation: 'Auth state files contain sensitive session cookies and tokens. Committing them to version control is a security risk. They should be regenerated fresh in each CI run.'
          }
        ]
      }
    }
  ]
});

window.PLAYWRIGHT_MODULES.push({
  id: 'module-5',
  title: 'Module 5: CI/CD Pipeline Integration',
  icon: '🔄',
  sections: [
    {
      id: 'playwright-config',
      title: 'The Playwright Config Deep Dive',
      content: `
        <h2>The Playwright Config Deep Dive</h2>
        <p>The <code>playwright.config.ts</code> (or <code>playwright.config.js</code>) file is the nerve centre of every Playwright project. It controls everything from which browsers to test, how many tests run in parallel, when to retry failures, how to report results, and even how to start your development server before tests begin. Understanding every option in this file transforms you from someone who can write tests into someone who can architect an entire testing strategy for a team.</p>

        <h3>Basic Config Structure</h3>
        <p>A Playwright config uses the <code>defineConfig()</code> helper for full TypeScript IntelliSense and type safety:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Where to find test files
  testDir: './tests',

  // Global timeout for each test (30 seconds)
  timeout: 30_000,

  // Timeout specifically for expect() assertions
  expect: {
    timeout: 5_000,
  },

  // Run all tests in parallel across files
  fullyParallel: true,

  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (2 times on CI, 0 locally)
  retries: process.env.CI ? 2 : 0,

  // Number of parallel worker processes
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: 'html',

  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  // Browser configurations
  projects: [
    /* defined below */
  ],
});</code></pre>
        </div>

        <h3>Key Config Options Explained</h3>
        <p>Let's walk through each option in detail:</p>

        <p><strong><code>testDir</code></strong> — The directory where Playwright looks for test files. It searches recursively for files matching the pattern <code>*.spec.js</code> or <code>*.test.js</code> by default. You can customize the pattern with <code>testMatch</code>.</p>

        <p><strong><code>timeout</code></strong> — The maximum time (in milliseconds) that a single test is allowed to run before Playwright kills it and marks it as a timeout failure. The default is 30 seconds. For complex tests involving multiple page navigations, you may need to increase this.</p>

        <p><strong><code>retries</code></strong> — How many times to retry a failed test before marking it as truly failed. This is crucial for CI where flaky tests can cause false negatives. A common pattern is 0 retries locally (so you see failures immediately) and 2 retries on CI (to absorb flakiness).</p>

        <p><strong><code>workers</code></strong> — The number of parallel worker processes. Each worker runs tests in isolation. Setting to <code>1</code> disables parallelism (useful on CI with limited resources). The default (<code>undefined</code>) lets Playwright auto-detect based on available CPU cores.</p>

        <p><strong><code>fullyParallel</code></strong> — When <code>true</code>, tests within the same file run in parallel. When <code>false</code> (default), tests within a file run sequentially, but different files run in parallel.</p>

        <div class="tip-box"><strong>💡 Tip:</strong> Use <code>fullyParallel: true</code> when your tests are fully independent and don't share any state. If tests within a file depend on each other (e.g., a sequence of CRUD operations), keep this as <code>false</code>.</div>

        <h3>The use Object: Shared Browser Settings</h3>
        <p>The <code>use</code> object defines settings shared across all projects. These can be overridden per project:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>use: {
  // Base URL for all page.goto() calls
  // page.goto('/login') becomes page.goto('http://localhost:3000/login')
  baseURL: 'http://localhost:3000',

  // Collect trace on first retry of a failed test
  // Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'
  trace: 'on-first-retry',

  // Take screenshot on failure
  // Options: 'on', 'off', 'only-on-failure'
  screenshot: 'only-on-failure',

  // Record video of test execution
  // Options: 'on', 'off', 'on-first-retry', 'retain-on-failure'
  video: 'retain-on-failure',

  // Maximum time for each action (click, fill, etc.)
  actionTimeout: 10_000,

  // Maximum time for page.goto() navigation
  navigationTimeout: 15_000,

  // Extra HTTP headers sent with every request
  extraHTTPHeaders: {
    'Accept-Language': 'en-US',
  },

  // Browser viewport size
  viewport: { width: 1280, height: 720 },

  // Ignore HTTPS errors (useful for self-signed certs)
  ignoreHTTPSErrors: true,
},</code></pre>
        </div>

        <h3>Projects: Multi-Browser Configuration</h3>
        <p>The <code>projects</code> array lets you run the same tests across multiple browsers, viewports, and devices:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },

  // Mobile viewports
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 13'] },
  },

  // Branded browsers (Microsoft Edge, Google Chrome)
  {
    name: 'Microsoft Edge',
    use: {
      ...devices['Desktop Edge'],
      channel: 'msedge',
    },
  },
  {
    name: 'Google Chrome',
    use: {
      ...devices['Desktop Chrome'],
      channel: 'chrome',
    },
  },
],</code></pre>
        </div>

        <h3>Reporter Configuration</h3>
        <p>Playwright supports multiple reporters, and you can use several at once:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Single reporter
reporter: 'html',

// Multiple reporters
reporter: [
  // Terminal output with detailed list
  ['list'],

  // HTML report for interactive browsing
  ['html', { outputFolder: 'playwright-report', open: 'never' }],

  // JUnit XML for CI integration (Jenkins, Azure DevOps)
  ['junit', { outputFile: 'results/junit-results.xml' }],

  // JSON for custom processing
  ['json', { outputFile: 'results/test-results.json' }],
],</code></pre>
        </div>

        <h3>webServer: Auto-Start Your Dev Server</h3>
        <p>The <code>webServer</code> option tells Playwright to start your application server before running tests and shut it down afterwards. This is incredibly useful for CI pipelines:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>webServer: {
  // Command to start your application
  command: 'npm run start',

  // URL to poll until the server is ready
  url: 'http://localhost:3000',

  // Reuse existing server if it's already running
  reuseExistingServer: !process.env.CI,

  // Timeout for the server to start
  timeout: 120_000,

  // Pipe server stdout/stderr to test output
  stdout: 'pipe',
  stderr: 'pipe',
},</code></pre>
        </div>

        <h3>Comprehensive Config Example</h3>
        <p>Here's a production-ready configuration combining all the features discussed:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.js/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> You can use environment variables like <code>process.env.CI</code> and <code>process.env.BASE_URL</code> to make your config adaptive — behaving differently on a developer's laptop versus a CI server.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does the "fullyParallel: true" option do?',
            options: [
              'Runs all test files one after another',
              'Runs tests within the same file in parallel, in addition to parallel files',
              'Opens multiple browser windows for the same test',
              'Enables parallel downloads of browser binaries'
            ],
            correct: 1,
            explanation: 'When fullyParallel is true, Playwright runs tests within the same file in parallel (in addition to running different files in parallel). Without it, tests in the same file run sequentially.'
          },
          {
            question: 'What does the webServer config option do?',
            options: [
              'Connects to a remote Selenium Grid server',
              'Starts your application server before tests and stops it after',
              'Sets up a mock API server for testing',
              'Hosts the HTML test report on a web server'
            ],
            correct: 1,
            explanation: 'The webServer option starts your development/application server before tests begin and shuts it down after all tests complete. It polls the specified URL to know when the server is ready.'
          },
          {
            question: 'How do you configure Playwright to retry failed tests twice only in CI?',
            options: [
              'retries: 2',
              'retries: process.env.CI ? 2 : 0',
              'retry: { ci: 2, local: 0 }',
              'retries: "on-ci-only"'
            ],
            correct: 1,
            explanation: 'Using the ternary expression process.env.CI ? 2 : 0 sets retries to 2 when the CI environment variable is present (set by most CI systems), and 0 otherwise for local development.'
          }
        ]
      }
    },
    {
      id: 'continuous-integration',
      title: 'CI/CD Integration',
      content: `
        <h2>CI/CD Integration</h2>
        <p>Running Playwright tests in a Continuous Integration (CI) pipeline is where end-to-end testing truly pays off. Every pull request, every merge, every deployment is automatically validated against your test suite. This catches regressions before they reach production and gives the team confidence to ship faster. Playwright is designed with CI in mind — it runs headless by default, supports all major CI platforms, and provides tools for sharding, caching, and artifact management.</p>

        <h3>GitHub Actions (Primary CI Platform)</h3>
        <p>GitHub Actions is the most popular CI platform for Playwright. Here's a comprehensive workflow file:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: test-results
          path: test-results/
          retention-days: 30</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use <code>if: \${{ !cancelled() }}</code> on the artifact upload steps so that test reports are uploaded even when tests fail. This lets you download and review the HTML report to debug failures.</div>

        <h3>Sharding Tests Across Multiple CI Machines</h3>
        <p>For large test suites, you can split tests across multiple parallel CI machines using Playwright's built-in sharding. This can cut your CI time dramatically:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># .github/workflows/playwright-sharded.yml
name: Playwright Tests (Sharded)

on:
  push:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Run Playwright tests (shard ${{ matrix.shardIndex }}/${{ matrix.shardTotal }})
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

      - name: Upload blob report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci

      - name: Download all blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Upload merged HTML report
        uses: actions/upload-artifact@v4
        with:
          name: html-report--attempt-${{ github.run_attempt }}
          path: playwright-report/
          retention-days: 14</code></pre>
        </div>

        <h3>GitLab CI Configuration</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># .gitlab-ci.yml
stages:
  - test

playwright-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.48.0-jammy
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 7 days
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'</code></pre>
        </div>

        <h3>Bitbucket Pipelines Configuration</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># bitbucket-pipelines.yml
image: mcr.microsoft.com/playwright:v1.48.0-jammy

pipelines:
  pull-requests:
    '**':
      - step:
          name: Run Playwright Tests
          caches:
            - node
          script:
            - npm ci
            - npx playwright test
          artifacts:
            - playwright-report/**
            - test-results/**

  branches:
    main:
      - step:
          name: Run Playwright Tests
          caches:
            - node
          script:
            - npm ci
            - npx playwright test
          artifacts:
            - playwright-report/**
            - test-results/**</code></pre>
        </div>

        <h3>Docker Considerations</h3>
        <p>Playwright provides official Docker images with all browser dependencies pre-installed. This is the easiest way to run tests in CI:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>Dockerfile</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Use the official Playwright image
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm ci

# Copy test files
COPY . .

# Run tests
CMD ["npx", "playwright", "test"]</code></pre>
        </div>

        <h3>Caching Browser Binaries</h3>
        <p>Browser binaries are large (~400MB total). Caching them across CI runs saves significant download time:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># GitHub Actions — cache Playwright browsers
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-browsers-${{ hashFiles('package-lock.json') }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps

- name: Install Playwright system deps only
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> When caching browser binaries, always key the cache on <code>package-lock.json</code>. When you upgrade Playwright, the lock file changes, the cache key changes, and fresh browsers are downloaded to match the new version.</div>

        <h3>Running in Headless Mode</h3>
        <p>Playwright runs headless by default on CI (no visible browser window). You can control this explicitly:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js — headless control
use: {
  // Explicitly set headless (true is default in CI)
  headless: !!process.env.CI,

  // Or always headless
  headless: true,
},

// Run headed locally for debugging
// CLI: npx playwright test --headed</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Playwright's headless mode uses the same browser engine as headed mode, so results are identical. The only differences are performance (headless is faster since there's no rendering overhead) and the fact that you can't see what's happening visually.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does the --shard=2/4 CLI flag do?',
            options: [
              'Runs only the second test in each file',
              'Splits the test suite into 4 parts and runs the 2nd part',
              'Runs tests with 2 out of 4 workers',
              'Retries each test 2 out of 4 times'
            ],
            correct: 1,
            explanation: '--shard=2/4 splits the total test suite into 4 equal shards and runs only shard number 2. This lets you distribute test execution across multiple parallel CI machines.'
          },
          {
            question: 'Why should artifact upload steps use "if: !cancelled()" in GitHub Actions?',
            options: [
              'To save CI minutes by skipping unnecessary uploads',
              'To upload reports even when tests fail, so you can debug',
              'To prevent duplicate artifact uploads',
              'To comply with GitHub Actions best practices'
            ],
            correct: 1,
            explanation: 'Using !cancelled() ensures the upload step runs even when previous steps fail (i.e., tests fail). This lets you download the HTML report to investigate what went wrong.'
          },
          {
            question: 'What is the benefit of using the official Playwright Docker image in CI?',
            options: [
              'It runs tests faster than native CI runners',
              'It includes all browser dependencies pre-installed, avoiding install issues',
              'It automatically retries flaky tests',
              'It provides a GUI for viewing test results'
            ],
            correct: 1,
            explanation: 'The official Playwright Docker images come with all system dependencies and browser binaries pre-installed, eliminating the need for separate install steps and avoiding "missing dependency" issues across different CI environments.'
          }
        ]
      }
    },
    {
      id: 'test-management',
      title: 'Test Management & Issue Tracking',
      content: `
        <h2>Test Management & Issue Tracking</h2>
        <p>In enterprise environments, tests aren't just code — they're tracked artifacts linked to requirements, user stories, and bug reports. Connecting your Playwright test results to test management tools like Jira/Xray, TestRail, or Azure Test Plans provides traceability: you can answer questions like "which tests cover this requirement?" and "which bugs caused test failures in the last sprint?" This section covers how to organize tests for traceability, generate reports in standard formats, and integrate with popular test management platforms.</p>

        <h3>Organizing Tests with test.describe() and Annotations</h3>
        <p>Well-structured tests are easier to trace. Use <code>test.describe()</code> for grouping and annotations for metadata:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Annotate with ticket reference
      test.info().annotations.push({
        type: 'jira',
        description: 'AUTH-101',
      });

      await page.goto('/login');
      await page.locator('#username').fill('admin');
      await page.locator('#password').fill('pass123');
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show error for invalid password', async ({ page }) => {
      test.info().annotations.push({
        type: 'jira',
        description: 'AUTH-102',
      });
      test.info().annotations.push({
        type: 'severity',
        description: 'critical',
      });

      await page.goto('/login');
      await page.locator('#username').fill('admin');
      await page.locator('#password').fill('wrongpass');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('.error')).toHaveText('Invalid credentials');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      test.info().annotations.push({
        type: 'jira',
        description: 'AUTH-201',
      });

      await page.goto('/dashboard');
      await page.locator('#logout-btn').click();
      await expect(page).toHaveURL('/login');
    });
  });
});</code></pre>
        </div>

        <h3>Tagging Tests with grep and Tags</h3>
        <p>Playwright supports tag-based test selection using the <code>@tag</code> syntax in test titles. This lets you run subsets of tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Tag tests directly in the title
test('should process payment @smoke @critical', async ({ page }) => {
  // ...
});

test('should display order history @regression', async ({ page }) => {
  // ...
});

test('should export report as CSV @regression @slow', async ({ page }) => {
  // ...
});

// Run only smoke tests from the CLI:
// npx playwright test --grep @smoke

// Run tests that are NOT slow:
// npx playwright test --grep-invert @slow

// Run tests matching multiple tags:
// npx playwright test --grep "@smoke|@critical"</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use a consistent tagging strategy across your team. Common tags include <code>@smoke</code> (essential tests for quick validation), <code>@regression</code> (full suite), <code>@critical</code> (high-priority business flows), and <code>@slow</code> (tests that take extra time).</div>

        <h3>Generating JUnit XML Reports</h3>
        <p>JUnit XML is the universal format for test results in CI/CD. Nearly every CI platform and test management tool can ingest it:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
export default defineConfig({
  reporter: [
    ['list'],
    ['junit', {
      outputFile: 'test-results/junit-report.xml',
      // Include suite name for better grouping
      embedAnnotationsAsProperties: true,
      // Strip ANSI color codes from output
      stripANSIControlSequences: true,
    }],
    ['html', { open: 'never' }],
  ],
});</code></pre>
        </div>

        <p>The resulting JUnit XML looks like this and can be parsed by Jenkins, Azure DevOps, CircleCI, and test management tools:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>XML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>&lt;!-- Generated JUnit XML example --&gt;
&lt;testsuites&gt;
  &lt;testsuite name="User Authentication &gt; Login" tests="2" failures="0"&gt;
    &lt;testcase name="should login with valid credentials"
             classname="auth.spec.js"
             time="3.245"&gt;
    &lt;/testcase&gt;
    &lt;testcase name="should show error for invalid password"
             classname="auth.spec.js"
             time="2.103"&gt;
    &lt;/testcase&gt;
  &lt;/testsuite&gt;
&lt;/testsuites&gt;</code></pre>
        </div>

        <h3>Xray Integration Workflow</h3>
        <p>Xray is a popular test management plugin for Jira. The integration flow involves exporting test results from Playwright in a format Xray understands and importing them via API:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Import Playwright JUnit results into Xray via REST API
// This can be a CI step or a custom script

// upload-to-xray.js
const fs = require('fs');
const path = require('path');

async function uploadToXray() {
  const junitXml = fs.readFileSync(
    path.join(__dirname, 'test-results/junit-report.xml'),
    'utf-8'
  );

  const response = await fetch(
    'https://xray.cloud.getxray.app/api/v2/import/execution/junit',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': \`Bearer \${process.env.XRAY_API_TOKEN}\`,
      },
      body: junitXml,
    }
  );

  const result = await response.json();
  console.log('Xray Test Execution Key:', result.key);
}

uploadToXray();</code></pre>
        </div>

        <h3>Custom Reporter for Test Management Tools</h3>
        <p>For deeper integration, you can write a custom Playwright reporter that sends results directly to your test management tool in real-time:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// custom-reporter.js
class TestManagementReporter {
  constructor(options) {
    this.apiUrl = options.apiUrl;
    this.apiToken = options.apiToken;
    this.results = [];
  }

  onTestEnd(test, result) {
    // Extract Jira ticket from annotations
    const jiraAnnotation = test.annotations.find((a) => a.type === 'jira');
    const jiraKey = jiraAnnotation?.description;

    this.results.push({
      testTitle: test.title,
      jiraKey: jiraKey,
      status: result.status, // 'passed', 'failed', 'skipped', 'timedOut'
      duration: result.duration,
      errors: result.errors.map((e) => e.message),
    });
  }

  async onEnd(result) {
    // Send all results to test management tool
    console.log(\`Uploading \${this.results.length} results...\`);

    await fetch(\`\${this.apiUrl}/import-results\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.apiToken}\`,
      },
      body: JSON.stringify({
        results: this.results,
        overallStatus: result.status,
      }),
    });

    console.log('Results uploaded successfully!');
  }
}

module.exports = TestManagementReporter;</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Use the custom reporter in playwright.config.js
reporter: [
  ['list'],
  ['./custom-reporter.js', {
    apiUrl: 'https://your-test-mgmt-tool.com/api',
    apiToken: process.env.TEST_MGMT_TOKEN,
  }],
],</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Custom reporters implement the <code>Reporter</code> interface with hooks like <code>onTestBegin</code>, <code>onTestEnd</code>, <code>onStepBegin</code>, <code>onStepEnd</code>, and <code>onEnd</code>. You can find the full interface in the <a href="https://playwright.dev/docs/api/class-reporter" target="_blank">Playwright Reporter API docs</a>.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'How do you run only tests tagged with @smoke using the Playwright CLI?',
            options: [
              'npx playwright test --tag smoke',
              'npx playwright test --grep @smoke',
              'npx playwright test --filter smoke',
              'npx playwright test --only @smoke'
            ],
            correct: 1,
            explanation: 'The --grep flag filters tests by matching against their title. Since tags are part of the title (e.g., "should login @smoke"), --grep @smoke selects those tests.'
          },
          {
            question: 'What format does Playwright produce for CI/CD tool integration like Jenkins or Azure DevOps?',
            options: [
              'HTML only',
              'CSV report',
              'JUnit XML',
              'Markdown summary'
            ],
            correct: 2,
            explanation: 'JUnit XML is the universal standard for test results in CI/CD systems. Playwright\'s junit reporter generates this format, which is parseable by Jenkins, Azure DevOps, CircleCI, and test management tools like Xray.'
          }
        ]
      }
    },
    {
      id: 'debugging-reporting',
      title: 'Debugging & Reporting',
      content: `
        <h2>Debugging & Reporting</h2>
        <p>When a test fails — and tests will fail — the ability to quickly understand <em>why</em> it failed is what separates productive testing from frustrating trial-and-error. Playwright provides an incredibly rich debugging toolkit: an interactive HTML reporter for browsing results, a Trace Viewer that replays every action with DOM snapshots, a UI Mode for running tests interactively, a step-through debugger, video recording, and automatic screenshots on failure. Mastering these tools will make you dramatically more effective at writing and maintaining tests.</p>

        <h3>HTML Reporter</h3>
        <p>The HTML reporter generates a beautiful, interactive report that lets you filter, search, and drill into test results. It's the default reporter and the one you'll use most often:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Enable in playwright.config.js
reporter: [
  ['html', {
    outputFolder: 'playwright-report',
    open: 'on-failure', // 'always', 'never', 'on-failure'
  }],
],

// View the report after tests run:
// npx playwright show-report

// View a report from a specific path:
// npx playwright show-report ./path/to/playwright-report</code></pre>
        </div>
        <p>The HTML report shows each test with its status (passed/failed/skipped/flaky), duration, browser, and any attached artifacts (screenshots, videos, traces). Click on any failed test to see the error message, stack trace, and step-by-step execution log.</p>

        <div class="tip-box"><strong>💡 Tip:</strong> Set <code>open: 'on-failure'</code> in development so the report auto-opens in your browser only when tests fail. On CI, use <code>'never'</code> and upload the report folder as an artifact.</div>

        <h3>Trace Viewer</h3>
        <p>The Trace Viewer is Playwright's killer feature for debugging. It records a complete trace of your test execution including DOM snapshots at every action, network requests, console logs, and source code. It's like having a DVR for your tests.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Enable traces in playwright.config.js
use: {
  // Record trace on first retry of a failed test (recommended)
  trace: 'on-first-retry',

  // Other options:
  // trace: 'on',              // Always record (large files!)
  // trace: 'off',             // Never record
  // trace: 'retain-on-failure', // Record but only save if test fails
},

// View a trace file:
// npx playwright show-trace test-results/my-test/trace.zip

// Or open Trace Viewer and drag-drop the trace file:
// npx playwright show-trace</code></pre>
        </div>

        <h3>What the Trace Viewer Shows You</h3>
        <p>When you open a trace, you get a timeline with several panels:</p>
        <ul>
          <li><strong>Actions Panel:</strong> Every Playwright action (click, fill, goto, expect) listed chronologically. Click any action to see the DOM snapshot at that exact moment.</li>
          <li><strong>DOM Snapshot:</strong> A full, interactive snapshot of the page at the selected action. You can inspect elements, see their CSS, and understand exactly what the page looked like.</li>
          <li><strong>Network Log:</strong> All HTTP requests made during the test, with request/response headers and bodies. Invaluable for debugging API issues.</li>
          <li><strong>Console Log:</strong> All <code>console.log()</code>, <code>console.error()</code>, and browser errors captured during the test.</li>
          <li><strong>Source Code:</strong> The test source code with the current action highlighted.</li>
        </ul>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// You can also enable traces programmatically in a test
test('debug this specific test', async ({ page, context }) => {
  // Start tracing
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  await page.goto('https://example.com');
  await page.locator('#search').fill('Playwright');
  await page.locator('#search-btn').click();

  // Stop tracing and save to a file
  await context.tracing.stop({
    path: 'traces/search-test-trace.zip',
  });
});</code></pre>
        </div>

        <h3>UI Mode: Interactive Test Runner</h3>
        <p>UI Mode is a graphical interface for running and debugging tests interactively. It shows the browser, test code, and Playwright actions side by side. This is the best way to develop new tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Launch UI Mode
npx playwright test --ui

# UI Mode features:
# - Watch mode: re-runs tests when files change
# - Time-travel debugging: step through actions visually
# - Filter tests: run specific tests or files
# - See DOM snapshots in real-time
# - View network requests and console logs</code></pre>
        </div>
        <p>UI Mode is particularly powerful during test development because it provides instant feedback. You can see each action execute in the browser, view the DOM at any point, and re-run specific tests with a single click.</p>

        <h3>Debug Mode: Step-Through Debugger</h3>
        <p>The <code>PWDEBUG</code> environment variable launches Playwright Inspector, a step-through debugger that pauses at each action:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Windows PowerShell
$env:PWDEBUG=1; npx playwright test --project=chromium

# Windows CMD
set PWDEBUG=1 && npx playwright test --project=chromium

# macOS/Linux
PWDEBUG=1 npx playwright test --project=chromium

# Or use the built-in --debug flag (same effect)
npx playwright test --debug</code></pre>
        </div>
        <p>When the Inspector opens, you can:</p>
        <ul>
          <li><strong>Step Over:</strong> Execute the current action and pause at the next</li>
          <li><strong>Resume:</strong> Continue execution until the next breakpoint or the end</li>
          <li><strong>Pick Locator:</strong> Click elements in the browser to generate locator selectors</li>
          <li><strong>Edit Locators:</strong> Test locator expressions live to see what they match</li>
        </ul>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// You can also add breakpoints in code using page.pause()
test('debug at specific point', async ({ page }) => {
  await page.goto('https://example.com');
  await page.locator('#login').click();

  // Test pauses here — Inspector opens for interactive debugging
  await page.pause();

  // Continue the rest after you click Resume in Inspector
  await page.locator('#submit').click();
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Remove all <code>page.pause()</code> calls before committing code or running in CI. They will cause tests to hang indefinitely in headless environments. Use <code>forbidOnly: !!process.env.CI</code> as a safety net, but <code>page.pause()</code> doesn't trigger that check.</div>

        <h3>Codegen: Generate Tests Automatically</h3>
        <p>Playwright's codegen tool records your browser interactions and generates test code automatically. It's an excellent starting point for new tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Generate a test by recording interactions
npx playwright codegen https://example.com

# Generate with specific viewport
npx playwright codegen --viewport-size=1280,720 https://example.com

# Generate for a specific device
npx playwright codegen --device="iPhone 13" https://example.com

# Save generated code to a file
npx playwright codegen --output tests/generated.spec.js https://example.com</code></pre>
        </div>

        <h3>Video Recording</h3>
        <p>Record video of every test execution. Videos are especially valuable in CI where you can't watch tests run:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
use: {
  // Record video only when a test fails and is retried
  video: 'on-first-retry',

  // Other options:
  // video: 'on',                // Always record (storage heavy!)
  // video: 'off',               // Never record
  // video: 'retain-on-failure', // Record all, keep only failures

  // Control video size
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
  },
},</code></pre>
        </div>

        <h3>Screenshot on Failure</h3>
        <p>Automatic screenshots capture the page state at the exact moment of failure:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
use: {
  // Take a screenshot when a test fails
  screenshot: 'only-on-failure',

  // Other options:
  // screenshot: 'on',   // Screenshot after every test
  // screenshot: 'off',  // Never take screenshots
},

// You can also take manual screenshots in tests
test('capture page state', async ({ page }) => {
  await page.goto('https://example.com/dashboard');

  // Full page screenshot
  await page.screenshot({
    path: 'screenshots/dashboard-full.png',
    fullPage: true,
  });

  // Screenshot of a specific element
  await page.locator('.chart-widget').screenshot({
    path: 'screenshots/chart-widget.png',
  });
});</code></pre>
        </div>

        <h3>Debugging Cheat Sheet</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Quick reference for Playwright debugging commands

# Run with step-through debugger
npx playwright test --debug

# Run a single test file in debug mode
npx playwright test tests/login.spec.js --debug

# Launch interactive UI Mode
npx playwright test --ui

# Generate test by recording
npx playwright codegen https://example.com

# View HTML report
npx playwright show-report

# View trace file
npx playwright show-trace trace.zip

# Run with headed browser (see it visually)
npx playwright test --headed

# Run with slow motion (1 second delay between actions)
npx playwright test --headed -- --slow-mo=1000

# Run a single specific test by title
npx playwright test -g "should login successfully"</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> The recommended debugging workflow is: (1) use <code>--ui</code> mode during development, (2) use <code>--debug</code> for pinpointing specific failures, (3) use traces in CI for post-mortem analysis, and (4) use videos and screenshots as supplementary evidence.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does the Trace Viewer show that a regular screenshot does NOT?',
            options: [
              'The browser type used',
              'DOM snapshots at every action, network logs, and console output',
              'The test file name',
              'The CPU usage during the test'
            ],
            correct: 1,
            explanation: 'The Trace Viewer provides a complete recording of the test: DOM snapshots at every action, network request/response details, console logs, and source code context. A screenshot only captures a single static moment.'
          },
          {
            question: 'How do you launch the interactive Playwright UI Mode?',
            options: [
              'npx playwright open',
              'npx playwright test --ui',
              'npx playwright ui-mode',
              'npx playwright test --interactive'
            ],
            correct: 1,
            explanation: 'npx playwright test --ui launches UI Mode, an interactive graphical interface for running, debugging, and developing tests with real-time visual feedback.'
          },
          {
            question: 'What is the recommended trace setting for CI environments?',
            options: [
              'trace: "on" — always record everything',
              'trace: "off" — never record to save space',
              'trace: "on-first-retry" — record only when retrying failed tests',
              'trace: "retain-on-failure" — always record but keep on failure only'
            ],
            correct: 2,
            explanation: '"on-first-retry" is the recommended setting because it captures traces only for tests that fail and are being retried. This balances debugging capability with storage and performance — you get trace data for failures without the overhead of recording every passing test.'
          }
        ]
      }
    }
  ]
});
