// Modules 1-3: Getting Started, Core Concepts, Actions & Assertions

// ==================== MODULE 1: Getting Started & Architecture ====================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-1',
  title: 'Module 1: Getting Started & Architecture',
  icon: '🚀',
  sections: [
    {
      id: 'what-is-playwright',
      title: 'What is Playwright?',
      content: `
        <h2>What is Playwright?</h2>
        <p><strong>Playwright</strong> is a modern, open-source end-to-end testing framework developed and maintained by <strong>Microsoft</strong>. It enables reliable, fast, and capable browser automation for web applications across all modern rendering engines — <strong>Chromium</strong>, <strong>Firefox</strong>, and <strong>WebKit</strong> — with a single, unified API.</p>

        <p>Playwright was created by the same team that previously built <a href="https://github.com/puppeteer/puppeteer" target="_blank">Puppeteer</a> at Google. When key engineers moved to Microsoft, they applied the lessons learned from Puppeteer to build a more robust, cross-browser automation library from the ground up.</p>

        <h3>How Playwright Communicates with Browsers</h3>
        <p>One of the most important architectural decisions in Playwright is <strong>how</strong> it communicates with browsers. Unlike the traditional WebDriver/Selenium approach, Playwright uses <strong>direct browser protocols</strong>:</p>
        <ul>
          <li><strong>Chromium</strong>: Uses the <strong>Chrome DevTools Protocol (CDP)</strong> — the same protocol Chrome DevTools uses internally.</li>
          <li><strong>Firefox</strong>: Uses a <strong>custom Juggler protocol</strong> — a protocol specifically developed for Playwright that talks directly to the Firefox internals.</li>
          <li><strong>WebKit</strong>: Uses a <strong>custom WebKit inspection protocol</strong> — similar to the protocol used by Safari's Web Inspector.</li>
        </ul>

        <p>This direct-protocol approach is the key reason Playwright is <strong>faster</strong> and <strong>less flaky</strong> than WebDriver-based tools.</p>

        <h3>Architecture: Playwright vs. WebDriver (Selenium)</h3>
        <p>Let's compare the two architectures side by side to understand why the direct protocol approach is superior:</p>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Architecture Comparison</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>┌─────────────────────────────────────────────────────────┐
│           SELENIUM / WEBDRIVER APPROACH                  │
│                                                         │
│  Test Script                                            │
│      │                                                  │
│      ▼                                                  │
│  WebDriver Client (language binding)                    │
│      │                                                  │
│      ▼  (HTTP requests over JSON Wire / W3C protocol)   │
│  WebDriver Server (chromedriver / geckodriver)          │
│      │                                                  │
│      ▼  (internal browser commands)                     │
│  Browser                                                │
│                                                         │
│  ⚠️  Multiple hops = latency + flakiness                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           PLAYWRIGHT APPROACH                           │
│                                                         │
│  Test Script                                            │
│      │                                                  │
│      ▼  (WebSocket / direct protocol)                   │
│  Browser (via CDP / Juggler / WebKit Protocol)          │
│                                                         │
│  ✅  Single hop = fast + reliable                       │
└─────────────────────────────────────────────────────────┘</code></pre>
        </div>

        <p>With <strong>Selenium</strong>, your test code talks to a WebDriver client library, which sends HTTP requests to a separate WebDriver server process (like <code>chromedriver</code>), which in turn translates those commands into internal browser actions. Each hop introduces latency, serialization overhead, and potential failure points. This is why Selenium tests often suffer from "flakiness" — intermittent failures caused by timing issues.</p>

        <p>With <strong>Playwright</strong>, your test code connects <strong>directly</strong> to the browser via a persistent WebSocket connection using the browser's native debugging protocol. There's no middleman process. Commands are sent and responses received over a single, persistent connection. This makes Playwright:</p>

        <ul>
          <li><strong>Faster</strong> — fewer network hops, no HTTP request/response overhead</li>
          <li><strong>More reliable</strong> — direct communication eliminates timing-related flakiness</li>
          <li><strong>More capable</strong> — access to low-level browser features (network interception, console logs, geolocation, permissions, etc.)</li>
        </ul>

        <h3>Supported Languages</h3>
        <p>Playwright provides first-class support for multiple programming languages:</p>
        <ul>
          <li><strong>JavaScript / TypeScript</strong> — The primary and most feature-complete binding (what this course covers)</li>
          <li><strong>Python</strong> — Full-featured Python binding with both sync and async APIs</li>
          <li><strong>Java</strong> — Enterprise-friendly Java binding</li>
          <li><strong>.NET (C#)</strong> — Full .NET support for Microsoft ecosystem developers</li>
        </ul>

        <div class="tip-box"><strong>💡 Tip:</strong> While all language bindings share the same underlying engine and capabilities, the JavaScript/TypeScript version receives new features first and has the deepest integration with the Playwright Test runner.</div>

        <h3>Key Features at a Glance</h3>
        <ul>
          <li><strong>Cross-browser</strong>: Test on Chromium, Firefox, and WebKit with one API</li>
          <li><strong>Cross-platform</strong>: Run on Windows, macOS, and Linux</li>
          <li><strong>Auto-waiting</strong>: Playwright waits for elements to be actionable before performing actions</li>
          <li><strong>Web-first assertions</strong>: Assertions automatically retry until conditions are met</li>
          <li><strong>Tracing</strong>: Capture screenshots, videos, and DOM snapshots on failure</li>
          <li><strong>Parallelism</strong>: Tests run in isolated browser contexts, enabling safe parallel execution</li>
          <li><strong>Code generation</strong>: Record user interactions and generate test code automatically</li>
        </ul>

        <div class="info-box"><strong>ℹ️ Note:</strong> Playwright downloads its own browser binaries (not the browsers installed on your system). This ensures consistency — everyone on your team tests against the exact same browser version.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What protocol does Playwright use to communicate with Chromium-based browsers?',
            options: [
              'WebDriver JSON Wire Protocol',
              'Chrome DevTools Protocol (CDP)',
              'HTTP REST API',
              'Selenium Grid Protocol'
            ],
            correct: 1,
            explanation: 'Playwright communicates with Chromium browsers using the Chrome DevTools Protocol (CDP), the same protocol used by Chrome DevTools internally. This direct communication is what makes Playwright faster and more reliable than WebDriver-based approaches.'
          },
          {
            question: 'Which company develops and maintains Playwright?',
            options: [
              'Google',
              'Meta (Facebook)',
              'Microsoft',
              'Mozilla'
            ],
            correct: 2,
            explanation: 'Playwright is developed and maintained by Microsoft. It was created by engineers who previously worked on Puppeteer at Google before moving to Microsoft.'
          },
          {
            question: 'Why is Playwright considered less flaky than Selenium?',
            options: [
              'It uses a slower but more reliable HTTP connection',
              'It requires a separate WebDriver server for each browser',
              'It communicates directly with browsers via native protocols, eliminating middleman processes',
              'It only supports one browser engine'
            ],
            correct: 2,
            explanation: 'Playwright communicates directly with browsers through their native debugging protocols (CDP, Juggler, WebKit protocol) over a persistent WebSocket connection. This eliminates the middleman WebDriver server that Selenium requires, reducing latency and eliminating timing-related flakiness.'
          }
        ]
      }
    },
    {
      id: 'installation',
      title: 'Installation & Project Setup',
      content: `
        <h2>Installation & Project Setup</h2>
        <p>Getting started with Playwright is straightforward. The framework provides an initialization command that scaffolds a complete project structure, installs dependencies, and even creates example tests for you.</p>

        <h3>Prerequisites</h3>
        <p>Before installing Playwright, make sure you have:</p>
        <ul>
          <li><strong>Node.js</strong> version 18 or higher installed (check with <code>node --version</code>)</li>
          <li><strong>npm</strong> (comes bundled with Node.js)</li>
          <li>A terminal or command prompt</li>
        </ul>

        <h3>Initializing a New Playwright Project</h3>
        <p>The recommended way to start a new Playwright project is using the <code>npm init</code> command:</p>

        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>npm init playwright@latest</code></pre>
        </div>

        <p>This interactive command will walk you through several configuration choices:</p>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Terminal Output</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>Getting started with writing end-to-end tests with Playwright:
Initializing project in '.'

? Do you want to use TypeScript or JavaScript? · JavaScript
? Where to put your end-to-end tests? · tests
? Add a GitHub Actions workflow? (y/N) · false
? Install Playwright browsers (can be done manually via
  'npx playwright install')? (Y/n) · true

Initializing NPM project (npm init -y)…
Installing Playwright Test (npm install --save-dev @playwright/test)…
Downloading browsers (npx playwright install)…
Writing playwright.config.js…
Writing tests/example.spec.js…
Writing tests-examples/demo-todo-app.spec.js…
Writing package.json…

✔ Success! Created a Playwright Test project at /your/project/path

Inside that directory, you can run several commands:

  npx playwright test
    Runs the end-to-end tests.

  npx playwright test --ui
    Starts the interactive UI mode.

  npx playwright test --project=chromium
    Runs the tests only on Desktop Chrome.

  npx playwright codegen
    Auto generate tests with Codegen.

We suggest that you begin by typing:

  npx playwright test

Visit https://playwright.dev/docs/intro for more information. ✨</code></pre>
        </div>

        <h3>Project Folder Structure</h3>
        <p>After initialization, your project will have this structure:</p>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Project Structure</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>my-playwright-project/
├── node_modules/             # npm dependencies
├── tests/                    # Your test files go here
│   └── example.spec.js       # Example test file
├── tests-examples/           # Additional example tests
│   └── demo-todo-app.spec.js # Full-featured TODO app test
├── playwright.config.js      # Playwright configuration file
├── package.json              # Project metadata and scripts
└── package-lock.json         # Dependency lock file</code></pre>
        </div>

        <p>Let's understand each key file:</p>
        <ul>
          <li><strong>playwright.config.js</strong> — The central configuration file where you define browsers to test on, timeouts, base URL, reporters, and more.</li>
          <li><strong>tests/</strong> — The default directory where your test files live. Playwright looks for files matching <code>*.spec.js</code> or <code>*.spec.ts</code> by default.</li>
          <li><strong>tests-examples/</strong> — Contains a comprehensive example test against a TODO app to learn from.</li>
        </ul>

        <h3>Installing Browsers Separately</h3>
        <p>If you chose not to install browsers during initialization, or if you need to reinstall them later, use:</p>

        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Install all supported browsers
npx playwright install

# Install a specific browser only
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install browsers along with OS-level dependencies (Linux CI)
npx playwright install --with-deps</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Playwright downloads its own browser binaries (~400-500MB total). These are NOT the browsers installed on your system. Make sure you have sufficient disk space, and note that the first install may take several minutes depending on your internet connection.</div>

        <h3>Running Your First Test</h3>
        <p>Once everything is installed, you can run the example test immediately:</p>

        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Run all tests (headless by default)
npx playwright test

# Run tests with a visible browser window
npx playwright test --headed

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run a specific test file
npx playwright test tests/example.spec.js

# Run tests and show the HTML report
npx playwright test
npx playwright show-report</code></pre>
        </div>

        <p>By default, Playwright runs tests in <strong>headless mode</strong> (no visible browser window) across all configured browsers. This is ideal for CI/CD pipelines. The <code>--headed</code> flag opens a visible browser window, which is useful for debugging.</p>

        <h3>Adding Playwright to an Existing Project</h3>
        <p>If you already have a Node.js project and want to add Playwright:</p>

        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Install Playwright Test as a dev dependency
npm install --save-dev @playwright/test

# Install browsers
npx playwright install</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Always install Playwright as a <strong>dev dependency</strong> (<code>--save-dev</code>) since it's a testing tool and not needed in production. The <code>npm init playwright@latest</code> command does this automatically.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the recommended command to initialize a new Playwright project?',
            options: [
              'npm install playwright',
              'npx create-playwright-app',
              'npm init playwright@latest',
              'npx playwright setup'
            ],
            correct: 2,
            explanation: 'The recommended command is "npm init playwright@latest". This interactive command scaffolds a complete project with configuration, example tests, and optionally installs browsers.'
          },
          {
            question: 'What is the default directory where Playwright looks for test files?',
            options: [
              'src/',
              'tests/',
              'spec/',
              'e2e/'
            ],
            correct: 1,
            explanation: 'By default, Playwright looks for test files in the "tests/" directory. This is configured in playwright.config.js and can be changed to any directory you prefer.'
          },
          {
            question: 'Which command installs Playwright browser binaries?',
            options: [
              'npm install browsers',
              'npx playwright download',
              'npx playwright install',
              'npm run install-browsers'
            ],
            correct: 2,
            explanation: '"npx playwright install" downloads and installs all Playwright browser binaries (Chromium, Firefox, WebKit). You can also install specific browsers like "npx playwright install chromium".'
          }
        ]
      }
    },
    {
      id: 'environment-setup',
      title: 'VS Code Environment Setup',
      content: `
        <h2>VS Code Environment Setup</h2>
        <p>Visual Studio Code is the recommended editor for Playwright development. Microsoft provides an <strong>official Playwright extension</strong> that adds powerful features like running tests from the editor, debugging with breakpoints, and generating tests through a visual interface.</p>

        <h3>Installing the Playwright VS Code Extension</h3>
        <p>To install the official extension:</p>
        <ol>
          <li>Open VS Code</li>
          <li>Click the <strong>Extensions</strong> icon in the sidebar (or press <code>Ctrl+Shift+X</code>)</li>
          <li>Search for <strong>"Playwright Test for VSCode"</strong></li>
          <li>Look for the extension by <strong>Microsoft</strong> (official publisher)</li>
          <li>Click <strong>Install</strong></li>
        </ol>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Extension Details</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>Extension Name: Playwright Test for VSCode
Publisher:      Microsoft
Extension ID:   ms-playwright.playwright
Marketplace:    https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Make sure to install the <strong>official</strong> extension by Microsoft (publisher: "ms-playwright"). There are third-party extensions with similar names that may not provide the same level of integration.</div>

        <h3>Running Tests from the Editor</h3>
        <p>Once the extension is installed, you'll notice green <strong>play buttons (▶️)</strong> appearing next to each test and describe block in your test files. These allow you to run tests directly from the editor without switching to the terminal:</p>

        <ul>
          <li><strong>Click the green play button</strong> next to a <code>test()</code> block to run that specific test</li>
          <li><strong>Click the play button</strong> next to a <code>test.describe()</code> block to run all tests in that group</li>
          <li><strong>Right-click</strong> on a play button for more options (run in headed mode, debug, etc.)</li>
        </ul>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/login.spec.js
// ▶️ appears here — click to run all tests in this describe block
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  // ▶️ appears here — click to run just this test
  test('should display login form', async ({ page }) => {
    await page.goto('https://example.com/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  // ▶️ appears here — click to run just this test
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});</code></pre>
        </div>

        <h3>Debugging Tests with Breakpoints</h3>
        <p>One of the most powerful features of the VS Code extension is the ability to <strong>debug tests with breakpoints</strong>, just like debugging any other code:</p>
        <ol>
          <li><strong>Set breakpoints</strong> by clicking in the gutter (left margin) of your test file — a red dot appears</li>
          <li><strong>Right-click the green play button</strong> next to the test you want to debug</li>
          <li>Select <strong>"Debug Test"</strong> from the context menu</li>
          <li>The test will run and <strong>pause at your breakpoint</strong></li>
          <li>Use the <strong>Debug toolbar</strong> to step through code, inspect variables, and evaluate expressions</li>
        </ol>

        <p>When paused at a breakpoint, you can:</p>
        <ul>
          <li>Inspect the <code>page</code> object and its state in the Variables panel</li>
          <li>Evaluate Playwright expressions in the Debug Console (e.g., <code>await page.title()</code>)</li>
          <li>Step over, step into, or continue execution</li>
          <li>View the browser window to see the current state of the page</li>
        </ul>

        <div class="info-box"><strong>ℹ️ Note:</strong> When debugging, the browser runs in <strong>headed mode</strong> automatically so you can see what's happening on the page. The browser stays open while you're stepping through your test code.</div>

        <h3>Test Explorer Integration</h3>
        <p>The Playwright extension integrates with VS Code's built-in <strong>Test Explorer</strong>:</p>
        <ul>
          <li>Open the <strong>Testing</strong> sidebar (beaker icon) to see all your tests organized in a tree view</li>
          <li>Run individual tests, test files, or all tests at once</li>
          <li>See pass/fail status with green checkmarks and red X marks</li>
          <li>Filter tests by name or status</li>
          <li>Select which browser projects to run against (Chromium, Firefox, WebKit)</li>
        </ul>

        <h3>Code Generation with Codegen</h3>
        <p>Playwright includes a powerful <strong>code generation tool</strong> called <strong>Codegen</strong>. It opens a browser and records your interactions, then generates the corresponding test code automatically:</p>

        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Launch Codegen — opens a browser and a code recorder window
npx playwright codegen

# Start Codegen on a specific URL
npx playwright codegen https://example.com

# Generate code in a specific language
npx playwright codegen --target javascript https://example.com

# Generate code with a specific viewport size
npx playwright codegen --viewport-size=1280,720 https://example.com

# Emulate a mobile device
npx playwright codegen --device="iPhone 13"</code></pre>
        </div>

        <p>When Codegen is running:</p>
        <ol>
          <li>A <strong>browser window</strong> opens — interact with it as a normal user would</li>
          <li>A <strong>Playwright Inspector</strong> window shows the generated code in real-time</li>
          <li>Every click, type, and navigation is recorded as Playwright code</li>
          <li>Copy the generated code into your test file and refine it as needed</li>
        </ol>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Codegen is an excellent starting point, but generated tests often need refinement. Review the generated locators and replace fragile selectors with more resilient ones like <code>getByRole()</code> or <code>getByTestId()</code>. Use Codegen to understand the Playwright API, then write your own tests for production.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the official VS Code extension for Playwright?',
            options: [
              'Playwright Helper by Community',
              'Playwright Test for VSCode by Microsoft',
              'Playwright Runner by Playwright Team',
              'Browser Test Runner by VS Code'
            ],
            correct: 1,
            explanation: 'The official extension is "Playwright Test for VSCode" published by Microsoft (extension ID: ms-playwright.playwright). It provides integrated test running, debugging, and code generation features.'
          },
          {
            question: 'What does the command "npx playwright codegen" do?',
            options: [
              'Generates the playwright.config.js file',
              'Compiles TypeScript tests to JavaScript',
              'Opens a browser and records user interactions to generate test code',
              'Creates test stubs for all pages in a website'
            ],
            correct: 2,
            explanation: 'The "npx playwright codegen" command launches a browser and a Playwright Inspector window. As you interact with the browser, Playwright records your actions and generates corresponding test code in real-time.'
          }
        ]
      }
    }
  ]
});

// ==================== MODULE 2: Core Concepts ====================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-2',
  title: 'Module 2: Core Concepts',
  icon: '🧱',
  sections: [
    {
      id: 'browser-context-page',
      title: 'Browser, Context & Page',
      content: `
        <h2>Browser, Context & Page</h2>
        <p>Playwright's architecture is built around a three-level hierarchy: <strong>Browser → BrowserContext → Page</strong>. Understanding this hierarchy is essential to writing effective, isolated, and parallelizable tests.</p>

        <h3>The Three-Level Hierarchy</h3>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Hierarchy Diagram</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>┌───────────────────────────────────────────────────────┐
│                    BROWSER                            │
│          (Chromium / Firefox / WebKit)                 │
│                                                       │
│   ┌─────────────────────┐  ┌─────────────────────┐   │
│   │  BROWSER CONTEXT 1  │  │  BROWSER CONTEXT 2  │   │
│   │  (Isolated Session) │  │  (Isolated Session) │   │
│   │                     │  │                     │   │
│   │  ┌──────┐ ┌──────┐ │  │  ┌──────┐          │   │
│   │  │Page 1│ │Page 2│ │  │  │Page 3│          │   │
│   │  │(Tab) │ │(Tab) │ │  │  │(Tab) │          │   │
│   │  └──────┘ └──────┘ │  │  └──────┘          │   │
│   └─────────────────────┘  └─────────────────────┘   │
└───────────────────────────────────────────────────────┘</code></pre>
        </div>

        <h3>Browser</h3>
        <p>A <strong>Browser</strong> represents a running instance of a browser engine. Playwright supports three engines:</p>
        <ul>
          <li><strong>Chromium</strong> — powers Google Chrome and Microsoft Edge</li>
          <li><strong>Firefox</strong> — Mozilla's browser engine</li>
          <li><strong>WebKit</strong> — the engine that powers Apple Safari</li>
        </ul>
        <p>In most tests using the Playwright Test runner, you don't launch browsers manually — the framework handles it for you. However, when using the Playwright Library API directly, you can launch browsers yourself:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>const { chromium, firefox, webkit } = require('playwright');

// Launch different browser engines
const browser = await chromium.launch();     // Chromium
const browser2 = await firefox.launch();      // Firefox
const browser3 = await webkit.launch();       // WebKit

// Launch with options
const browser4 = await chromium.launch({
  headless: false,    // Show the browser window
  slowMo: 500,        // Slow down actions by 500ms (debugging)
});</code></pre>
        </div>

        <h3>BrowserContext</h3>
        <p>A <strong>BrowserContext</strong> is an isolated browser session — think of it as an <strong>incognito window</strong>. Each context has its own:</p>
        <ul>
          <li><strong>Cookies</strong> — no cookies are shared between contexts</li>
          <li><strong>Local storage</strong> — completely independent</li>
          <li><strong>Session storage</strong> — isolated per context</li>
          <li><strong>Cache</strong> — each context starts with a clean cache</li>
        </ul>

        <p>This isolation is what makes Playwright tests <strong>safe to run in parallel</strong>. Since contexts don't share any state, tests running in different contexts can never interfere with each other.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Create isolated browser contexts
const context1 = await browser.newContext();
const context2 = await browser.newContext();

// Contexts are completely isolated — like incognito windows
// context1's cookies, local storage, etc. are invisible to context2

// Create a context with specific options
const mobileContext = await browser.newContext({
  viewport: { width: 375, height: 667 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...',
  locale: 'fr-FR',
  geolocation: { longitude: 2.3522, latitude: 48.8566 },
  permissions: ['geolocation'],
});</code></pre>
        </div>

        <h3>Page</h3>
        <p>A <strong>Page</strong> represents a single tab (or popup window) within a browser context. This is the object you'll interact with most — it's where you navigate to URLs, find elements, click buttons, and make assertions.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Create a new page (tab) within a context
const page = await context.newPage();

// Navigate to a URL
await page.goto('https://example.com');

// Interact with elements on the page
await page.getByRole('link', { name: 'Learn More' }).click();

// Get the page title
const title = await page.title();
console.log(title); // "Example Domain"</code></pre>
        </div>

        <h3>How the Playwright Test Runner Manages This</h3>
        <p>When you use the <code>@playwright/test</code> runner, you don't have to manually create browsers, contexts, or pages. The test runner provides a fresh <code>page</code> fixture for each test automatically:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// Each test gets its own fresh page (and context) automatically!
test('test one', async ({ page }) => {
  // This page has a brand new context — no leftover state
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('Example Domain');
});

test('test two', async ({ page }) => {
  // This is a completely DIFFERENT page and context
  // No cookies, storage, or state from 'test one' leak here
  await page.goto('https://example.com/other');
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> The Playwright Test runner creates a new BrowserContext and Page for <em>each</em> test automatically. This is why you get perfect test isolation out of the box — no need for <code>beforeEach</code> cleanup routines.</div>

        <h3>Multi-User Scenario: Using Multiple Contexts</h3>
        <p>One powerful use case for contexts is testing <strong>multi-user scenarios</strong> — like a chat application where two users interact simultaneously:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('two users can chat in real-time', async ({ browser }) => {
  // Create two isolated contexts — simulating two users
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();

  // Each user gets their own page (tab)
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();

  // Alice logs in
  await alicePage.goto('https://chat-app.com/login');
  await alicePage.getByLabel('Username').fill('alice');
  await alicePage.getByLabel('Password').fill('password123');
  await alicePage.getByRole('button', { name: 'Login' }).click();

  // Bob logs in (completely separate session)
  await bobPage.goto('https://chat-app.com/login');
  await bobPage.getByLabel('Username').fill('bob');
  await bobPage.getByLabel('Password').fill('password456');
  await bobPage.getByRole('button', { name: 'Login' }).click();

  // Alice sends a message
  await alicePage.getByPlaceholder('Type a message...').fill('Hello Bob!');
  await alicePage.getByRole('button', { name: 'Send' }).click();

  // Bob should see Alice's message
  await expect(bobPage.getByText('Hello Bob!')).toBeVisible();

  // Cleanup
  await aliceContext.close();
  await bobContext.close();
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> When using the <code>{ browser }</code> fixture instead of <code>{ page }</code>, you get access to the shared browser instance and can create your own contexts. Use <code>{ page }</code> for single-user tests and <code>{ browser }</code> when you need multiple isolated sessions.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is a BrowserContext in Playwright analogous to?',
            options: [
              'A browser extension',
              'An incognito/private browsing window',
              'A browser bookmark',
              'A browser plugin'
            ],
            correct: 1,
            explanation: 'A BrowserContext is like an incognito (private) browsing window. Each context has its own cookies, local storage, session storage, and cache — completely isolated from other contexts. This makes them perfect for parallel test execution.'
          },
          {
            question: 'In the Playwright Test runner, how is test isolation achieved?',
            options: [
              'Tests share a single page and context for speed',
              'Each test gets a new BrowserContext and Page automatically',
              'Tests must manually clear cookies between runs',
              'The browser is restarted between every test'
            ],
            correct: 1,
            explanation: 'The Playwright Test runner automatically creates a fresh BrowserContext and Page for each test. This ensures tests are isolated — no state leaks between tests — without needing manual cleanup.'
          },
          {
            question: 'When testing multi-user scenarios (like a chat app), what Playwright feature should you use?',
            options: [
              'Open multiple tabs in the same context',
              'Run tests sequentially with login/logout',
              'Create multiple BrowserContexts, one per user',
              'Use iframes to simulate multiple users'
            ],
            correct: 2,
            explanation: 'For multi-user scenarios, create multiple BrowserContexts. Each context acts as an independent session with its own cookies and storage, perfectly simulating different users interacting with the application simultaneously.'
          }
        ]
      }
    },
    {
      id: 'locators',
      title: 'Locators & Selectors',
      content: `
        <h2>Locators & Selectors</h2>
        <p>Locators are the foundation of every Playwright test — they are how you find and reference elements on a page. Playwright provides a rich set of <strong>built-in locator strategies</strong> designed to be <strong>resilient</strong>, <strong>readable</strong>, and <strong>maintainable</strong>.</p>

        <h3>Why Resilient Locators Matter</h3>
        <p>A fragile locator breaks when the UI changes slightly. Consider these examples:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// ❌ FRAGILE: These locators break easily
page.locator('#app > div:nth-child(3) > form > button.btn-primary');
page.locator('.sc-bZQynM');           // auto-generated CSS class
page.locator('body > div > div > a'); // deeply nested path

// ✅ RESILIENT: These locators survive UI refactoring
page.getByRole('button', { name: 'Submit' });
page.getByTestId('submit-button');
page.getByLabel('Email address');</code></pre>
        </div>

        <p>Fragile locators (like CSS paths or auto-generated class names) break whenever a developer adds a new div, changes a class name, or reorders elements. Resilient locators target <strong>semantic meaning</strong> (roles, labels, text content) that rarely changes.</p>

        <h3>page.getByRole() — The Preferred Locator</h3>
        <p>The <code>getByRole()</code> locator targets elements by their <strong>ARIA role</strong> — the semantic meaning of the element. This is the <strong>most recommended</strong> locator because it reflects how assistive technologies and users perceive the page.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Buttons
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: /submit/i }).click(); // regex, case-insensitive

// Links
await page.getByRole('link', { name: 'Home' }).click();

// Headings
await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
await page.getByRole('heading', { level: 1 }); // h1 specifically

// Form elements
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('checkbox', { name: 'I agree' }).check();
await page.getByRole('combobox', { name: 'Country' }).selectOption('US');
await page.getByRole('radio', { name: 'Male' }).check();

// Navigation and structure
await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();

// Common ARIA roles:
// 'button', 'link', 'heading', 'textbox', 'checkbox', 'radio',
// 'combobox', 'dialog', 'alert', 'navigation', 'main', 'list',
// 'listitem', 'tab', 'tabpanel', 'row', 'cell', 'img'</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use <code>getByRole()</code> as your default locator strategy. It makes your tests accessible-aware — if your tests can find elements by role, it means screen readers can too!</div>

        <h3>page.getByText() — Find by Text Content</h3>
        <p>Finds elements that contain the specified text. Useful for paragraphs, spans, and other text-containing elements.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Exact text match
await page.getByText('Welcome to our website').click();

// Substring match (default behavior)
await page.getByText('Welcome').click();

// Exact match (strict)
await page.getByText('Welcome', { exact: true }).click();

// Case-insensitive regex match
await page.getByText(/welcome to our/i).click();

// Useful for verifying displayed content
await expect(page.getByText('Order #12345 confirmed')).toBeVisible();</code></pre>
        </div>

        <h3>page.getByTestId() — Data-TestId Attribute</h3>
        <p>Targets elements using a <code>data-testid</code> attribute. This is a good fallback when semantic locators aren't practical.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// HTML: &lt;button data-testid="submit-btn"&gt;Submit Order&lt;/button&gt;
await page.getByTestId('submit-btn').click();

// HTML: &lt;div data-testid="product-card"&gt;...&lt;/div&gt;
await expect(page.getByTestId('product-card')).toHaveCount(5);

// You can customize the test ID attribute in playwright.config.js:
// use: { testIdAttribute: 'data-cy' }  // for migrating from Cypress</code></pre>
        </div>

        <h3>page.getByLabel() — Form Labels</h3>
        <p>Finds form controls by their associated <code>&lt;label&gt;</code> text. Perfect for form testing.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// HTML: &lt;label for="email"&gt;Email Address&lt;/label&gt;
//       &lt;input id="email" type="email" /&gt;
await page.getByLabel('Email Address').fill('user@example.com');

// HTML: &lt;label&gt;Password &lt;input type="password" /&gt;&lt;/label&gt;
await page.getByLabel('Password').fill('secret123');

// Case-insensitive
await page.getByLabel(/email address/i).fill('test@test.com');</code></pre>
        </div>

        <h3>page.getByPlaceholder() — Placeholder Text</h3>
        <p>Finds input elements by their placeholder attribute.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// HTML: &lt;input placeholder="Search products..." /&gt;
await page.getByPlaceholder('Search products...').fill('laptop');

// HTML: &lt;input placeholder="Enter your name" /&gt;
await page.getByPlaceholder('Enter your name').fill('John Doe');</code></pre>
        </div>

        <h3>page.locator() — CSS and XPath Selectors</h3>
        <p>For cases where semantic locators aren't sufficient, you can use CSS selectors or XPath expressions. Use this as a <strong>last resort</strong>.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// CSS selectors
await page.locator('.product-card').first().click();
await page.locator('#main-content').isVisible();
await page.locator('input[type="email"]').fill('test@test.com');
await page.locator('div.card >> h3').allTextContents();

// XPath selectors (prefix with xpath=)
await page.locator('xpath=//button[@type="submit"]').click();
await page.locator('xpath=//div[contains(@class, "alert")]').isVisible();</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Avoid using CSS/XPath selectors unless absolutely necessary. They are more fragile than semantic locators and make tests harder to read and maintain. Prefer <code>getByRole()</code>, <code>getByTestId()</code>, <code>getByLabel()</code>, and other semantic methods.</div>

        <h3>Chaining and Filtering Locators</h3>
        <p>Playwright locators can be chained and filtered to narrow down to specific elements:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Chaining: find a button INSIDE a specific dialog
await page.getByRole('dialog')
  .getByRole('button', { name: 'Confirm' })
  .click();

// Filtering with filter(): narrow results by text or another locator
await page.getByRole('listitem')
  .filter({ hasText: 'Product A' })
  .getByRole('button', { name: 'Add to Cart' })
  .click();

// Filter by having a child locator
await page.getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: 'Featured' }) })
  .click();

// nth() — select by index (0-based)
await page.getByRole('listitem').nth(0).click();  // first item
await page.getByRole('listitem').nth(2).click();  // third item

// first() and last()
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').last().click();

// count() — get number of matching elements
const count = await page.getByRole('listitem').count();
console.log(\`Found \${count} items\`);</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Locators are <strong>lazy</strong> — they don't search the DOM when created. They only resolve elements when an action (like <code>click()</code>) or assertion (like <code>toBeVisible()</code>) is performed. This means you can create locators in advance and they'll always find the latest matching elements.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'Which locator strategy is considered the most recommended in Playwright?',
            options: [
              'page.locator() with CSS selectors',
              'page.getByTestId()',
              'page.getByRole()',
              'page.locator() with XPath'
            ],
            correct: 2,
            explanation: 'page.getByRole() is the most recommended locator strategy because it targets elements by their ARIA role — the semantic meaning of the element. This makes tests resilient to UI changes and also validates that your application is accessible.'
          },
          {
            question: 'What does page.getByLabel() target?',
            options: [
              'Elements with a specific CSS class',
              'Form controls by their associated label text',
              'Elements with an aria-label attribute only',
              'Elements inside a label HTML tag'
            ],
            correct: 1,
            explanation: 'page.getByLabel() finds form controls (inputs, selects, textareas) by their associated <label> text. It works with both "for" attribute associations and labels that wrap their inputs.'
          },
          {
            question: 'How do you select the third item in a list of matching locators?',
            options: [
              'page.getByRole("listitem")[2]',
              'page.getByRole("listitem").nth(2)',
              'page.getByRole("listitem").index(3)',
              'page.getByRole("listitem").get(2)'
            ],
            correct: 1,
            explanation: 'The nth() method selects an element by its 0-based index. So .nth(2) selects the third matching element. You can also use .first() and .last() for convenience.'
          },
          {
            question: 'When are Playwright locators resolved against the DOM?',
            options: [
              'Immediately when the locator is created',
              'When the page finishes loading',
              'Only when an action or assertion is performed on the locator',
              'On a fixed polling interval'
            ],
            correct: 2,
            explanation: 'Locators are lazy — they don\'t query the DOM when created. They only resolve elements when an action (like click()) or assertion (like toBeVisible()) is performed. This means locators always find the latest matching elements at the time of use.'
          }
        ]
      }
    },
    {
      id: 'auto-waiting',
      title: 'Auto-Waiting Mechanism',
      content: `
        <h2>Auto-Waiting Mechanism</h2>
        <p>One of Playwright's most powerful features is its <strong>auto-waiting mechanism</strong>. Before performing any action on an element, Playwright automatically waits for the element to be in a suitable state. This eliminates the most common source of test flakiness — timing issues.</p>

        <h3>How Auto-Waiting Works</h3>
        <p>When you write a command like <code>await page.getByRole('button', { name: 'Submit' }).click()</code>, Playwright doesn't just blindly try to click the button. Instead, it performs a series of <strong>actionability checks</strong> and waits until all checks pass:</p>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Auto-Wait Flow</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>   page.getByRole('button', { name: 'Submit' }).click()
                        │
                        ▼
              ┌──────────────────┐
              │  Is it ATTACHED  │──── No ──→ Wait & retry...
              │  to the DOM?     │
              └────────┬─────────┘
                       │ Yes
                       ▼
              ┌──────────────────┐
              │  Is it VISIBLE?  │──── No ──→ Wait & retry...
              │                  │
              └────────┬─────────┘
                       │ Yes
                       ▼
              ┌──────────────────┐
              │  Is it STABLE?   │──── No ──→ Wait & retry...
              │  (not animating) │
              └────────┬─────────┘
                       │ Yes
                       ▼
              ┌──────────────────┐
              │  Is it ENABLED?  │──── No ──→ Wait & retry...
              │  (not disabled)  │
              └────────┬─────────┘
                       │ Yes
                       ▼
              ┌──────────────────┐
              │  Does it RECEIVE │──── No ──→ Wait & retry...
              │  EVENTS? (not    │
              │  covered by      │
              │  another element)│
              └────────┬─────────┘
                       │ Yes
                       ▼
                ✅ Perform Click!</code></pre>
        </div>

        <h3>Actionability Checks in Detail</h3>
        <p>Different actions require different checks. Here's a comprehensive breakdown:</p>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Actionability Check Matrix</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>Action          │ Attached │ Visible │ Stable │ Enabled │ Receives Events
────────────────┼──────────┼─────────┼────────┼─────────┼─────────────────
click()         │    ✅    │   ✅    │   ✅   │   ✅    │       ✅
dblclick()      │    ✅    │   ✅    │   ✅   │   ✅    │       ✅
hover()         │    ✅    │   ✅    │   ✅   │         │       ✅
fill()          │    ✅    │   ✅    │        │   ✅    │       ✅
check()         │    ✅    │   ✅    │   ✅   │   ✅    │       ✅
selectOption()  │    ✅    │   ✅    │        │   ✅    │       ✅
press()         │    ✅    │         │        │         │
isVisible()     │          │         │        │         │
textContent()   │    ✅    │         │        │         │</code></pre>
        </div>

        <p>Let's explain each check:</p>
        <ul>
          <li><strong>Attached</strong>: The element exists in the DOM (has been rendered)</li>
          <li><strong>Visible</strong>: The element has non-zero dimensions, is not <code>display: none</code> or <code>visibility: hidden</code>, and has <code>opacity > 0</code></li>
          <li><strong>Stable</strong>: The element has finished animating — its bounding box hasn't changed between two consecutive animation frames</li>
          <li><strong>Enabled</strong>: The element is not disabled (doesn't have a <code>disabled</code> attribute or <code>aria-disabled="true"</code>)</li>
          <li><strong>Receives Events</strong>: The element is not covered by another element (like an overlay or modal) at the action point</li>
        </ul>

        <h3>No More Explicit Waits!</h3>
        <p>In traditional frameworks like Selenium, you constantly need to write explicit waits. Playwright eliminates this entirely:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// ❌ SELENIUM APPROACH: Explicit waits everywhere
const { By, until } = require('selenium-webdriver');

// Wait for element to be present
await driver.wait(until.elementLocated(By.id('submit-btn')), 10000);
// Wait for it to be visible
const btn = await driver.findElement(By.id('submit-btn'));
await driver.wait(until.elementIsVisible(btn), 10000);
// Wait for it to be enabled
await driver.wait(until.elementIsEnabled(btn), 10000);
// NOW click it
await btn.click();

// ✅ PLAYWRIGHT APPROACH: Just perform the action
await page.getByRole('button', { name: 'Submit' }).click();
// Playwright auto-waits for: attached, visible, stable, enabled, receives events
// ALL of those waits happen automatically!</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> If you find yourself writing manual waits like <code>await page.waitForTimeout(3000)</code>, you're probably doing something wrong. There's almost always a better Playwright pattern — like waiting for a specific element to appear or a network request to complete.</div>

        <h3>Custom Timeouts</h3>
        <p>By default, Playwright waits up to <strong>30 seconds</strong> for actionability checks (configurable in <code>playwright.config.js</code>). You can customize the timeout per action:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Default: waits up to 30 seconds (from config)
await page.getByRole('button', { name: 'Submit' }).click();

// Custom timeout: wait up to 10 seconds for this specific action
await page.getByRole('button', { name: 'Submit' }).click({ timeout: 10000 });

// Custom timeout: wait up to 60 seconds (for slow operations)
await page.getByRole('button', { name: 'Process' }).click({ timeout: 60000 });

// Set default timeout globally in playwright.config.js:
// export default defineConfig({
//   use: {
//     actionTimeout: 15000,  // 15 seconds for actions
//   },
//   expect: {
//     timeout: 10000,        // 10 seconds for assertions
//   },
// });</code></pre>
        </div>

        <h3>Waiting for Specific Conditions</h3>
        <p>While auto-waiting covers most cases, sometimes you need to wait for specific conditions before proceeding:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Wait for navigation to complete
await page.waitForURL('**/dashboard');

// Wait for a network response
await page.waitForResponse(resp =>
  resp.url().includes('/api/data') && resp.status() === 200
);

// Wait for an element state
await page.getByTestId('loading-spinner').waitFor({ state: 'hidden' });
await page.getByTestId('results').waitFor({ state: 'visible' });

// Wait for load state
await page.waitForLoadState('networkidle');

// Combine navigation with action using Promise.all
const [response] = await Promise.all([
  page.waitForResponse('**/api/submit'),
  page.getByRole('button', { name: 'Submit' }).click(),
]);</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Avoid using <code>page.waitForTimeout()</code> (a fixed time delay). It's unreliable — too short on slow machines, too slow on fast ones. Use condition-based waits like <code>waitFor()</code>, <code>waitForURL()</code>, or <code>waitForResponse()</code> instead. The only acceptable use of <code>waitForTimeout</code> is during debugging.</div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Auto-waiting applies to <strong>actions</strong> (click, fill, etc.) and <strong>web-first assertions</strong> (expect(locator).toBeVisible()). Methods that just query the DOM snapshot (like <code>textContent()</code>, <code>isVisible()</code>) return immediately and do NOT auto-wait.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'Which of the following is NOT one of Playwright\'s actionability checks before performing a click?',
            options: [
              'Element is visible',
              'Element is stable (not animating)',
              'Element has a valid CSS class',
              'Element receives events (not covered by another element)'
            ],
            correct: 2,
            explanation: 'Playwright checks that an element is attached, visible, stable, enabled, and receives events before clicking. It does NOT check for CSS classes — those are irrelevant to whether an element can be interacted with.'
          },
          {
            question: 'What is the default timeout for Playwright\'s auto-waiting mechanism?',
            options: [
              '5 seconds',
              '10 seconds',
              '30 seconds',
              '60 seconds'
            ],
            correct: 2,
            explanation: 'Playwright\'s default timeout for actionability checks is 30 seconds. This can be configured globally in playwright.config.js using the actionTimeout setting, or per-action using the timeout option.'
          },
          {
            question: 'Why should you avoid using page.waitForTimeout() in tests?',
            options: [
              'It\'s deprecated and will be removed in future versions',
              'It\'s a fixed delay that\'s unreliable — too short on slow machines, too slow on fast ones',
              'It causes the browser to crash',
              'It only works with Chromium, not Firefox or WebKit'
            ],
            correct: 1,
            explanation: 'page.waitForTimeout() is a fixed time delay. It\'s unreliable because it may be too short on slow CI machines (causing failures) or unnecessarily long on fast machines (wasting time). Always use condition-based waits like waitForURL(), waitForResponse(), or element.waitFor() instead.'
          }
        ]
      }
    }
  ]
});

// ==================== MODULE 3: Actions & Assertions ====================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-3',
  title: 'Module 3: Actions & Assertions',
  icon: '⚡',
  sections: [
    {
      id: 'element-actions',
      title: 'Interacting with Elements',
      content: `
        <h2>Interacting with Elements</h2>
        <p>Playwright provides a comprehensive set of methods for interacting with web page elements. Every action method benefits from <strong>auto-waiting</strong> — Playwright will wait for the element to be actionable before performing the interaction.</p>

        <h3>Quick Reference: Common Actions Cheat Sheet</h3>

        <div class="code-block" data-language="text">
          <div class="code-header"><span>Actions Cheat Sheet</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>Action               │ Method                          │ Description
─────────────────────┼─────────────────────────────────┼──────────────────────────
Type into input      │ .fill('text')                   │ Clear + type text
Click element        │ .click()                        │ Single click
Double click         │ .dblclick()                     │ Double click
Right click          │ .click({ button: 'right' })     │ Context menu click
Hover                │ .hover()                        │ Mouse hover
Check checkbox       │ .check()                        │ Check a checkbox
Uncheck checkbox     │ .uncheck()                      │ Uncheck a checkbox
Select dropdown      │ .selectOption('value')          │ Select option
Upload file          │ .setInputFiles('path')          │ File upload
Press key            │ .press('Enter')                 │ Keyboard key press
Type text slowly     │ .pressSequentially('text')      │ Key-by-key typing
Focus element        │ .focus()                        │ Focus an element
Clear input          │ .clear()                        │ Clear input value
Drag and drop        │ .dragTo(target)                 │ Drag to target</code></pre>
        </div>

        <h3>fill() — Text Input</h3>
        <p>The <code>fill()</code> method is the primary way to enter text into input fields and textareas. It <strong>clears any existing content first</strong>, then types the new value.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Fill a text input (clears existing text first)
await page.getByLabel('Username').fill('john_doe');

// Fill a password field
await page.getByLabel('Password').fill('MySecureP@ss123');

// Fill a textarea
await page.getByLabel('Description').fill('This is a long description\\nthat spans multiple lines.');

// Fill a search box
await page.getByPlaceholder('Search...').fill('Playwright tutorial');

// Clear an input (fill with empty string)
await page.getByLabel('Username').fill('');
// Or use the clear() method
await page.getByLabel('Username').clear();</code></pre>
        </div>

        <h3>click(), dblclick(), and hover()</h3>
        <p>Mouse interaction methods for clicking and hovering over elements:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Standard click
await page.getByRole('button', { name: 'Save' }).click();

// Double click (e.g., to select a word)
await page.getByText('Click me twice').dblclick();

// Right click (context menu)
await page.getByText('Right-click me').click({ button: 'right' });

// Click with modifier keys
await page.getByRole('link', { name: 'Open' }).click({ modifiers: ['Control'] }); // Ctrl+Click
await page.getByRole('link', { name: 'Open' }).click({ modifiers: ['Shift'] });   // Shift+Click

// Click at a specific position within the element
await page.getByTestId('canvas').click({ position: { x: 100, y: 200 } });

// Force click (skip actionability checks — use sparingly!)
await page.getByRole('button', { name: 'Hidden Button' }).click({ force: true });

// Hover over an element (e.g., to reveal a dropdown menu)
await page.getByText('Menu').hover();
await page.getByRole('menuitem', { name: 'Settings' }).click();</code></pre>
        </div>

        <h3>check() and uncheck() — Checkboxes & Radio Buttons</h3>
        <p>Dedicated methods for toggling checkboxes and radio buttons. These are <strong>idempotent</strong> — calling <code>check()</code> on an already-checked box does nothing, preventing accidental unchecking.</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Check a checkbox (no-op if already checked)
await page.getByLabel('I agree to the terms').check();

// Uncheck a checkbox (no-op if already unchecked)
await page.getByLabel('Subscribe to newsletter').uncheck();

// Check a radio button
await page.getByLabel('Express Shipping').check();

// Verify checkbox state
await expect(page.getByLabel('I agree to the terms')).toBeChecked();
await expect(page.getByLabel('Newsletter')).not.toBeChecked();</code></pre>
        </div>

        <h3>selectOption() — Dropdown Menus</h3>
        <p>Select one or more options from a <code>&lt;select&gt;</code> dropdown:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Select by value attribute
await page.getByLabel('Country').selectOption('us');

// Select by visible label text
await page.getByLabel('Country').selectOption({ label: 'United States' });

// Select by index (0-based)
await page.getByLabel('Country').selectOption({ index: 2 });

// Select multiple options (for multi-select dropdowns)
await page.getByLabel('Colors').selectOption(['red', 'blue', 'green']);

// Deselect all options
await page.getByLabel('Colors').selectOption([]);</code></pre>
        </div>

        <h3>setInputFiles() — File Uploads</h3>
        <p>Upload files to <code>&lt;input type="file"&gt;</code> elements:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Upload a single file
await page.getByLabel('Upload Resume').setInputFiles('path/to/resume.pdf');

// Upload multiple files
await page.getByLabel('Upload Photos').setInputFiles([
  'path/to/photo1.jpg',
  'path/to/photo2.jpg',
]);

// Clear file selection
await page.getByLabel('Upload Resume').setInputFiles([]);

// Create a file from a buffer (without a real file on disk)
await page.getByLabel('Upload').setInputFiles({
  name: 'test.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('Hello World'),
});</code></pre>
        </div>

        <h3>press() — Keyboard Keys</h3>
        <p>Simulate keyboard key presses on a focused element:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Press Enter (e.g., submit a search)
await page.getByPlaceholder('Search...').fill('Playwright');
await page.getByPlaceholder('Search...').press('Enter');

// Press Tab to move focus
await page.getByLabel('First Name').press('Tab');

// Press Escape to close a dialog
await page.getByRole('dialog').press('Escape');

// Keyboard shortcuts with modifiers
await page.press('body', 'Control+a');     // Select all
await page.press('body', 'Control+c');     // Copy
await page.press('body', 'Control+v');     // Paste
await page.press('body', 'Control+z');     // Undo

// Arrow keys for navigation
await page.getByRole('listbox').press('ArrowDown');
await page.getByRole('listbox').press('ArrowUp');</code></pre>
        </div>

        <h3>pressSequentially() vs fill() — What's the Difference?</h3>
        <p>Understanding when to use each method is important:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// fill() — Sets the value directly (like pasting)
// ✅ Fast, reliable, clears existing content
// ✅ Use for most form filling scenarios
await page.getByLabel('Email').fill('user@example.com');

// pressSequentially() — Types character by character
// ✅ Triggers keydown, keypress, keyup for EACH character
// ✅ Use when the app responds to individual keystrokes
//    (e.g., autocomplete, live search, character counters)
await page.getByPlaceholder('Search').pressSequentially('play', { delay: 100 });

// Example: Testing an autocomplete dropdown
await page.getByPlaceholder('Search city...').pressSequentially('New Y', { delay: 200 });
// The app shows suggestions after each keystroke
await page.getByRole('option', { name: 'New York' }).click();</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use <code>fill()</code> for 99% of text input scenarios. Only use <code>pressSequentially()</code> when the application specifically responds to individual keystroke events, like autocomplete inputs or live search fields. Note that <code>type()</code> is deprecated in favor of <code>pressSequentially()</code>.</div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> The <code>type()</code> method is deprecated. Use <code>pressSequentially()</code> instead for character-by-character typing, or <code>fill()</code> for setting input values directly.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does the fill() method do before entering new text into an input field?',
            options: [
              'Nothing — it appends the text to existing content',
              'It clears any existing content first, then enters the new text',
              'It selects all existing text and highlights it',
              'It focuses the input without clearing it'
            ],
            correct: 1,
            explanation: 'The fill() method first clears any existing content in the input field, then enters the new text. This ensures the field contains exactly what you specified, regardless of what was there before.'
          },
          {
            question: 'What is the difference between fill() and pressSequentially()?',
            options: [
              'fill() is slower because it types character by character',
              'pressSequentially() clears existing content while fill() does not',
              'fill() sets the value directly (like pasting), while pressSequentially() types character by character, triggering individual key events',
              'There is no difference — they are aliases'
            ],
            correct: 2,
            explanation: 'fill() sets the input value directly (similar to pasting), which is fast and reliable. pressSequentially() simulates actual keystrokes one by one, triggering keydown/keypress/keyup events for each character. Use pressSequentially() when the app responds to individual keystrokes (like autocomplete).'
          },
          {
            question: 'Why is check() preferred over click() for checkboxes?',
            options: [
              'check() is faster than click()',
              'check() works across all browsers while click() only works on Chromium',
              'check() is idempotent — it does nothing if already checked, preventing accidental unchecking',
              'check() generates better test reports'
            ],
            correct: 2,
            explanation: 'check() is idempotent: calling it on an already-checked checkbox does nothing. If you used click() instead, clicking a checked checkbox would uncheck it — potentially causing hard-to-debug test failures. Use check() and uncheck() for explicit, predictable behavior.'
          }
        ]
      }
    },
    {
      id: 'web-first-assertions',
      title: 'Web-First Assertions',
      content: `
        <h2>Web-First Assertions</h2>
        <p>Playwright's <strong>web-first assertions</strong> are designed specifically for testing dynamic web applications. Unlike traditional assertions that check values once and fail immediately, web-first assertions <strong>automatically retry</strong> until the condition is met or a timeout is reached. This is another key reason Playwright tests are less flaky.</p>

        <h3>What Makes Them "Web-First"?</h3>
        <p>Web applications are inherently asynchronous — elements appear after API calls complete, text changes after state updates, and pages navigate after form submissions. Traditional assertions don't account for this:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// ❌ TRADITIONAL ASSERTION (e.g., Node.js assert)
// Checks ONCE. If the element isn't visible yet, test fails immediately.
const isVisible = await page.getByText('Success').isVisible();
assert.strictEqual(isVisible, true); // Fails if element isn't visible YET

// ✅ PLAYWRIGHT WEB-FIRST ASSERTION
// Automatically retries until the element becomes visible (up to timeout)
await expect(page.getByText('Success')).toBeVisible();
// Keeps checking → is it visible now? No... now? No... now? YES! ✅ Pass!</code></pre>
        </div>

        <h3>The expect() Function</h3>
        <p>All web-first assertions start with the <code>expect()</code> function imported from <code>@playwright/test</code>:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('example with assertions', async ({ page }) => {
  await page.goto('https://example.com');

  // expect() wraps a locator and provides assertion methods
  await expect(page.getByRole('heading')).toBeVisible();
  await expect(page.getByRole('heading')).toHaveText('Example Domain');
});</code></pre>
        </div>

        <h3>Common Locator Assertions</h3>

        <h4>toBeVisible() / toBeHidden()</h4>
        <p>Check whether an element is visible or hidden on the page:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert element is visible
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

// Assert element is hidden (or not in the DOM)
await expect(page.getByTestId('loading-spinner')).toBeHidden();

// Assert element is NOT visible (equivalent to toBeHidden in most cases)
await expect(page.getByTestId('error-message')).not.toBeVisible();</code></pre>
        </div>

        <h4>toHaveText() / toContainText()</h4>
        <p>Assert on the text content of elements:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Exact text match (trims whitespace)
await expect(page.getByTestId('greeting')).toHaveText('Hello, John!');

// Regex match
await expect(page.getByTestId('greeting')).toHaveText(/hello/i);

// Contains text (substring match)
await expect(page.getByTestId('message')).toContainText('successfully');

// Assert text of multiple elements at once
await expect(page.getByRole('listitem')).toHaveText([
  'Item 1',
  'Item 2',
  'Item 3',
]);</code></pre>
        </div>

        <h4>toHaveValue()</h4>
        <p>Assert the current value of form inputs:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert an input has a specific value
await page.getByLabel('Email').fill('test@example.com');
await expect(page.getByLabel('Email')).toHaveValue('test@example.com');

// Regex match on value
await expect(page.getByLabel('Email')).toHaveValue(/@example\\.com$/);

// Assert a select dropdown has a specific selected value
await expect(page.getByLabel('Country')).toHaveValue('us');</code></pre>
        </div>

        <h4>toBeEnabled() / toBeDisabled()</h4>
        <p>Check whether form elements are enabled or disabled:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert a button is enabled (clickable)
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

// Assert a button is disabled
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

// Common pattern: verify button enables after filling required fields
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Password').fill('password123');
await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();</code></pre>
        </div>

        <h4>toHaveCount()</h4>
        <p>Assert the number of matching elements:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert there are exactly 5 items in a list
await expect(page.getByRole('listitem')).toHaveCount(5);

// Assert a search returns results
await page.getByPlaceholder('Search').fill('Playwright');
await page.getByPlaceholder('Search').press('Enter');
await expect(page.getByTestId('search-result')).toHaveCount(10);

// Assert no error messages are present
await expect(page.getByRole('alert')).toHaveCount(0);</code></pre>
        </div>

        <h3>Page-Level Assertions</h3>

        <h4>toHaveURL() / toHaveTitle()</h4>
        <p>Assert on page navigation state and metadata:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert current URL (exact match)
await expect(page).toHaveURL('https://example.com/dashboard');

// Assert URL with regex (partial match)
await expect(page).toHaveURL(/\\/dashboard/);

// Assert URL contains specific path
await expect(page).toHaveURL(/.*\\/products\\/\\d+/); // e.g., /products/123

// Assert page title
await expect(page).toHaveTitle('Dashboard - My App');

// Assert page title with regex
await expect(page).toHaveTitle(/Dashboard/);</code></pre>
        </div>

        <h3>Soft Assertions</h3>
        <p><strong>Soft assertions</strong> don't immediately stop the test on failure. Instead, they collect all failures and report them at the end. This is useful when you want to check multiple conditions and see all failures at once:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('verify user profile page', async ({ page }) => {
  await page.goto('https://example.com/profile');

  // Soft assertions — test continues even if one fails
  await expect.soft(page.getByTestId('username')).toHaveText('john_doe');
  await expect.soft(page.getByTestId('email')).toHaveText('john@example.com');
  await expect.soft(page.getByTestId('role')).toHaveText('Administrator');
  await expect.soft(page.getByTestId('status')).toHaveText('Active');

  // If any soft assertion failed, the test is marked as failed
  // but ALL assertions were checked, giving you a complete picture

  // ⚠️ Be careful: don't navigate away or do destructive actions
  // after a soft assertion failure, as the page state may be unexpected
});</code></pre>
        </div>

        <h3>Negation with .not</h3>
        <p>Any assertion can be negated using <code>.not</code>:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Assert element is NOT visible
await expect(page.getByText('Error')).not.toBeVisible();

// Assert element does NOT contain text
await expect(page.getByTestId('status')).not.toContainText('Loading');

// Assert URL is NOT the login page (user is authenticated)
await expect(page).not.toHaveURL(/\\/login/);

// Assert button is NOT disabled
await expect(page.getByRole('button', { name: 'Submit' })).not.toBeDisabled();

// Assert list is not empty
await expect(page.getByRole('listitem')).not.toHaveCount(0);</code></pre>
        </div>

        <h3>Custom Timeouts for Assertions</h3>
        <p>By default, assertions retry for <strong>5 seconds</strong> (configurable). You can override this per assertion:</p>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Default timeout (5 seconds from config)
await expect(page.getByText('Welcome')).toBeVisible();

// Custom timeout: wait up to 10 seconds
await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 });

// Custom timeout: wait up to 30 seconds for slow operations
await expect(page.getByTestId('report')).toHaveText('Complete', { timeout: 30000 });

// Configure default assertion timeout globally in playwright.config.js:
// export default defineConfig({
//   expect: {
//     timeout: 10000,  // 10 seconds for all assertions
//   },
// });</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Web-first assertions with <code>expect(locator)</code> are preferred over manual checks like <code>const isVisible = await locator.isVisible()</code> followed by a traditional assert. The web-first version auto-retries and gives better error messages with screenshots on failure.</div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Playwright also supports assertions on <strong>API responses</strong> with <code>expect(response)</code> and on <strong>generic values</strong> with <code>expect(value)</code> (like Jest assertions). Web-first assertions only apply when you pass a <strong>locator</strong> or <strong>page</strong> to <code>expect()</code>.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What makes Playwright\'s web-first assertions different from traditional assertions?',
            options: [
              'They are faster to execute',
              'They automatically retry until the condition is met or timeout is reached',
              'They only work in headless mode',
              'They don\'t require importing any modules'
            ],
            correct: 1,
            explanation: 'Web-first assertions automatically retry the check until the condition is met or the timeout expires. Traditional assertions check once and fail immediately. This retry behavior accounts for the asynchronous nature of web applications.'
          },
          {
            question: 'What is the purpose of expect.soft() in Playwright?',
            options: [
              'It makes assertions run faster by skipping retries',
              'It collects failures without stopping the test, reporting all failures at the end',
              'It provides softer, more lenient matching criteria',
              'It automatically takes screenshots on failure'
            ],
            correct: 1,
            explanation: 'Soft assertions (expect.soft()) don\'t immediately stop the test on failure. Instead, they let the test continue and collect all assertion failures, reporting them together at the end. This is useful when you want to verify multiple conditions and see the complete picture.'
          },
          {
            question: 'What is the default retry timeout for Playwright web-first assertions?',
            options: [
              '1 second',
              '5 seconds',
              '10 seconds',
              '30 seconds'
            ],
            correct: 1,
            explanation: 'By default, web-first assertions retry for 5 seconds before failing. This can be configured globally in playwright.config.js using the expect.timeout setting, or per-assertion using the { timeout: ms } option.'
          }
        ]
      }
    }
  ]
});
