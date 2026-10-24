// Modules 6-8: Fixtures, Visual Testing, API Testing

// ============================================================
// MODULE 6: Test Fixtures & Page Object Model
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-6',
  title: 'Module 6: Test Fixtures & Page Object Model',
  icon: '🏗️',
  sections: [
    {
      id: 'test-hooks',
      title: 'Test Hooks & Lifecycle',
      content: `
        <h2>Test Hooks & Lifecycle</h2>
        <p>Playwright Test provides a comprehensive set of <strong>hooks</strong> and <strong>lifecycle methods</strong> that let you run setup and teardown logic before and after your tests. Understanding these hooks is essential for writing clean, maintainable test suites. They allow you to prepare test environments, seed databases, log in users, and clean up resources — all without cluttering your individual test cases.</p>

        <h3>test.describe() — Grouping Tests</h3>
        <p>Before diving into hooks, let's start with <code>test.describe()</code>. This method groups related tests together under a descriptive label. It doesn't just organize tests visually — it also creates a <strong>scope</strong> for hooks. Any hook declared inside a <code>describe</code> block only applies to the tests within that block.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form#login')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'bad@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toHaveText('Invalid credentials');
  });
});

test.describe('Dashboard Features', () => {
  test('should show widgets', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('.widget')).toHaveCount(4);
  });
});</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> You can nest <code>describe</code> blocks to create sub-groups. Hooks in a parent <code>describe</code> run for all tests in nested groups too.</div>

        <h3>test.beforeEach() and test.afterEach()</h3>
        <p>These are the most commonly used hooks. <code>test.beforeEach()</code> runs before <strong>every single test</strong> in the current scope, and <code>test.afterEach()</code> runs after each test, regardless of whether the test passed or failed. They receive the same fixtures that tests do (like <code>page</code>, <code>context</code>, etc.).</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    // This runs before EVERY test in this describe block
    await page.goto('https://demo.playwright.dev/todomvc');
    console.log('Navigated to Todo app');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // This runs after EVERY test — even if the test failed
    console.log(\`Test "\${testInfo.title}" finished with status: \${testInfo.status}\`);

    // Take a screenshot on failure for debugging
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = \`screenshots/\${testInfo.title}.png\`;
      await page.screenshot({ path: screenshotPath });
      testInfo.attachments.push({
        name: 'failure-screenshot',
        path: screenshotPath,
        contentType: 'image/png'
      });
    }
  });

  test('should add a todo item', async ({ page }) => {
    await page.locator('.new-todo').fill('Buy groceries');
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('should mark a todo as completed', async ({ page }) => {
    await page.locator('.new-todo').fill('Read a book');
    await page.locator('.new-todo').press('Enter');
    await page.locator('.todo-list li .toggle').click();
    await expect(page.locator('.todo-list li')).toHaveClass([/completed/]);
  });
});</code></pre>
        </div>

        <h3>test.beforeAll() and test.afterAll()</h3>
        <p>Unlike <code>beforeEach</code>/<code>afterEach</code>, these hooks run <strong>once</strong> per worker — before any tests in the scope start and after all tests finish. They do <strong>not</strong> receive a <code>page</code> fixture (since there's no test-specific page yet). Instead, they receive the <code>browser</code> fixture, which you can use for one-time setup tasks like seeding a database, creating shared resources, or authenticating a user whose state will be reused.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  let adminToken;

  test.beforeAll(async ({ browser }) => {
    // Run once: create a context, log in, and store the token
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/api/login');
    // Simulate login to get a token
    const response = await page.request.post('/api/auth', {
      data: { username: 'admin', password: 'secret' }
    });
    const body = await response.json();
    adminToken = body.token;
    await context.close();
    console.log('Admin token acquired for all tests');
  });

  test.afterAll(async () => {
    // Cleanup: invalidate token, close connections, etc.
    console.log('All admin tests completed. Cleaning up...');
  });

  test('should list all users', async ({ page }) => {
    await page.setExtraHTTPHeaders({ Authorization: \`Bearer \${adminToken}\` });
    await page.goto('/admin/users');
    await expect(page.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('should create a new user', async ({ page }) => {
    await page.setExtraHTTPHeaders({ Authorization: \`Bearer \${adminToken}\` });
    await page.goto('/admin/users/new');
    await page.fill('#name', 'Jane Doe');
    await page.fill('#email', 'jane@example.com');
    await page.click('button#create');
    await expect(page.locator('.success')).toBeVisible();
  });
});</code></pre>
        </div>
        <div class="warning-box"><strong>⚠️ Warning:</strong> <code>test.beforeAll()</code> and <code>test.afterAll()</code> do not receive the <code>page</code> fixture directly — you must create pages manually from the <code>browser</code> fixture. If you try to destructure <code>{ page }</code>, you'll get an error.</div>

        <h3>test.describe.serial() — Ordered Tests</h3>
        <p>By default, Playwright runs tests within a file independently (and potentially in parallel). If you need tests to run in a specific order — for example, when one test depends on state created by a previous test — use <code>test.describe.serial()</code>. If any test in a serial block fails, all subsequent tests are skipped.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe.serial('User Registration Flow', () => {
  let registeredEmail;

  test('Step 1: Register a new user', async ({ page }) => {
    await page.goto('/register');
    registeredEmail = \`user_\${Date.now()}@test.com\`;
    await page.fill('#email', registeredEmail);
    await page.fill('#password', 'SecurePass123!');
    await page.click('button#register');
    await expect(page.locator('.welcome')).toBeVisible();
  });

  test('Step 2: Verify email appears on profile', async ({ page }) => {
    // This test depends on the registration from Step 1
    await page.goto('/profile');
    await expect(page.locator('.profile-email')).toHaveText(registeredEmail);
  });

  test('Step 3: Delete the account', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button#delete-account');
    await page.click('button#confirm-delete');
    await expect(page).toHaveURL('/goodbye');
  });
});</code></pre>
        </div>

        <h3>Skipping, Marking, and Slowing Tests</h3>
        <p>Playwright provides declarative methods to control test execution:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// Skip a test unconditionally
test.skip('feature not yet implemented', async ({ page }) => {
  // This test will not run
});

// Skip conditionally based on a condition
test('only works on desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'This feature is not available on mobile');
  await page.goto('/desktop-feature');
});

// Mark a test as fixme — acknowledged broken, skip for now
test.fixme('broken after recent refactor', async ({ page }) => {
  // This test is known to be broken and will be skipped
});

// Mark a test as slow — triples the default timeout
test('complex data processing', async ({ page }) => {
  test.slow();
  // This test now has 3x the normal timeout
  await page.goto('/process');
  await expect(page.locator('.done')).toBeVisible({ timeout: 60000 });
});</code></pre>
        </div>

        <h3>Annotations and Tagging</h3>
        <p>Playwright supports <strong>annotations</strong> to attach metadata to tests, and <strong>tags</strong> to categorize tests for selective execution. Tags let you run subsets like smoke tests or regression tests from the command line.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// Tagging tests with @ syntax
test('should load homepage @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Home/);
});

test('should process checkout @regression @slow', async ({ page }) => {
  test.slow(); // triple timeout
  await page.goto('/checkout');
  // ... full checkout flow
});

// Using annotations for custom metadata
test('payment gateway integration', async ({ page }) => {
  test.info().annotations.push({
    type: 'issue',
    description: 'https://github.com/myorg/myrepo/issues/123'
  });
  test.info().annotations.push({
    type: 'owner',
    description: 'payments-team'
  });
  await page.goto('/payment');
  await expect(page.locator('#payment-form')).toBeVisible();
});

// Run tagged tests from CLI:
// npx playwright test --grep @smoke
// npx playwright test --grep @regression
// npx playwright test --grep-invert @slow</code></pre>
        </div>
        <div class="info-box"><strong>ℹ️ Note:</strong> Tags in test titles (like <code>@smoke</code>) are matched using the <code>--grep</code> CLI flag with regex. You can combine multiple tags using regex patterns like <code>--grep "@smoke|@critical"</code>.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the key difference between test.beforeAll() and test.beforeEach()?',
            options: [
              'beforeAll() runs once per worker before all tests; beforeEach() runs before every individual test',
              'beforeAll() receives a page fixture; beforeEach() does not',
              'beforeAll() is faster because it runs in parallel',
              'There is no difference — they are aliases'
            ],
            correct: 0,
            explanation: 'test.beforeAll() executes once per worker before any tests in the scope, and receives the browser fixture. test.beforeEach() runs before each individual test and receives test-scoped fixtures like page and context.'
          },
          {
            question: 'What happens when a test fails inside a test.describe.serial() block?',
            options: [
              'The remaining tests continue running normally',
              'All subsequent tests in the serial block are skipped',
              'The entire test file is aborted',
              'The failed test is automatically retried'
            ],
            correct: 1,
            explanation: 'In a serial describe block, tests run in order and depend on each other. If one test fails, all subsequent tests in that serial block are skipped because they may depend on state from the failed test.'
          },
          {
            question: 'How do you run only tests tagged with @smoke from the command line?',
            options: [
              'npx playwright test --tag smoke',
              'npx playwright test --filter @smoke',
              'npx playwright test --grep @smoke',
              'npx playwright test --only smoke'
            ],
            correct: 2,
            explanation: 'The --grep flag accepts a regex pattern that is matched against the test title. Since tags like @smoke are part of the test title string, --grep @smoke selects all tests with that tag.'
          }
        ]
      }
    },
    {
      id: 'custom-fixtures',
      title: 'Custom Test Fixtures',
      content: `
        <h2>Custom Test Fixtures</h2>
        <p>Fixtures are one of the most powerful features in Playwright Test. They are the mechanism by which Playwright provides test isolation, manages resources, and enables dependency injection into your tests. While hooks (<code>beforeEach</code>, <code>afterEach</code>) serve a similar purpose, fixtures offer several critical advantages that make them the preferred approach for sophisticated test setups.</p>

        <h3>Why Fixtures Replace Hooks</h3>
        <p>Consider the problems with hooks:</p>
        <ul>
          <li><strong>Encapsulation:</strong> Hooks store state in outer-scope variables, making it hard to track which tests use what setup.</li>
          <li><strong>Composability:</strong> Hooks don't compose well — if two describe blocks need different setups, you end up with complex nesting.</li>
          <li><strong>On-demand setup:</strong> Hooks always run, even if a specific test doesn't need that particular setup.</li>
          <li><strong>Reusability:</strong> Hook logic is tied to the file it's in. Fixtures can be shared across files.</li>
        </ul>
        <p>Fixtures solve all of these problems. They are <strong>lazy</strong> (only set up when a test actually requests them), <strong>composable</strong> (fixtures can depend on other fixtures), and <strong>reusable</strong> (defined once, used across your entire test suite).</p>

        <h3>Built-in Fixtures</h3>
        <p>Playwright provides several built-in fixtures that you've already been using:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('using built-in fixtures', async ({
  page,       // A new Page instance for each test (test-scoped)
  context,    // A new BrowserContext for each test (test-scoped)
  browser,    // Shared Browser instance (worker-scoped)
  request,    // APIRequestContext for making API calls (test-scoped)
  browserName // Name of the browser: 'chromium', 'firefox', 'webkit'
}) => {
  // 'page' is a fresh page in a fresh context — full test isolation
  await page.goto('https://example.com');

  // 'request' lets you make API calls without a browser
  const response = await request.get('https://api.example.com/status');
  expect(response.ok()).toBeTruthy();

  // 'browserName' tells you which browser is running
  console.log(\`Running on: \${browserName}\`);
});</code></pre>
        </div>

        <h3>Creating Custom Fixtures with test.extend()</h3>
        <p>The <code>test.extend()</code> method lets you create your own fixtures. Each fixture is defined as an async function that receives two arguments: a destructured object of other fixtures it depends on, and a <code>use</code> callback. The code <strong>before</strong> <code>use</code> is setup, the code <strong>after</strong> <code>use</code> is teardown.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fixtures.js — define your custom fixtures here
import { test as base, expect } from '@playwright/test';

// Extend the base test with custom fixtures
export const test = base.extend({
  // A simple fixture that provides a user object
  defaultUser: async ({}, use) => {
    // Setup: create the user data
    const user = {
      email: 'testuser@example.com',
      password: 'TestPass123!',
      name: 'Test User'
    };

    // Provide the fixture value to the test
    await use(user);

    // Teardown: runs after the test finishes
    console.log('defaultUser fixture teardown');
  },

  // A fixture that depends on the 'page' built-in fixture
  homePage: async ({ page }, use) => {
    // Setup: navigate to home page and wait for it to load
    await page.goto('https://myapp.com');
    await page.waitForLoadState('networkidle');

    // Provide the ready page to the test
    await use(page);

    // No special teardown needed — page is cleaned up automatically
  },
});

export { expect };</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/home.spec.js — use the custom fixtures
import { test, expect } from '../fixtures';

test('home page has correct title', async ({ homePage }) => {
  // homePage is already navigated and loaded!
  await expect(homePage).toHaveTitle(/My App/);
});

test('shows user greeting', async ({ homePage, defaultUser }) => {
  await homePage.fill('#login-email', defaultUser.email);
  await homePage.fill('#login-password', defaultUser.password);
  await homePage.click('#login-btn');
  await expect(homePage.locator('.greeting')).toContainText(defaultUser.name);
});</code></pre>
        </div>

        <h3>Fixture Scoping: Test vs Worker</h3>
        <p>By default, fixtures are <strong>test-scoped</strong> — they are created fresh for every test. You can change this to <strong>worker-scoped</strong> so the fixture is created once per worker process and shared across all tests that worker runs. Worker-scoped fixtures are ideal for expensive setup like database connections or browser authentication state.</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test as base } from '@playwright/test';

export const test = base.extend({
  // Worker-scoped fixture: created once, shared across tests in a worker
  dbConnection: [async ({}, use) => {
    // Setup: open a DB connection (expensive operation)
    const db = await connectToDatabase({
      host: 'localhost',
      port: 5432,
      database: 'test_db'
    });
    console.log('Database connection established');

    await use(db);

    // Teardown: close connection when worker is done
    await db.close();
    console.log('Database connection closed');
  }, { scope: 'worker' }],

  // Test-scoped fixture (default): fresh for every test
  cleanDb: async ({ dbConnection }, use) => {
    // Uses the worker-scoped dbConnection
    await dbConnection.query('BEGIN');
    await use(dbConnection);
    await dbConnection.query('ROLLBACK'); // undo test changes
  },
});</code></pre>
        </div>
        <div class="warning-box"><strong>⚠️ Warning:</strong> Worker-scoped fixtures cannot depend on test-scoped fixtures. The dependency only works in one direction: test-scoped fixtures can depend on worker-scoped ones. Also, worker-scoped fixtures cannot use the <code>page</code> or <code>context</code> fixtures since those are test-scoped.</div>

        <h3>Example: Todo App Fixture</h3>
        <p>Here's a practical example of a fixture that navigates to a Todo app and pre-seeds it with data, so every test starts with a ready-to-use environment:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fixtures/todo-fixtures.js
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  todoApp: async ({ page }, use) => {
    // Setup: navigate to app and seed data
    await page.goto('https://demo.playwright.dev/todomvc');

    // Add some default todos
    const defaultTodos = ['Buy milk', 'Walk the dog', 'Write tests'];
    for (const todo of defaultTodos) {
      await page.locator('.new-todo').fill(todo);
      await page.locator('.new-todo').press('Enter');
    }

    // Verify todos were added
    await expect(page.locator('.todo-list li')).toHaveCount(3);

    // Provide a helper object to the test
    await use({
      page,
      todos: defaultTodos,
      async addTodo(text) {
        await page.locator('.new-todo').fill(text);
        await page.locator('.new-todo').press('Enter');
      },
      async getTodoCount() {
        return await page.locator('.todo-list li').count();
      }
    });

    // Teardown is automatic — Playwright closes the page
  },
});

export { expect };</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/todo.spec.js
import { test, expect } from '../fixtures/todo-fixtures';

test('should have 3 pre-seeded todos', async ({ todoApp }) => {
  const count = await todoApp.getTodoCount();
  expect(count).toBe(3);
});

test('should add a new todo via helper', async ({ todoApp }) => {
  await todoApp.addTodo('Learn Playwright fixtures');
  const count = await todoApp.getTodoCount();
  expect(count).toBe(4);
});</code></pre>
        </div>

        <h3>Example: Authenticated Page Fixture</h3>
        <p>One of the most common fixtures is an authenticated page — a page where the user is already logged in:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fixtures/auth-fixtures.js
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  // Worker-scoped: store auth state once
  authState: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Log in once
    await page.goto('/login');
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'AdminPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Save the storage state (cookies + localStorage)
    const storageState = await context.storageState();
    await context.close();

    await use(storageState);
  }, { scope: 'worker' }],

  // Test-scoped: create a new page using the saved auth state
  authenticatedPage: async ({ browser, authState }, use) => {
    const context = await browser.newContext({ storageState: authState });
    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect };</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/dashboard.spec.js
import { test, expect } from '../fixtures/auth-fixtures';

test('dashboard shows user info', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('.user-name')).toHaveText('admin@example.com');
});

test('can access admin settings', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/admin/settings');
  await expect(authenticatedPage).not.toHaveURL('/login'); // Not redirected
  await expect(authenticatedPage.locator('h1')).toHaveText('Admin Settings');
});</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> The <code>storageState</code> approach is the officially recommended way to handle authentication in Playwright. Log in once in a worker-scoped fixture, save the state, and reuse it across all tests for blazing-fast authenticated test runs.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the primary advantage of fixtures over beforeEach hooks?',
            options: [
              'Fixtures run faster than hooks',
              'Fixtures are lazy, composable, and reusable across files',
              'Fixtures can only be used with the page object',
              'Fixtures automatically retry failed tests'
            ],
            correct: 1,
            explanation: 'Fixtures are lazy (only set up when requested), composable (can depend on each other), and reusable (defined once, shared across test files). Hooks always run, are hard to compose, and are tied to a specific file.'
          },
          {
            question: 'In a custom fixture, what does the code after "await use(value)" do?',
            options: [
              'It runs before the test starts',
              'It runs concurrently with the test',
              'It serves as teardown logic, running after the test finishes',
              'It is ignored by Playwright'
            ],
            correct: 2,
            explanation: 'The fixture function is split by the use() call: code before use() is setup, and code after use() is teardown. The teardown runs after the test that consumed the fixture has completed, regardless of pass/fail.'
          },
          {
            question: 'What is the scope option for a fixture that should be created once per worker and shared across tests?',
            options: [
              '{ scope: "global" }',
              '{ scope: "worker" }',
              '{ scope: "shared" }',
              '{ scope: "suite" }'
            ],
            correct: 1,
            explanation: 'Worker-scoped fixtures are declared with { scope: "worker" } using the array syntax in test.extend(). They are created once per worker process and shared across all tests that worker runs, making them ideal for expensive setup operations.'
          }
        ]
      }
    },
    {
      id: 'page-object-model',
      title: 'Page Object Model Pattern',
      content: `
        <h2>Page Object Model Pattern</h2>
        <p>The <strong>Page Object Model (POM)</strong> is a design pattern widely used in test automation that creates an abstraction layer between your tests and the UI. Instead of scattering locators and interactions throughout your test files, you encapsulate them in dedicated classes — one per page or major component of your application. This is arguably the most important pattern for building scalable, maintainable Playwright test suites.</p>

        <h3>Why Use POM?</h3>
        <p>Without POM, your tests are brittle and hard to maintain:</p>
        <ul>
          <li><strong>Maintainability:</strong> When a UI element's selector changes, you update it in <em>one place</em> (the Page Object) instead of hunting through dozens of test files.</li>
          <li><strong>Readability:</strong> Tests read like user stories: <code>await loginPage.login('user', 'pass')</code> is far clearer than a sequence of fill/click operations.</li>
          <li><strong>Reusability:</strong> Common flows (login, navigation, form filling) are defined once and reused across tests.</li>
          <li><strong>Separation of concerns:</strong> Tests define <em>what</em> to verify; Page Objects define <em>how</em> to interact with the UI.</li>
        </ul>

        <h3>Creating a Page Object Class</h3>
        <p>A Page Object class takes a Playwright <code>page</code> in its constructor and exposes locators as properties and actions as methods. Here's a basic LoginPage example:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// pages/LoginPage.js
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Define locators as class properties
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
    this.rememberMeCheckbox = page.locator('#remember-me');
    this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');
  }

  // Navigate to the login page
  async goto() {
    await this.page.goto('/login');
  }

  // Perform login with given credentials
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Login with "remember me" checked
  async loginWithRememberMe(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
  }

  // Get the error message text
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}</code></pre>
        </div>

        <h3>Creating a Dashboard Page Object</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// pages/DashboardPage.js
export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Header elements
    this.userAvatar = page.locator('.user-avatar');
    this.userName = page.locator('.user-name');
    this.logoutButton = page.locator('#logout');
    this.notificationBell = page.locator('.notifications-bell');
    this.notificationCount = page.locator('.notification-count');

    // Dashboard widgets
    this.widgets = page.locator('.dashboard-widget');
    this.recentActivity = page.locator('#recent-activity');
    this.statsPanel = page.locator('#stats-panel');

    // Sidebar navigation
    this.sidebarLinks = page.locator('.sidebar-nav a');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async getUserName() {
    return await this.userName.textContent();
  }

  async getWidgetCount() {
    return await this.widgets.count();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }

  async navigateTo(sectionName) {
    await this.sidebarLinks.filter({ hasText: sectionName }).click();
  }

  async getNotificationCount() {
    const text = await this.notificationCount.textContent();
    return parseInt(text, 10);
  }
}</code></pre>
        </div>

        <h3>Using Page Objects in Tests</h3>
        <p>With your page objects defined, tests become clean and descriptive:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/login.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Login Flow', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('admin@example.com', 'password123');

    // Verify redirect
    await expect(page).toHaveURL('/dashboard');

    // Verify dashboard state
    const userName = await dashboardPage.getUserName();
    expect(userName).toBe('Admin User');
  });

  test('invalid credentials show error message', async () => {
    await loginPage.login('wrong@email.com', 'badpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
  });

  test('logout returns to login page', async ({ page }) => {
    await loginPage.login('admin@example.com', 'password123');
    await dashboardPage.logout();

    await expect(page).toHaveURL('/login');
    await expect(loginPage.emailInput).toBeVisible();
  });
});</code></pre>
        </div>

        <h3>Integrating POM with Fixtures</h3>
        <p>The most powerful approach is combining Page Objects with fixtures. This way, tests receive ready-to-use page objects via dependency injection, without any manual instantiation:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fixtures.js — combine POM with fixtures
import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // A fixture that provides an already-logged-in dashboard
  loggedInDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('admin@example.com', 'password123');
    await page.waitForURL('/dashboard');

    await use(dashboardPage);
  },
});

export { expect };</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/dashboard.spec.js — clean tests with POM fixtures
import { test, expect } from '../fixtures';

test('dashboard shows correct widget count', async ({ loggedInDashboard }) => {
  const count = await loggedInDashboard.getWidgetCount();
  expect(count).toBeGreaterThan(0);
});

test('can navigate to reports section', async ({ loggedInDashboard }) => {
  await loggedInDashboard.navigateTo('Reports');
  await expect(loggedInDashboard.page).toHaveURL(/\\/reports/);
});

test('login page shows form elements', async ({ loginPage }) => {
  await loginPage.goto();
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.loginButton).toBeEnabled();
});</code></pre>
        </div>

        <h3>Best Practices for POM in Playwright</h3>
        <div class="info-box"><strong>ℹ️ Note:</strong> Following these best practices will keep your POM implementation clean and your test suite maintainable as it grows.</div>
        <ul>
          <li><strong>One class per page/component:</strong> Don't create a god-object. Each page or significant component gets its own class.</li>
          <li><strong>No assertions in Page Objects:</strong> Page Objects should encapsulate interactions and return values. Assertions belong in test files — this keeps Page Objects reusable across different test scenarios.</li>
          <li><strong>Use descriptive method names:</strong> <code>login()</code>, <code>addToCart()</code>, <code>checkout()</code> — methods should describe user actions.</li>
          <li><strong>Return new Page Objects for navigation:</strong> If clicking a button navigates to a new page, consider returning the new Page Object from the method.</li>
          <li><strong>Keep locators in the constructor:</strong> Define all locators in one place for easy updates when UI changes.</li>
          <li><strong>Use the constructor parameter typing:</strong> Use JSDoc <code>@param</code> to get IntelliSense in your editor.</li>
        </ul>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Best practice: return new Page Object on navigation
export class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.placeOrderButton = page.locator('#place-order');
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForURL('/order-confirmation');
    // Return the next page object
    return new OrderConfirmationPage(this.page);
  }
}

// Usage in test:
// const confirmationPage = await checkoutPage.placeOrder();
// await expect(confirmationPage.orderNumber).toBeVisible();</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> A well-structured POM project might look like: <code>pages/</code> for Page Objects, <code>fixtures/</code> for fixture definitions, <code>tests/</code> for test specs. This separation keeps your project organized and scalable.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the primary purpose of the Page Object Model pattern?',
            options: [
              'To make tests run faster by caching page elements',
              'To create an abstraction layer that encapsulates UI interactions for maintainability and reusability',
              'To automatically generate tests from page structure',
              'To replace Playwright\'s built-in locator system'
            ],
            correct: 1,
            explanation: 'The POM pattern creates an abstraction between tests and the UI. By encapsulating locators and interactions in Page Object classes, you gain maintainability (update selectors in one place), reusability (share page objects across tests), and readability (tests read like user stories).'
          },
          {
            question: 'Where should assertions be placed when using POM?',
            options: [
              'Inside the Page Object methods for convenience',
              'In the constructor of the Page Object',
              'In the test files, not inside Page Objects',
              'In a separate assertions file'
            ],
            correct: 2,
            explanation: 'Assertions belong in test files, not in Page Objects. Page Objects should only encapsulate UI interactions and return values. Keeping assertions out of Page Objects makes them reusable across different test scenarios that may assert different outcomes from the same interaction.'
          },
          {
            question: 'How can you combine POM with Playwright fixtures?',
            options: [
              'By extending Page with the POM class',
              'By creating fixtures with test.extend() that instantiate and provide Page Objects',
              'POM and fixtures cannot be used together',
              'By importing Page Objects directly inside test.beforeAll()'
            ],
            correct: 1,
            explanation: 'You can create custom fixtures using test.extend() that instantiate Page Objects and pass them to tests via the use() callback. This gives tests clean, dependency-injected Page Objects without manual instantiation, combining the best of both patterns.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 7: Visual Testing & Screenshots
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-7',
  title: 'Module 7: Visual Testing & Screenshots',
  icon: '📸',
  sections: [
    {
      id: 'screenshot-testing',
      title: 'Screenshot Comparisons',
      content: `
        <h2>Screenshot Comparisons</h2>
        <p><strong>Visual regression testing</strong> (also known as screenshot testing) is a technique where you capture screenshots of your application and compare them pixel-by-pixel against known-good <strong>baseline</strong> images. Playwright has built-in support for this via the <code>toHaveScreenshot()</code> matcher — no external plugins or services needed. This catches visual bugs that functional tests miss: broken layouts, CSS regressions, font rendering issues, color changes, and misaligned elements.</p>

        <h3>How It Works</h3>
        <p>The workflow is simple:</p>
        <ol>
          <li><strong>First run:</strong> Playwright takes a screenshot and saves it as a <strong>baseline</strong> image (golden file). The test "fails" because there's no existing baseline to compare against, but the file is created.</li>
          <li><strong>Subsequent runs:</strong> Playwright takes a new screenshot and compares it pixel-by-pixel against the baseline. If the images match (within configured tolerance), the test passes. If they differ, the test fails and Playwright generates a diff image showing exactly what changed.</li>
          <li><strong>Updating baselines:</strong> When you intentionally change the UI, you update baselines by running with the <code>--update-snapshots</code> flag.</li>
        </ol>

        <h3>Full Page Screenshots</h3>
        <p>The <code>expect(page).toHaveScreenshot()</code> assertion captures the entire visible viewport and compares it against a stored baseline:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('homepage visual test', async ({ page }) => {
  await page.goto('https://myapp.com');

  // Capture full page screenshot and compare to baseline
  await expect(page).toHaveScreenshot();
});

test('homepage with custom name', async ({ page }) => {
  await page.goto('https://myapp.com');

  // Use a custom snapshot name (useful for multiple screenshots in one test)
  await expect(page).toHaveScreenshot('homepage-default.png');
});

test('full scrollable page screenshot', async ({ page }) => {
  await page.goto('https://myapp.com/long-page');

  // Capture the ENTIRE page including content below the fold
  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true
  });
});</code></pre>
        </div>
        <div class="info-box"><strong>ℹ️ Note:</strong> Baseline screenshots are stored alongside your test files in a folder named <code>[test-file-name]-snapshots/</code>. For example, <code>home.spec.js</code> baselines go in <code>home.spec.js-snapshots/</code>.</div>

        <h3>Element-Level Screenshots</h3>
        <p>You can also compare screenshots of individual elements — this is often more reliable than full-page comparisons since it's less affected by layout changes in unrelated parts of the page:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('navigation bar visual test', async ({ page }) => {
  await page.goto('https://myapp.com');

  // Screenshot just the navbar
  const navbar = page.locator('nav.main-navigation');
  await expect(navbar).toHaveScreenshot('navbar.png');
});

test('product card visual test', async ({ page }) => {
  await page.goto('https://myapp.com/products');

  // Screenshot a specific product card
  const firstProduct = page.locator('.product-card').first();
  await expect(firstProduct).toHaveScreenshot('product-card.png');
});

test('footer visual test', async ({ page }) => {
  await page.goto('https://myapp.com');

  const footer = page.locator('footer');
  // Scroll the footer into view before capturing
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toHaveScreenshot('footer.png');
});</code></pre>
        </div>

        <h3>Configuring Comparison Thresholds</h3>
        <p>Pixel-perfect comparison is rarely practical — anti-aliasing, font rendering, and subpixel differences vary across environments. Playwright provides several options to control comparison sensitivity:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('visual test with thresholds', async ({ page }) => {
  await page.goto('https://myapp.com');

  await expect(page).toHaveScreenshot('homepage.png', {
    // Maximum allowed ratio of differing pixels (0 to 1)
    // 0.01 = allow up to 1% of pixels to differ
    maxDiffPixelRatio: 0.01,
  });
});

test('visual test with pixel count', async ({ page }) => {
  await page.goto('https://myapp.com');

  await expect(page).toHaveScreenshot('homepage.png', {
    // Maximum number of pixels that can differ
    maxDiffPixels: 100,
  });
});

test('visual test with color threshold', async ({ page }) => {
  await page.goto('https://myapp.com');

  await expect(page).toHaveScreenshot('homepage.png', {
    // Threshold for each pixel's color difference (0 to 1)
    // Higher values are more tolerant of color variations
    threshold: 0.3,
  });
});</code></pre>
        </div>

        <p>You can also set these thresholds globally in your <code>playwright.config.js</code>:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      // Apply thresholds globally to all screenshot comparisons
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  // Snapshot configuration
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
});</code></pre>
        </div>

        <h3>Updating Baselines</h3>
        <p>When you intentionally change the UI (redesign, new features, style updates), you need to update the baseline screenshots to match the new expected appearance:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Update ALL baseline screenshots
npx playwright test --update-snapshots

# Update baselines for a specific test file
npx playwright test home.spec.js --update-snapshots

# Update baselines for a specific project (e.g., only Chromium)
npx playwright test --project=chromium --update-snapshots</code></pre>
        </div>

        <h3>Platform-Specific Snapshots</h3>
        <p>Screenshot rendering differs across operating systems due to font rendering, anti-aliasing, and other platform-specific behaviors. By default, Playwright stores snapshots per platform (Linux, macOS, Windows). This means:</p>
        <ul>
          <li>Baselines created on macOS won't match when tests run on Linux CI</li>
          <li>You need to generate baselines on the same platform as your CI environment</li>
          <li>The default snapshot path includes the platform: <code>homepage-chromium-linux.png</code></li>
        </ul>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js — customize snapshot path template
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Control how snapshot paths are generated
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
});</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> To avoid platform inconsistency issues, generate your baseline screenshots inside Docker using the official Playwright Docker image. This ensures the same rendering environment is used locally and in CI: <code>docker run --rm -v \$(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy npx playwright test --update-snapshots</code></div>
        <div class="warning-box"><strong>⚠️ Warning:</strong> Never commit baseline screenshots generated on a different OS than your CI server. The font rendering differences will cause persistent false failures. Use the same environment (ideally Docker) for both baseline generation and CI runs.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What happens on the first run of a toHaveScreenshot() test?',
            options: [
              'The test passes with a generic default image',
              'The test fails and creates a baseline screenshot file',
              'Playwright prompts you to take a manual screenshot',
              'The test is automatically skipped'
            ],
            correct: 1,
            explanation: 'On the first run, there is no existing baseline to compare against, so the test fails. However, Playwright creates the baseline screenshot file automatically. On the next run, the comparison will work against this new baseline.'
          },
          {
            question: 'How do you update baseline screenshots after an intentional UI change?',
            options: [
              'Delete the snapshots folder and re-run tests',
              'Run npx playwright test --update-snapshots',
              'Manually replace the image files',
              'Set updateBaseline: true in the config'
            ],
            correct: 1,
            explanation: 'The --update-snapshots flag tells Playwright to capture new screenshots and overwrite the existing baselines instead of comparing against them. This is the official and safest way to update baselines.'
          },
          {
            question: 'What does the maxDiffPixelRatio option control?',
            options: [
              'The maximum resolution of the screenshot',
              'The maximum allowed ratio (0-1) of pixels that can differ between actual and baseline',
              'The maximum file size of the screenshot',
              'The maximum time to wait for the screenshot'
            ],
            correct: 1,
            explanation: 'maxDiffPixelRatio accepts a value between 0 and 1 representing the maximum fraction of pixels that are allowed to differ. For example, 0.01 means up to 1% of the total pixels can differ and the test still passes.'
          }
        ]
      }
    },
    {
      id: 'visual-best-practices',
      title: 'Visual Testing Best Practices',
      content: `
        <h2>Visual Testing Best Practices</h2>
        <p>Visual regression testing is powerful but can be fragile if not handled carefully. Dynamic content like animations, advertisements, timestamps, and random data can cause screenshots to differ between runs even when no real bug exists. These <strong>false positives</strong> erode trust in your test suite and waste developer time investigating non-issues. This section covers practical strategies to make your visual tests reliable, deterministic, and maintainable.</p>

        <h3>Masking Dynamic Content</h3>
        <p>The most common source of flaky visual tests is <strong>dynamic content</strong> — elements that change on every page load. Playwright's <code>toHaveScreenshot()</code> supports a <code>mask</code> option that overlays colored rectangles on specified locators, hiding their variable content from comparison:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('homepage with masked dynamic content', async ({ page }) => {
  await page.goto('https://myapp.com');

  await expect(page).toHaveScreenshot('homepage.png', {
    // Mask these elements — they'll be covered with a pink box
    mask: [
      page.locator('.advertisement-banner'),
      page.locator('.current-date-time'),
      page.locator('.live-visitor-count'),
      page.locator('.random-testimonial'),
    ],
    // Customize the mask color (default is pink #FF00FF)
    maskColor: '#808080',
  });
});

test('dashboard with masked user-specific data', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [
      page.locator('.user-avatar'),        // Profile picture varies
      page.locator('.last-login-time'),     // Changes every session
      page.locator('.notification-badge'),  // Count changes
    ],
  });
});</code></pre>
        </div>

        <h3>Hiding Elements with JavaScript</h3>
        <p>Sometimes you need more control than masking provides. You can use JavaScript evaluation to hide, remove, or modify elements before taking a screenshot:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('page with hidden dynamic elements', async ({ page }) => {
  await page.goto('https://myapp.com');

  // Hide elements completely
  await page.locator('.ad-banner').evaluate(el => el.style.visibility = 'hidden');
  await page.locator('.cookie-popup').evaluate(el => el.style.display = 'none');

  // Replace dynamic text with static placeholder
  await page.locator('.timestamp').evaluate(el => el.textContent = '2024-01-01 12:00:00');

  // Remove an element from the DOM entirely
  await page.locator('.random-recommendation').evaluate(el => el.remove());

  // Now take the screenshot — dynamic content is neutralized
  await expect(page).toHaveScreenshot('clean-homepage.png');
});

test('freeze all dynamic content', async ({ page }) => {
  await page.goto('https://myapp.com');

  // Freeze all elements with a specific class
  await page.evaluate(() => {
    document.querySelectorAll('.dynamic-content').forEach(el => {
      el.style.visibility = 'hidden';
    });
  });

  await expect(page).toHaveScreenshot('frozen-page.png');
});</code></pre>
        </div>

        <h3>Handling Animations</h3>
        <p>CSS and JavaScript animations are another major source of flakiness — a screenshot taken mid-animation will differ from one taken after the animation completes. Playwright provides a built-in option to disable all CSS animations and transitions:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('page without animations', async ({ page }) => {
  await page.goto('https://myapp.com');

  await expect(page).toHaveScreenshot('no-animations.png', {
    // Disable all CSS animations and transitions
    animations: 'disabled',
  });
});

test('component with loading spinner', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for the loading spinner to disappear
  await page.locator('.loading-spinner').waitFor({ state: 'hidden' });

  // Then take the screenshot
  await expect(page).toHaveScreenshot('dashboard-loaded.png', {
    animations: 'disabled',
  });
});

// You can also disable animations globally in playwright.config.js:
// expect: {
//   toHaveScreenshot: {
//     animations: 'disabled',
//   },
// }</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> Playwright's <code>animations: 'disabled'</code> option works by injecting a stylesheet that sets <code>animation-duration: 0s !important</code> and <code>transition-duration: 0s !important</code> on all elements. This forces all CSS animations and transitions to their final state instantly.</div>

        <h3>Full Page vs Element Screenshots</h3>
        <p>Choose your screenshot scope wisely:</p>
        <ul>
          <li><strong>Full page screenshots</strong> (<code>expect(page).toHaveScreenshot()</code>): Good for catching layout-level regressions, but more prone to false positives from dynamic content anywhere on the page.</li>
          <li><strong>Element screenshots</strong> (<code>expect(locator).toHaveScreenshot()</code>): More focused and stable, ideal for testing specific components. Less affected by changes to unrelated parts of the page.</li>
          <li><strong>Use <code>fullPage: true</code></strong> only when you need to verify below-the-fold content. This captures the entire scrollable area.</li>
        </ul>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('component-level visual tests', async ({ page }) => {
  await page.goto('/components');

  // Test individual components — more stable than full page
  await expect(page.locator('.header')).toHaveScreenshot('header.png', {
    animations: 'disabled',
  });

  await expect(page.locator('.search-bar')).toHaveScreenshot('search-bar.png');

  await expect(page.locator('.product-grid')).toHaveScreenshot('product-grid.png', {
    mask: [page.locator('.product-price')], // prices may change
  });
});</code></pre>
        </div>

        <h3>CI Considerations for Visual Tests</h3>
        <p>Running visual tests in CI introduces additional challenges:</p>
        <ul>
          <li><strong>Consistent environment:</strong> Use Docker with the official Playwright image to ensure identical rendering across all environments.</li>
          <li><strong>Generate baselines in CI:</strong> Create your baselines on the same environment that runs your CI tests. Never generate baselines on macOS and run tests on Linux.</li>
          <li><strong>Viewport consistency:</strong> Lock viewport size in your config to prevent screenshot size differences.</li>
          <li><strong>Store baselines in version control:</strong> Commit baseline images to your repository so they're tracked alongside code changes.</li>
          <li><strong>Review visual diffs:</strong> When visual tests fail, Playwright generates <code>actual</code>, <code>expected</code>, and <code>diff</code> images in the test results folder. Configure your CI to upload these as artifacts for easy review.</li>
        </ul>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js — CI-optimized visual testing config
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,

  // Lock viewport size for consistent screenshots
  use: {
    viewport: { width: 1280, height: 720 },
    // Use a consistent locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    // Disable all animations globally
    // This applies to page.screenshot() as well
  },

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
      // Scale for consistent cross-platform results
      scale: 'css',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});</code></pre>
        </div>
        <div class="warning-box"><strong>⚠️ Warning:</strong> Visual tests are inherently environment-sensitive. A common pitfall is generating baselines locally (macOS/Windows) and running CI on Linux. Font rendering, anti-aliasing, and subpixel rendering will differ, causing perpetual failures. Always generate and run on the same platform — ideally the Playwright Docker image.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'How do you prevent CSS animations from causing flaky screenshot comparisons?',
            options: [
              'Use page.waitForTimeout(5000) to wait for animations to complete',
              'Pass { animations: "disabled" } option to toHaveScreenshot()',
              'Remove all CSS files before taking the screenshot',
              'Set the browser to run in slow motion'
            ],
            correct: 1,
            explanation: 'The animations: "disabled" option tells Playwright to inject CSS that forces all animations and transitions to their final state instantly (by setting their duration to 0s). This ensures deterministic screenshots regardless of animation timing.'
          },
          {
            question: 'What is the recommended approach for handling dynamic content like dates or ad banners in visual tests?',
            options: [
              'Ignore visual testing for pages with dynamic content',
              'Use the mask option in toHaveScreenshot() to cover dynamic elements with colored rectangles',
              'Run visual tests only at midnight when content is predictable',
              'Take multiple screenshots and average them'
            ],
            correct: 1,
            explanation: 'The mask option accepts an array of locators and covers those elements with colored rectangles in the screenshot. This prevents dynamic content from causing false failures while still testing the rest of the page\'s visual appearance.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 8: API Testing
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-8',
  title: 'Module 8: API Testing',
  icon: '🌐',
  sections: [
    {
      id: 'api-testing-basics',
      title: 'API Testing with Playwright',
      content: `
        <h2>API Testing with Playwright</h2>
        <p>Playwright isn't just for browser automation — it includes a powerful <strong>API testing</strong> capability through the <code>APIRequestContext</code>. This allows you to send HTTP requests directly without launching a browser, making API tests incredibly fast. You can use Playwright's API testing to validate REST endpoints, seed test data, set up preconditions via API before running UI tests, and create comprehensive end-to-end tests that combine API and UI interactions.</p>

        <h3>The request Fixture</h3>
        <p>Playwright provides a built-in <code>request</code> fixture that gives you an <code>APIRequestContext</code>. This context handles cookies, headers, and follows redirects automatically. It's test-scoped, meaning each test gets a fresh context:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('basic GET request', async ({ request }) => {
  // Send a GET request
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  // Assert response status
  expect(response.ok()).toBeTruthy();       // Status 200-299
  expect(response.status()).toBe(200);

  // Parse and assert the JSON body
  const body = await response.json();
  expect(body.id).toBe(1);
  expect(body.title).toBeTruthy();
  expect(body.userId).toBeDefined();
});

test('GET request with query parameters', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts', {
    params: {
      userId: 1,
      _limit: 5,
    },
  });

  expect(response.ok()).toBeTruthy();
  const posts = await response.json();
  expect(posts).toHaveLength(5);
  posts.forEach(post => {
    expect(post.userId).toBe(1);
  });
});</code></pre>
        </div>

        <h3>CRUD Operations</h3>
        <p>Here's a comprehensive example of testing all CRUD (Create, Read, Update, Delete) operations against a REST API:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

const API_BASE = 'https://jsonplaceholder.typicode.com';

test.describe('Posts API - CRUD Operations', () => {

  test('CREATE - POST a new post', async ({ request }) => {
    const newPost = {
      title: 'Playwright API Testing',
      body: 'This post was created via Playwright API test',
      userId: 1,
    };

    const response = await request.post(\`\${API_BASE}/posts\`, {
      data: newPost,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(201); // Created
    const created = await response.json();
    expect(created.title).toBe(newPost.title);
    expect(created.body).toBe(newPost.body);
    expect(created.userId).toBe(newPost.userId);
    expect(created.id).toBeDefined();
  });

  test('READ - GET all posts', async ({ request }) => {
    const response = await request.get(\`\${API_BASE}/posts\`);

    expect(response.ok()).toBeTruthy();
    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);

    // Validate structure of the first post
    const firstPost = posts[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');
  });

  test('READ - GET a single post', async ({ request }) => {
    const response = await request.get(\`\${API_BASE}/posts/1\`);

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.id).toBe(1);
  });

  test('UPDATE - PUT to update a post', async ({ request }) => {
    const updatedData = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };

    const response = await request.put(\`\${API_BASE}/posts/1\`, {
      data: updatedData,
    });

    expect(response.ok()).toBeTruthy();
    const updated = await response.json();
    expect(updated.title).toBe('Updated Title');
    expect(updated.body).toBe('Updated body content');
  });

  test('UPDATE - PATCH partial update', async ({ request }) => {
    const response = await request.patch(\`\${API_BASE}/posts/1\`, {
      data: {
        title: 'Partially Updated Title',
      },
    });

    expect(response.ok()).toBeTruthy();
    const patched = await response.json();
    expect(patched.title).toBe('Partially Updated Title');
    // Other fields should remain unchanged
    expect(patched.userId).toBeDefined();
  });

  test('DELETE - Remove a post', async ({ request }) => {
    const response = await request.delete(\`\${API_BASE}/posts/1\`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });
});</code></pre>
        </div>

        <h3>Asserting Response Headers</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('assert response headers', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  // Check specific headers
  expect(response.headers()['content-type']).toContain('application/json');

  // Check status text
  expect(response.statusText()).toBe('OK');

  // Headers are returned as a plain object with lowercase keys
  const headers = response.headers();
  expect(headers).toHaveProperty('content-type');
});</code></pre>
        </div>

        <h3>Creating Standalone API Test Suites</h3>
        <p>You can create API-only test files that don't need a browser at all. This is useful for backend validation:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.js — dedicated API testing project
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'api-tests',
      testDir: './tests/api',
      use: {
        // No browser needed for API tests
        baseURL: 'https://api.myapp.com',
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
    {
      name: 'ui-tests',
      testDir: './tests/ui',
      use: {
        baseURL: 'https://myapp.com',
        browserName: 'chromium',
      },
    },
  ],
});</code></pre>
        </div>

        <h3>Combining API + UI Tests</h3>
        <p>One of the most powerful patterns is using API calls to set up data, then verifying it through the UI. This is faster than doing everything through the browser and more realistic than pure API tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('seed data via API, verify in UI', async ({ page, request }) => {
  // Step 1: Create a new post via API (fast!)
  const response = await request.post('https://api.myapp.com/posts', {
    data: {
      title: 'API-Created Post',
      body: 'This post was seeded via API for UI verification',
      published: true,
    },
  });
  expect(response.ok()).toBeTruthy();
  const post = await response.json();

  // Step 2: Navigate to the post in the browser and verify
  await page.goto(\`/posts/\${post.id}\`);
  await expect(page.locator('h1')).toHaveText('API-Created Post');
  await expect(page.locator('.post-body')).toContainText('seeded via API');

  // Step 3: Clean up via API
  const deleteResponse = await request.delete(\`https://api.myapp.com/posts/\${post.id}\`);
  expect(deleteResponse.ok()).toBeTruthy();
});

test('verify API state after UI action', async ({ page, request }) => {
  // Step 1: Perform an action in the UI
  await page.goto('/posts/new');
  await page.fill('#title', 'UI-Created Post');
  await page.fill('#body', 'Created through the browser');
  await page.click('button#publish');

  // Wait for success message
  await expect(page.locator('.success-toast')).toBeVisible();

  // Step 2: Verify the data was persisted via API
  const response = await request.get('https://api.myapp.com/posts?title=UI-Created+Post');
  expect(response.ok()).toBeTruthy();
  const posts = await response.json();
  expect(posts.length).toBe(1);
  expect(posts[0].body).toBe('Created through the browser');
});</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> Seeding test data via API is significantly faster than navigating through UI flows. Use API calls in <code>beforeEach</code> hooks or fixtures to set up complex test scenarios, then use the browser only for what you're actually testing.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What Playwright fixture provides API testing capabilities?',
            options: [
              'The browser fixture',
              'The page fixture',
              'The request fixture (APIRequestContext)',
              'The context fixture'
            ],
            correct: 2,
            explanation: 'The request fixture provides an APIRequestContext that can make HTTP requests directly without a browser. It supports GET, POST, PUT, PATCH, DELETE and other HTTP methods, and handles cookies and headers automatically.'
          },
          {
            question: 'How do you send a POST request with a JSON body using Playwright API testing?',
            options: [
              'request.post(url, { body: JSON.stringify(data) })',
              'request.post(url, { data: myObject })',
              'request.post(url, myObject)',
              'request.send("POST", url, data)'
            ],
            correct: 1,
            explanation: 'Playwright\'s request.post() accepts a URL and an options object. The data property accepts a JavaScript object that is automatically serialized to JSON. Playwright also sets the Content-Type header to application/json automatically when you use data.'
          },
          {
            question: 'What is the benefit of combining API and UI tests in the same test?',
            options: [
              'It makes tests run slower but more thoroughly',
              'API calls can quickly seed/verify data while the browser tests the actual user experience',
              'It is not recommended to mix API and UI tests',
              'It allows you to skip writing API tests entirely'
            ],
            correct: 1,
            explanation: 'Combining API + UI tests lets you use fast API calls for data setup and verification while using the browser only for testing user-facing interactions. This creates comprehensive tests that are faster than pure UI flows and more realistic than pure API tests.'
          }
        ]
      }
    },
    {
      id: 'api-authentication',
      title: 'API Authentication & Advanced Patterns',
      content: `
        <h2>API Authentication & Advanced Patterns</h2>
        <p>Real-world APIs require authentication, and Playwright's API testing framework makes it straightforward to work with tokens, cookies, and custom headers. Beyond authentication, there are several advanced patterns you'll encounter when testing production APIs: custom fixtures with pre-configured clients, request/response logging for debugging, file uploads, and testing asynchronous workflows.</p>

        <h3>Token-Based Authentication</h3>
        <p>Most modern APIs use bearer tokens (JWT) for authentication. Here's how to authenticate and use tokens in your API tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('Authenticated API Tests', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    // Authenticate once and store the token
    const loginResponse = await request.post('https://api.myapp.com/auth/login', {
      data: {
        email: 'testuser@example.com',
        password: 'SecurePass123!',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const body = await loginResponse.json();
    authToken = body.accessToken;
    console.log('Auth token acquired');
  });

  test('access protected resource', async ({ request }) => {
    const response = await request.get('https://api.myapp.com/user/profile', {
      headers: {
        Authorization: \`Bearer \${authToken}\`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const profile = await response.json();
    expect(profile.email).toBe('testuser@example.com');
  });

  test('unauthorized without token', async ({ request }) => {
    // Intentionally omit the auth header
    const response = await request.get('https://api.myapp.com/user/profile');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('create resource with auth', async ({ request }) => {
    const response = await request.post('https://api.myapp.com/posts', {
      headers: {
        Authorization: \`Bearer \${authToken}\`,
      },
      data: {
        title: 'Authenticated Post',
        content: 'Created with a valid token',
      },
    });

    expect(response.status()).toBe(201);
  });
});</code></pre>
        </div>

        <h3>Custom API Fixture with Base URL and Auth</h3>
        <p>Instead of manually passing auth headers to every request, create a custom fixture that provides a pre-configured API client. This is the cleanest and most scalable approach:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fixtures/api-fixtures.js
import { test as base, expect, request as apiRequest } from '@playwright/test';

export const test = base.extend({
  // Worker-scoped: authenticate once per worker
  apiToken: [async ({}, use) => {
    // Create a standalone request context for login
    const context = await apiRequest.newContext();

    const loginResponse = await context.post('https://api.myapp.com/auth/login', {
      data: {
        email: process.env.API_USER || 'testuser@example.com',
        password: process.env.API_PASSWORD || 'SecurePass123!',
      },
    });

    if (!loginResponse.ok()) {
      throw new Error(\`Login failed: \${loginResponse.status()}\`);
    }

    const { accessToken } = await loginResponse.json();
    await context.dispose();

    await use(accessToken);
  }, { scope: 'worker' }],

  // Test-scoped: fresh API client for each test with auth pre-configured
  apiClient: async ({ apiToken }, use) => {
    const context = await apiRequest.newContext({
      baseURL: 'https://api.myapp.com',
      extraHTTPHeaders: {
        Authorization: \`Bearer \${apiToken}\`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await use(context);

    // Cleanup: dispose the request context
    await context.dispose();
  },
});

export { expect };</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/api/posts.spec.js — clean API tests with the custom fixture
import { test, expect } from '../../fixtures/api-fixtures';

test('list all posts', async ({ apiClient }) => {
  // No need to pass auth headers — they're pre-configured!
  const response = await apiClient.get('/posts');

  expect(response.ok()).toBeTruthy();
  const posts = await response.json();
  expect(posts.length).toBeGreaterThan(0);
});

test('create and retrieve a post', async ({ apiClient }) => {
  // Create
  const createResponse = await apiClient.post('/posts', {
    data: { title: 'Fixture Test', content: 'Created via apiClient fixture' },
  });
  expect(createResponse.status()).toBe(201);
  const { id } = await createResponse.json();

  // Retrieve
  const getResponse = await apiClient.get(\`/posts/\${id}\`);
  expect(getResponse.ok()).toBeTruthy();
  const post = await getResponse.json();
  expect(post.title).toBe('Fixture Test');
});

test('delete a post', async ({ apiClient }) => {
  // Create a post first
  const createResp = await apiClient.post('/posts', {
    data: { title: 'To Be Deleted', content: 'Temporary post' },
  });
  const { id } = await createResp.json();

  // Delete it
  const deleteResp = await apiClient.delete(\`/posts/\${id}\`);
  expect(deleteResp.ok()).toBeTruthy();

  // Verify it's gone
  const getResp = await apiClient.get(\`/posts/\${id}\`);
  expect(getResp.status()).toBe(404);
});</code></pre>
        </div>
        <div class="tip-box"><strong>💡 Tip:</strong> Using a custom <code>apiClient</code> fixture means your tests are clean, DRY, and easy to update. If the auth mechanism changes (e.g., from Bearer tokens to API keys), you update only the fixture — not every test file.</div>

        <h3>Request/Response Logging</h3>
        <p>Logging API requests and responses is invaluable for debugging test failures. You can create a logging wrapper around your API client:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('API request with logging', async ({ request }) => {
  const url = 'https://jsonplaceholder.typicode.com/posts/1';

  // Log the request
  console.log(\`➡️ GET \${url}\`);
  const startTime = Date.now();

  const response = await request.get(url);

  const duration = Date.now() - startTime;

  // Log the response
  console.log(\`⬅️ \${response.status()} \${response.statusText()} (\${duration}ms)\`);

  const body = await response.json();
  console.log('Response body:', JSON.stringify(body, null, 2).substring(0, 200));

  expect(response.ok()).toBeTruthy();
});

// A reusable logging helper
async function loggedRequest(request, method, url, options = {}) {
  console.log(\`➡️ \${method.toUpperCase()} \${url}\`);
  if (options.data) {
    console.log('Request body:', JSON.stringify(options.data));
  }

  const start = Date.now();
  const response = await request[method](url, options);
  const duration = Date.now() - start;

  console.log(\`⬅️ \${response.status()} (\${duration}ms)\`);
  return response;
}

test('using the logging helper', async ({ request }) => {
  const response = await loggedRequest(
    request,
    'get',
    'https://jsonplaceholder.typicode.com/users'
  );

  expect(response.ok()).toBeTruthy();
});</code></pre>
        </div>

        <h3>Testing Webhooks and Async APIs</h3>
        <p>Some APIs trigger asynchronous operations — for example, creating a resource that is processed in the background. Testing these requires polling or waiting for a condition:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('test async API with polling', async ({ request }) => {
  // Step 1: Trigger an async operation
  const triggerResponse = await request.post('https://api.myapp.com/reports/generate', {
    data: { type: 'monthly', month: '2024-01' },
  });
  expect(triggerResponse.status()).toBe(202); // Accepted
  const { jobId } = await triggerResponse.json();

  // Step 2: Poll for completion
  let status = 'processing';
  let attempts = 0;
  const maxAttempts = 30;

  while (status === 'processing' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const statusResponse = await request.get(
      \`https://api.myapp.com/reports/status/\${jobId}\`
    );
    const statusBody = await statusResponse.json();
    status = statusBody.status;
    attempts++;
  }

  expect(status).toBe('completed');

  // Step 3: Retrieve the result
  const resultResponse = await request.get(
    \`https://api.myapp.com/reports/download/\${jobId}\`
  );
  expect(resultResponse.ok()).toBeTruthy();
});</code></pre>
        </div>

        <h3>Multipart Form Data & File Uploads</h3>
        <p>Playwright supports multipart form data for testing file upload APIs:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('upload a file via API', async ({ request }) => {
  // Upload using multipart form data
  const response = await request.post('https://api.myapp.com/files/upload', {
    multipart: {
      // File field — Playwright reads the file automatically
      file: {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: fs.readFileSync(path.join(__dirname, 'fixtures', 'test-document.pdf')),
      },
      // Additional form fields
      description: 'Test upload from Playwright',
      category: 'documents',
    },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.fileName).toBe('test-document.pdf');
  expect(body.fileSize).toBeGreaterThan(0);
  expect(body.url).toBeTruthy();
});

test('upload an image with metadata', async ({ request }) => {
  const imageBuffer = fs.readFileSync(path.join(__dirname, 'fixtures', 'photo.jpg'));

  const response = await request.post('https://api.myapp.com/images', {
    multipart: {
      image: {
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        buffer: imageBuffer,
      },
      alt: 'A test photograph',
      tags: 'test,automated',
    },
  });

  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  expect(result.thumbnailUrl).toBeTruthy();
});</code></pre>
        </div>
        <div class="info-box"><strong>ℹ️ Note:</strong> The <code>multipart</code> option in Playwright's request methods automatically sets the <code>Content-Type</code> header to <code>multipart/form-data</code> with the correct boundary. You don't need to set it manually. Each field in the multipart object can be a string (for text fields) or an object with <code>name</code>, <code>mimeType</code>, and <code>buffer</code> (for file fields).</div>
        <div class="warning-box"><strong>⚠️ Warning:</strong> When using <code>request.post()</code> in standalone API tests (without a browser), ensure your API server is accessible from the test environment. In CI, you may need to start your API server as part of the test setup or use Playwright's <code>webServer</code> config option to start it automatically.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the recommended way to handle API authentication across multiple tests?',
            options: [
              'Log in separately in every test',
              'Hardcode the token in the config file',
              'Create a worker-scoped fixture that authenticates once and provides a pre-configured API client',
              'Skip authentication in tests'
            ],
            correct: 2,
            explanation: 'A worker-scoped fixture authenticates once per worker process and stores the token. A test-scoped apiClient fixture then uses that token to create a pre-configured request context. This approach is efficient (authenticates once), clean (tests don\'t deal with auth), and maintainable (auth logic in one place).'
          },
          {
            question: 'How do you upload a file using Playwright\'s API testing?',
            options: [
              'Use request.upload() method',
              'Use the multipart option in request.post() with a buffer, name, and mimeType',
              'Convert the file to base64 and send it in the request body',
              'File uploads are not supported in Playwright API tests'
            ],
            correct: 1,
            explanation: 'Playwright\'s request.post() accepts a multipart option where you can specify file fields as objects with name, mimeType, and buffer properties. Playwright automatically handles the multipart/form-data encoding and sets the correct Content-Type header.'
          }
        ]
      }
    }
  ]
});
