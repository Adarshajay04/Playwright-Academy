// Modules 9-13: Component Testing, Accessibility, Mobile, Parallel, Best Practices

// ============================================================
// MODULE 9: Component Testing
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-9',
  title: 'Module 9: Component Testing',
  icon: '🧩',
  sections: [
    {
      id: 'component-testing-intro',
      title: 'Component Testing Overview',
      content: `
        <h2>Component Testing Overview</h2>
        <p>Playwright Component Testing allows you to test individual UI components in isolation, directly inside a real browser. Unlike traditional end-to-end (E2E) testing, which tests an entire application flow from start to finish, component testing focuses on verifying the behavior and rendering of a single component without the overhead of spinning up a full application server.</p>

        <h3>Component Testing vs. E2E Testing</h3>
        <p>Understanding when to use component testing versus E2E testing is key to building a robust test strategy:</p>
        <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
          <thead>
            <tr style="background:var(--bg-tertiary);">
              <th style="padding:10px; text-align:left; border:1px solid var(--border-color);">Aspect</th>
              <th style="padding:10px; text-align:left; border:1px solid var(--border-color);">Component Testing</th>
              <th style="padding:10px; text-align:left; border:1px solid var(--border-color);">E2E Testing</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding:8px; border:1px solid var(--border-color);"><strong>Scope</strong></td><td style="padding:8px; border:1px solid var(--border-color);">Single component</td><td style="padding:8px; border:1px solid var(--border-color);">Full application</td></tr>
            <tr><td style="padding:8px; border:1px solid var(--border-color);"><strong>Speed</strong></td><td style="padding:8px; border:1px solid var(--border-color);">Fast — no server needed</td><td style="padding:8px; border:1px solid var(--border-color);">Slower — full app + backend</td></tr>
            <tr><td style="padding:8px; border:1px solid var(--border-color);"><strong>Dependencies</strong></td><td style="padding:8px; border:1px solid var(--border-color);">Mocked/minimal</td><td style="padding:8px; border:1px solid var(--border-color);">Real services</td></tr>
            <tr><td style="padding:8px; border:1px solid var(--border-color);"><strong>Isolation</strong></td><td style="padding:8px; border:1px solid var(--border-color);">High</td><td style="padding:8px; border:1px solid var(--border-color);">Low</td></tr>
            <tr><td style="padding:8px; border:1px solid var(--border-color);"><strong>Confidence</strong></td><td style="padding:8px; border:1px solid var(--border-color);">Component-level</td><td style="padding:8px; border:1px solid var(--border-color);">System-level</td></tr>
          </tbody>
        </table>

        <h3>Supported Frameworks</h3>
        <p>Playwright supports component testing for the most popular front-end frameworks:</p>
        <ul>
          <li><strong>React</strong> — Full support for functional and class components, hooks, and context</li>
          <li><strong>Vue</strong> — Supports Vue 2 and Vue 3 components with slots and provide/inject</li>
          <li><strong>Svelte</strong> — Test Svelte components with props, events, and slots</li>
          <li><strong>Solid</strong> — Experimental support for SolidJS components</li>
        </ul>

        <div class="info-box"><strong>ℹ️ Note:</strong> Component testing is currently marked as experimental in Playwright. The API may evolve in future releases, but it is stable enough for production use in many teams.</div>

        <h3>Setting Up Component Testing</h3>
        <p>The easiest way to get started is using the Playwright component testing initializer. This sets up the necessary configuration files and installs dependencies automatically:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Initialize component testing in your existing project
npm init playwright@latest -- --ct

# This creates:
# - playwright-ct.config.ts (or .js)
# - playwright/index.html — the host page for mounting components
# - playwright/index.ts — where you register global styles/scripts</code></pre>
        </div>

        <p>After running the initializer, your project structure will include these new files. The <code>playwright/index.html</code> serves as the host page where your components will be mounted during testing, and <code>playwright/index.ts</code> is where you can import global CSS, configure context providers, or set up anything your components need.</p>

        <h3>The playwright-ct.config Configuration</h3>
        <p>The component testing configuration extends the standard Playwright config but includes a <code>ctViteConfig</code> property for customizing the Vite bundler used internally:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright-ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './tests/components',
  snapshotDir: './tests/snapshots',
  timeout: 10_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
    // Vite config for bundling components
    ctViteConfig: {
      resolve: {
        alias: {
          '@': './src',
        },
      },
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});</code></pre>
        </div>

        <h3>Mounting Components in a Real Browser</h3>
        <p>The key concept of Playwright component testing is <strong>mounting</strong>. Unlike unit-testing libraries that use a virtual DOM (like Testing Library with jsdom), Playwright mounts your component inside a real browser. This means you get accurate rendering, real browser APIs, and the same test APIs (locators, assertions, actions) you already know from E2E testing.</p>

        <p>Here is a full example of mounting a React component, interacting with it, and asserting the result:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/components/Counter.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import Counter from '../../src/components/Counter';

test.describe('Counter Component', () => {
  test('renders with initial count of 0', async ({ mount }) => {
    // Mount the component in a real browser
    const component = await mount(&lt;Counter /&gt;);

    // Assert the initial display
    await expect(component.getByTestId('count')).toHaveText('0');
  });

  test('increments count when button is clicked', async ({ mount }) => {
    const component = await mount(&lt;Counter /&gt;);

    // Click the increment button
    await component.getByRole('button', { name: 'Increment' }).click();
    await component.getByRole('button', { name: 'Increment' }).click();

    // Assert count was updated
    await expect(component.getByTestId('count')).toHaveText('2');
  });

  test('decrements count when decrement button is clicked', async ({ mount }) => {
    const component = await mount(&lt;Counter initialCount={5} /&gt;);

    await component.getByRole('button', { name: 'Decrement' }).click();

    await expect(component.getByTestId('count')).toHaveText('4');
  });

  test('displays the correct label', async ({ mount }) => {
    const component = await mount(
      &lt;Counter label="Items in cart" /&gt;
    );

    await expect(component.getByText('Items in cart')).toBeVisible();
  });
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> The \`mount\` fixture returns a Playwright \`Locator\` pointing to the mounted component, so you can use all standard locator methods like \`getByRole\`, \`getByText\`, \`click()\`, and Playwright assertions on it.</div>

        <h3>Running Component Tests</h3>
        <p>Component tests are run using the Playwright test runner, but you need to specify the component testing config file:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Run all component tests
npx playwright test -c playwright-ct.config.ts

# Run a specific test file
npx playwright test -c playwright-ct.config.ts tests/components/Counter.spec.tsx

# Run in UI mode for debugging
npx playwright test -c playwright-ct.config.ts --ui</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Do not mix the component testing config with your regular E2E config. Keep them as separate files (\`playwright-ct.config.ts\` and \`playwright.config.ts\`) and run them with separate commands.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What command initializes Playwright component testing in a project?',
            options: [
              'npm init playwright@latest -- --ct',
              'npx playwright install --ct',
              'npm install @playwright/component-testing',
              'npx create-playwright --component'
            ],
            correct: 0,
            explanation: 'The command npm init playwright@latest -- --ct initializes Playwright component testing, creating the necessary config files and index.html host page.'
          },
          {
            question: 'What makes Playwright component testing different from libraries like Testing Library with jsdom?',
            options: [
              'It uses a virtual DOM for faster rendering',
              'It only supports React components',
              'It mounts components inside a real browser',
              'It does not support user interactions'
            ],
            correct: 2,
            explanation: 'Playwright component testing mounts components in a real browser, giving you accurate rendering, real browser APIs, and the full Playwright test API.'
          },
          {
            question: 'Which frameworks does Playwright component testing support?',
            options: [
              'React only',
              'React, Vue, Svelte, and Solid',
              'React and Angular',
              'Vue and Svelte only'
            ],
            correct: 1,
            explanation: 'Playwright supports component testing for React, Vue, Svelte, and Solid (Solid support is experimental).'
          }
        ]
      }
    },
    {
      id: 'component-testing-patterns',
      title: 'Component Testing Patterns',
      content: `
        <h2>Component Testing Patterns</h2>
        <p>Beyond simple mounting, Playwright component testing supports advanced patterns for testing real-world components. This section covers patterns for testing props, slots, events, context providers, and more — giving you the tools to thoroughly verify component behavior in isolation.</p>

        <h3>Testing with Props</h3>
        <p>Props are the primary mechanism for passing data into components. You can pass any props during mounting and verify the component renders correctly:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// React component test with props
import { test, expect } from '@playwright/experimental-ct-react';
import UserCard from '../../src/components/UserCard';

test('renders user card with all props', async ({ mount }) => {
  const component = await mount(
    &lt;UserCard
      name="Jane Doe"
      email="jane@example.com"
      role="Admin"
      avatar="/images/jane.png"
      isActive={true}
    /&gt;
  );

  await expect(component.getByText('Jane Doe')).toBeVisible();
  await expect(component.getByText('jane@example.com')).toBeVisible();
  await expect(component.getByText('Admin')).toBeVisible();
  await expect(component.locator('img')).toHaveAttribute('src', '/images/jane.png');
  await expect(component.locator('.status-badge')).toHaveText('Active');
});

test('renders inactive state when isActive is false', async ({ mount }) => {
  const component = await mount(
    &lt;UserCard name="John" email="john@example.com" isActive={false} /&gt;
  );

  await expect(component.locator('.status-badge')).toHaveText('Inactive');
  await expect(component.locator('.status-badge')).toHaveClass(/inactive/);
});</code></pre>
        </div>

        <h3>Testing with Slots (Vue/Svelte)</h3>
        <p>Vue and Svelte components use slots for content composition. Playwright supports passing slot content during mount:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Vue component test with slots
import { test, expect } from '@playwright/experimental-ct-vue';
import Card from '../../src/components/Card.vue';

test('renders card with default slot content', async ({ mount }) => {
  const component = await mount(Card, {
    slots: {
      default: '&lt;p&gt;Card body content&lt;/p&gt;',
    },
  });

  await expect(component.getByText('Card body content')).toBeVisible();
});

test('renders card with named slots', async ({ mount }) => {
  const component = await mount(Card, {
    slots: {
      header: '&lt;h3&gt;My Card Title&lt;/h3&gt;',
      default: '&lt;p&gt;Main content goes here&lt;/p&gt;',
      footer: '&lt;button&gt;Save&lt;/button&gt;',
    },
  });

  await expect(component.getByRole('heading')).toHaveText('My Card Title');
  await expect(component.getByText('Main content goes here')).toBeVisible();
  await expect(component.getByRole('button', { name: 'Save' })).toBeVisible();
});</code></pre>
        </div>

        <h3>Testing Events and Callbacks</h3>
        <p>Verifying that components emit the correct events or call callback props is fundamental. In React, you pass callback functions as props. In Vue, you listen for emitted events:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// React: Testing callback props
import { test, expect } from '@playwright/experimental-ct-react';
import SearchBar from '../../src/components/SearchBar';

test('calls onSearch callback when form is submitted', async ({ mount }) => {
  let searchQuery = '';
  const component = await mount(
    &lt;SearchBar
      onSearch={(query) => { searchQuery = query; }}
      placeholder="Search products..."
    /&gt;
  );

  await component.getByPlaceholder('Search products...').fill('playwright');
  await component.getByRole('button', { name: 'Search' }).click();

  expect(searchQuery).toBe('playwright');
});

test('calls onClear when clear button is clicked', async ({ mount }) => {
  let cleared = false;
  const component = await mount(
    &lt;SearchBar
      value="initial"
      onClear={() => { cleared = true; }}
    /&gt;
  );

  await component.getByRole('button', { name: 'Clear' }).click();
  expect(cleared).toBe(true);
});</code></pre>
        </div>

        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Vue: Testing emitted events
import { test, expect } from '@playwright/experimental-ct-vue';
import ConfirmDialog from '../../src/components/ConfirmDialog.vue';

test('emits confirm event when yes is clicked', async ({ mount }) => {
  const messages = [];
  const component = await mount(ConfirmDialog, {
    props: {
      title: 'Delete item?',
      message: 'This action cannot be undone.',
    },
    on: {
      confirm: () => messages.push('confirmed'),
      cancel: () => messages.push('cancelled'),
    },
  });

  await component.getByRole('button', { name: 'Yes' }).click();
  expect(messages).toEqual(['confirmed']);
});</code></pre>
        </div>

        <h3>Providing Context and Store</h3>
        <p>Many components depend on React Context, Vue provide/inject, or state management stores. You can wrap your component during mounting to provide these dependencies:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// React: Providing context via hooksConfig
// First, set up the wrapper in playwright/index.tsx
// playwright/index.tsx
import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { UserProvider } from '../src/contexts/UserContext';

beforeMount(async ({ App, hooksConfig }) => {
  if (hooksConfig?.theme || hooksConfig?.user) {
    return (
      &lt;ThemeProvider value={hooksConfig.theme || 'light'}&gt;
        &lt;UserProvider value={hooksConfig.user || null}&gt;
          &lt;App /&gt;
        &lt;/UserProvider&gt;
      &lt;/ThemeProvider&gt;
    );
  }
});

// Then in your test:
test('renders with dark theme context', async ({ mount }) => {
  const component = await mount(&lt;NavigationBar /&gt;, {
    hooksConfig: {
      theme: 'dark',
      user: { name: 'Alice', role: 'admin' },
    },
  });

  await expect(component.locator('nav')).toHaveClass(/dark-theme/);
  await expect(component.getByText('Alice')).toBeVisible();
});</code></pre>
        </div>

        <h3>Snapshot Testing Components</h3>
        <p>Playwright supports visual snapshot testing for components, allowing you to catch unintended UI regressions:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/experimental-ct-react';
import Button from '../../src/components/Button';

test('button matches visual snapshot - primary variant', async ({ mount }) => {
  const component = await mount(
    &lt;Button variant="primary" size="medium"&gt;Click Me&lt;/Button&gt;
  );

  await expect(component).toHaveScreenshot('button-primary.png');
});

test('button matches visual snapshot - disabled state', async ({ mount }) => {
  const component = await mount(
    &lt;Button variant="primary" disabled&gt;Disabled&lt;/Button&gt;
  );

  await expect(component).toHaveScreenshot('button-disabled.png');
});

test('button matches visual snapshot - loading state', async ({ mount }) => {
  const component = await mount(
    &lt;Button variant="primary" loading&gt;Loading...&lt;/Button&gt;
  );

  await expect(component).toHaveScreenshot('button-loading.png', {
    animations: 'disabled', // Freeze animations for consistent screenshots
  });
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> When snapshot testing components, use \`animations: 'disabled'\` to freeze CSS animations and transitions, preventing flaky screenshot comparisons caused by captured mid-animation frames.</div>

        <div class="info-box"><strong>ℹ️ Note:</strong> Component testing runs in a real browser, so visual snapshots capture exactly what a user would see — including font rendering, shadows, and CSS effects — making them more reliable than DOM-based snapshot testing.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'How do you pass slot content when mounting a Vue component in Playwright?',
            options: [
              'Using the children prop',
              'Using the slots option in mount()',
              'Using the innerHTML method',
              'Slots cannot be tested in Playwright'
            ],
            correct: 1,
            explanation: 'In Playwright Vue component testing, you pass slot content using the slots option in the mount() call, supporting both default and named slots.'
          },
          {
            question: 'How do you provide React Context to a component during Playwright component testing?',
            options: [
              'It is automatically provided by Playwright',
              'Using the hooksConfig option and a beforeMount hook in playwright/index.tsx',
              'By importing the context directly in the test file',
              'Context is not supported in component testing'
            ],
            correct: 1,
            explanation: 'You configure context providers in the beforeMount hook inside playwright/index.tsx, then pass context values via the hooksConfig option when mounting the component in your test.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 10: Accessibility Testing
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-10',
  title: 'Module 10: Accessibility Testing',
  icon: '♿',
  sections: [
    {
      id: 'accessibility-testing',
      title: 'Accessibility Testing with Playwright',
      content: `
        <h2>Accessibility Testing with Playwright</h2>
        <p>Accessibility (a11y) testing ensures your web application is usable by everyone, including people who rely on screen readers, keyboard navigation, or other assistive technologies. Playwright integrates seamlessly with <strong>axe-core</strong>, the industry-standard accessibility testing engine, allowing you to automate WCAG compliance checks as part of your test suite.</p>

        <h3>Why Accessibility Testing Matters</h3>
        <p>Accessibility is not optional — it's a legal requirement in many jurisdictions (ADA in the US, EAA in the EU) and a fundamental aspect of good user experience. Automated accessibility testing helps you:</p>
        <ul>
          <li><strong>Catch violations early</strong> — Find issues during development, not after deployment</li>
          <li><strong>Ensure compliance</strong> — Verify conformance with WCAG 2.0, 2.1, and 2.2 standards</li>
          <li><strong>Prevent regressions</strong> — Ensure new features don't break existing accessibility</li>
          <li><strong>Build inclusive products</strong> — Make your app usable by the widest audience possible</li>
        </ul>

        <div class="info-box"><strong>ℹ️ Note:</strong> Automated testing can catch approximately 30-50% of accessibility issues. Manual testing with screen readers and user testing with people who have disabilities is still essential for full coverage.</div>

        <h3>Installing @axe-core/playwright</h3>
        <p>The <code>@axe-core/playwright</code> package provides a tight integration between the axe-core engine and Playwright:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Install the axe-core Playwright integration
npm install -D @axe-core/playwright</code></pre>
        </div>

        <h3>Running Your First Accessibility Audit</h3>
        <p>The basic pattern is straightforward: navigate to a page, create an <code>AxeBuilder</code> instance, and call <code>analyze()</code>. The result contains an array of violations that you can assert against:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('https://example.com');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});</code></pre>
        </div>

        <h3>Checking for WCAG Violations</h3>
        <p>You can target specific WCAG standards by using tags. The axe-core engine supports various conformance levels:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should conform to WCAG 2.1 AA standards', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('should conform to WCAG 2.2 AAA (strict)', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

// Check for best practices beyond WCAG
test('should pass accessibility best practices', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .withTags(['best-practice'])
    .analyze();

  expect(results.violations).toEqual([]);
});</code></pre>
        </div>

        <h3>Targeting Specific Elements for Audits</h3>
        <p>Sometimes you want to audit only a specific region of the page, such as a modal dialog, navigation bar, or form. Use the <code>include()</code> method with CSS selectors:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('navigation should be accessible', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .include('nav')          // Only scan the nav element
    .analyze();

  expect(results.violations).toEqual([]);
});

test('login form should be accessible', async ({ page }) => {
  await page.goto('https://example.com/login');

  const results = await new AxeBuilder({ page })
    .include('#login-form')  // Only scan the login form
    .analyze();

  expect(results.violations).toEqual([]);
});

// You can include multiple regions
test('main content areas should be accessible', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .include('header')
    .include('main')
    .include('footer')
    .analyze();

  expect(results.violations).toEqual([]);
});</code></pre>
        </div>

        <h3>Excluding Elements from Audits</h3>
        <p>If certain elements are known to have issues (e.g., third-party widgets you can't control), you can exclude them from the scan:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('page should be accessible (excluding third-party chat widget)', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .exclude('#intercom-widget')     // Exclude chat widget
    .exclude('.third-party-ads')     // Exclude ad containers
    .exclude('[data-testid="legacy-banner"]') // Exclude legacy components
    .analyze();

  expect(results.violations).toEqual([]);
});</code></pre>
        </div>

        <h3>Disabling Specific Rules</h3>
        <p>In some cases, you may need to disable specific accessibility rules — for instance, when a rule produces false positives for your use case, or when you've decided to accept a known issue temporarily:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>test('page should be accessible (custom rule configuration)', async ({ page }) => {
  await page.goto('https://example.com');

  const results = await new AxeBuilder({ page })
    .disableRules([
      'color-contrast',           // Disable if contrast checking is handled separately
      'region',                   // Disable the landmark region rule
    ])
    .analyze();

  expect(results.violations).toEqual([]);
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Be cautious about disabling rules. Each disabled rule represents a class of accessibility issues that won't be caught. Always document why a rule was disabled and create a plan to re-enable it.</div>

        <h3>Including Results in Test Reports</h3>
        <p>For better debugging and reporting, you can attach detailed accessibility results to Playwright's test reports. This makes it easy to investigate failures:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('full page accessibility audit with detailed reporting', async ({ page }, testInfo) => {
  await page.goto('https://example.com');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Attach the full results to the test report
  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json',
  });

  // Attach a human-readable violations summary
  if (accessibilityScanResults.violations.length > 0) {
    const violationSummary = accessibilityScanResults.violations
      .map(v => \`\${v.id}: \${v.description} (\${v.impact}) - \${v.nodes.length} instance(s)\`)
      .join('\\n');

    await testInfo.attach('violations-summary', {
      body: violationSummary,
      contentType: 'text/plain',
    });
  }

  expect(accessibilityScanResults.violations).toEqual([]);
});</code></pre>
        </div>

        <h3>Complete Accessibility Test Suite</h3>
        <p>Here's a comprehensive example that demonstrates a full accessibility testing strategy for a multi-page application:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Reusable a11y test helper
async function checkAccessibility(page, testInfo, options = {}) {
  let builder = new AxeBuilder({ page })
    .withTags(options.tags || ['wcag2a', 'wcag2aa']);

  if (options.include) {
    for (const selector of options.include) {
      builder = builder.include(selector);
    }
  }

  if (options.exclude) {
    for (const selector of options.exclude) {
      builder = builder.exclude(selector);
    }
  }

  if (options.disableRules) {
    builder = builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  // Always attach results for debugging
  await testInfo.attach('a11y-results', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  expect(results.violations).toEqual([]);
}

test.describe('Site-wide Accessibility Audit', () => {
  const pagesToTest = [
    { url: '/', name: 'Home Page' },
    { url: '/about', name: 'About Page' },
    { url: '/contact', name: 'Contact Page' },
    { url: '/login', name: 'Login Page' },
    { url: '/products', name: 'Products Page' },
  ];

  for (const { url, name } of pagesToTest) {
    test(\`\${name} should have no accessibility violations\`, async ({ page }, testInfo) => {
      await page.goto(url);
      await checkAccessibility(page, testInfo);
    });
  }

  test('modal dialog should be accessible when open', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open Settings' }).click();

    // Wait for modal to be fully visible
    await expect(page.getByRole('dialog')).toBeVisible();

    await checkAccessibility(page, testInfo, {
      include: ['[role="dialog"]'],
    });
  });

  test('form validation errors should be accessible', async ({ page }, testInfo) => {
    await page.goto('/contact');
    // Submit empty form to trigger validation
    await page.getByRole('button', { name: 'Submit' }).click();

    await checkAccessibility(page, testInfo, {
      include: ['form'],
    });
  });

  test('keyboard navigation should work on main menu', async ({ page }) => {
    await page.goto('/');

    // Focus the first menu item
    await page.getByRole('navigation').getByRole('link').first().focus();

    // Tab through menu items
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Verify focus is within the navigation
    await expect(page.getByRole('navigation').locator(':focus')).toBeVisible();
  });
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Create a reusable helper function like \`checkAccessibility()\` above, and use it across your test suite. This ensures consistent configuration and reporting for all accessibility tests.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'Which package provides axe-core integration with Playwright?',
            options: [
              'axe-playwright',
              '@axe-core/playwright',
              'playwright-axe',
              '@playwright/accessibility'
            ],
            correct: 1,
            explanation: 'The @axe-core/playwright package provides the official integration between the axe-core accessibility engine and Playwright.'
          },
          {
            question: 'How do you restrict an accessibility scan to a specific element on the page?',
            options: [
              'new AxeBuilder({ page }).focus("#element")',
              'new AxeBuilder({ page }).only("#element")',
              'new AxeBuilder({ page }).include("#element")',
              'new AxeBuilder({ page, selector: "#element" })'
            ],
            correct: 2,
            explanation: 'The include() method on AxeBuilder restricts the accessibility scan to only the specified CSS selector(s).'
          },
          {
            question: 'What percentage of accessibility issues can automated testing typically catch?',
            options: [
              '100%',
              '80-90%',
              '30-50%',
              'Less than 10%'
            ],
            correct: 2,
            explanation: 'Automated accessibility testing typically catches 30-50% of issues. Manual testing with assistive technologies and real users is essential for comprehensive coverage.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 11: Mobile Emulation & Geolocation
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-11',
  title: 'Module 11: Mobile Emulation & Geolocation',
  icon: '📱',
  sections: [
    {
      id: 'device-emulation',
      title: 'Device Emulation',
      content: `
        <h2>Device Emulation</h2>
        <p>Playwright provides a comprehensive device emulation system that lets you test your application as it would appear and behave on various mobile devices, tablets, and desktop configurations. This goes beyond simple viewport resizing — Playwright emulates the <strong>viewport</strong>, <strong>user agent string</strong>, <strong>device scale factor</strong>, <strong>touch support</strong>, and even <strong>mobile behavior</strong> like the mobile Chrome viewport meta tag handling.</p>

        <h3>The playwright.devices Registry</h3>
        <p>Playwright ships with a built-in registry of device descriptors covering a wide range of popular devices. Each descriptor contains pre-configured values for viewport dimensions, user agent, device scale factor, touch support, and whether the device is mobile:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { devices } from '@playwright/test';

// Inspect a device descriptor
console.log(devices['iPhone 13']);
// {
//   userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...',
//   viewport: { width: 390, height: 844 },
//   deviceScaleFactor: 3,
//   isMobile: true,
//   hasTouch: true,
//   defaultBrowserType: 'webkit'
// }

console.log(devices['Pixel 5']);
// {
//   userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)...',
//   viewport: { width: 393, height: 851 },
//   deviceScaleFactor: 2.75,
//   isMobile: true,
//   hasTouch: true,
//   defaultBrowserType: 'chromium'
// }</code></pre>
        </div>

        <p>Some commonly available devices include:</p>
        <ul>
          <li><strong>Phones:</strong> iPhone 12, iPhone 13, iPhone 13 Pro Max, iPhone 14, Pixel 5, Pixel 7, Galaxy S8, Galaxy S9+</li>
          <li><strong>Tablets:</strong> iPad (gen 7), iPad Mini, iPad Pro 11</li>
          <li><strong>Desktop:</strong> Desktop Chrome, Desktop Firefox, Desktop Safari, Desktop Edge</li>
        </ul>

        <div class="tip-box"><strong>💡 Tip:</strong> You can see the full list of available devices by running: <code>const { devices } = require('@playwright/test'); console.log(Object.keys(devices));</code></div>

        <h3>Emulating Devices in Tests</h3>
        <p>You can emulate a device for a single test or across an entire test file:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect, devices } from '@playwright/test';

// Use iPhone 13 for all tests in this file
test.use({ ...devices['iPhone 13'] });

test('mobile homepage renders correctly', async ({ page }) => {
  await page.goto('https://example.com');

  // The hamburger menu should be visible on mobile
  await expect(page.getByLabel('Toggle navigation')).toBeVisible();

  // The desktop nav should be hidden
  await expect(page.getByRole('navigation').locator('.desktop-nav')).toBeHidden();
});

test('mobile menu opens on tap', async ({ page }) => {
  await page.goto('https://example.com');

  // Tap the hamburger menu (touch event on mobile)
  await page.getByLabel('Toggle navigation').tap();

  // Mobile menu should slide in
  await expect(page.locator('.mobile-menu')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
});</code></pre>
        </div>

        <h3>Setting Viewport, User Agent, and Device Scale Factor</h3>
        <p>You can also configure device properties manually instead of using a preset. This is useful for testing custom viewport sizes or unusual device configurations:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// Custom device configuration
test.use({
  viewport: { width: 360, height: 640 },
  userAgent: 'Mozilla/5.0 (Linux; Android 12; Custom Device) AppleWebKit/537.36',
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

test('works on custom small screen device', async ({ page }) => {
  await page.goto('https://example.com');
  // Test responsive layout at this custom size
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('.content')).toBeVisible();
});

// Dynamically change viewport within a test
test('responds to viewport changes', async ({ page }) => {
  await page.goto('https://example.com');

  // Start with mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.mobile-layout')).toBeVisible();

  // Switch to tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('.tablet-layout')).toBeVisible();

  // Switch to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.desktop-layout')).toBeVisible();
});</code></pre>
        </div>

        <h3>Configuring Device Emulation in playwright.config</h3>
        <p>The most common and recommended approach is to configure device emulation as <strong>projects</strong> in your Playwright config. This lets you run the same tests across multiple devices automatically:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',

  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },

    // Tablets
    {
      name: 'Tablet',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Custom: landscape mode
    {
      name: 'Mobile Landscape',
      use: {
        ...devices['iPhone 13 landscape'],
      },
    },
  ],
});</code></pre>
        </div>

        <h3>Testing Responsive Design</h3>
        <p>With device emulation in place, you can write tests that verify your responsive design works correctly across all breakpoints:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {
  test.describe('Mobile', () => {
    test.use({ ...devices['iPhone 13'] });

    test('shows single-column layout', async ({ page }) => {
      await page.goto('https://example.com/products');

      const grid = page.locator('.product-grid');
      // On mobile, grid should be single column
      await expect(grid).toHaveCSS('grid-template-columns', /^\\d+px$/);
    });

    test('shows sticky bottom CTA on mobile', async ({ page }) => {
      await page.goto('https://example.com/products/1');

      const ctaBar = page.locator('.mobile-cta-bar');
      await expect(ctaBar).toBeVisible();
      await expect(ctaBar).toHaveCSS('position', 'fixed');
    });
  });

  test.describe('Desktop', () => {
    test.use({ ...devices['Desktop Chrome'] });

    test('shows multi-column layout', async ({ page }) => {
      await page.goto('https://example.com/products');

      const grid = page.locator('.product-grid');
      // On desktop, grid should have multiple columns
      const columns = await grid.evaluate(el =>
        getComputedStyle(el).gridTemplateColumns
      );
      expect(columns.split(' ').length).toBeGreaterThan(1);
    });

    test('hides mobile CTA on desktop', async ({ page }) => {
      await page.goto('https://example.com/products/1');
      await expect(page.locator('.mobile-cta-bar')).toBeHidden();
    });
  });
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Device emulation is not the same as testing on real devices. While Playwright accurately emulates viewport, touch, and user agent, it cannot replicate hardware-specific rendering differences, GPU behavior, or native OS interactions. For critical mobile features, supplement emulation with real device testing.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What does the playwright.devices registry contain?',
            options: [
              'Physical device connections for testing',
              'Pre-configured device descriptors with viewport, user agent, and other settings',
              'Browser download links for mobile browsers',
              'Device screenshots for visual comparison'
            ],
            correct: 1,
            explanation: 'The playwright.devices registry contains pre-configured device descriptors that include viewport dimensions, user agent strings, device scale factor, touch support, and mobile settings.'
          },
          {
            question: 'How do you dynamically change the viewport size during a test?',
            options: [
              'page.resize(width, height)',
              'page.setViewportSize({ width, height })',
              'page.viewport.set(width, height)',
              'browser.setViewport(width, height)'
            ],
            correct: 1,
            explanation: 'The page.setViewportSize({ width, height }) method allows you to dynamically change the viewport dimensions during a running test.'
          },
          {
            question: 'What is the recommended way to test across multiple devices in Playwright?',
            options: [
              'Write separate test files for each device',
              'Use test.use() in every test function',
              'Configure devices as projects in playwright.config.ts',
              'Use an external device testing service'
            ],
            correct: 2,
            explanation: 'The recommended approach is to configure devices as separate projects in playwright.config.ts, which runs the same tests across all configured devices automatically.'
          }
        ]
      }
    },
    {
      id: 'geolocation-permissions',
      title: 'Geolocation & Permissions',
      content: `
        <h2>Geolocation & Permissions</h2>
        <p>Modern web applications frequently use browser APIs that require user permissions, such as geolocation, camera, microphone, and notifications. Playwright provides powerful tools to grant these permissions, mock sensor data, and emulate browser environment settings like timezone, locale, and color scheme — all programmatically, without manual user interaction.</p>

        <h3>Setting Geolocation</h3>
        <p>To mock geolocation, you need to both grant the geolocation permission and set the coordinates. This can be done at the context level (affecting all pages) or at the page level:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('shows nearby stores based on geolocation', async ({ browser }) => {
  // Create a context with geolocation and permission granted
  const context = await browser.newContext({
    geolocation: { latitude: 40.7128, longitude: -74.0060 }, // New York City
    permissions: ['geolocation'],
  });

  const page = await context.newPage();
  await page.goto('https://example.com/stores');

  // Click "Find Nearby Stores" — the app uses navigator.geolocation
  await page.getByRole('button', { name: 'Find Nearby' }).click();

  // Verify stores near NYC are shown
  await expect(page.getByText('Manhattan Store')).toBeVisible();
  await expect(page.getByText('Brooklyn Store')).toBeVisible();

  await context.close();
});

// Using test.use for file-level configuration
test.use({
  geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris
  permissions: ['geolocation'],
});

test('shows Paris location on map', async ({ page }) => {
  await page.goto('https://example.com/map');
  await expect(page.getByText('Paris, France')).toBeVisible();
});</code></pre>
        </div>

        <h3>Mocking Geolocation Coordinates</h3>
        <p>You can change the geolocation during a test to simulate user movement, or set it in the config for all tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('simulates user movement between locations', async ({ context, page }) => {
  // Grant geolocation permission
  await context.grantPermissions(['geolocation']);

  // Start in San Francisco
  await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
  await page.goto('https://example.com/delivery');

  await expect(page.getByText('Delivering to: San Francisco')).toBeVisible();

  // "Move" to Los Angeles
  await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 });

  // Trigger a location refresh
  await page.getByRole('button', { name: 'Update Location' }).click();

  await expect(page.getByText('Delivering to: Los Angeles')).toBeVisible();
});

// Config-level geolocation setup
// In playwright.config.ts:
// use: {
//   geolocation: { latitude: 51.5074, longitude: -0.1278 }, // London
//   permissions: ['geolocation'],
// }</code></pre>
        </div>

        <h3>Testing Permission-Dependent Features</h3>
        <p>Beyond geolocation, Playwright can grant permissions for camera, microphone, notifications, and more:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test('camera permission allows video preview', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['camera'],
  });
  const page = await context.newPage();
  await page.goto('https://example.com/video-call');

  // The camera permission is granted, so the video preview should appear
  await page.getByRole('button', { name: 'Start Camera' }).click();
  await expect(page.locator('video')).toBeVisible();

  await context.close();
});

test('notification permission enables push notifications', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['notifications'],
  });
  const page = await context.newPage();
  await page.goto('https://example.com/settings');

  // Toggle notifications on — permission is already granted
  await page.getByLabel('Enable Notifications').check();

  await expect(page.getByText('Notifications enabled')).toBeVisible();

  await context.close();
});

test('microphone access for voice search', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['microphone'],
  });
  const page = await context.newPage();
  await page.goto('https://example.com/search');

  await page.getByRole('button', { name: 'Voice Search' }).click();
  // The app should start listening without a permission prompt
  await expect(page.getByText('Listening...')).toBeVisible();

  await context.close();
});</code></pre>
        </div>

        <h3>Timezone Emulation</h3>
        <p>Playwright can emulate different timezones, which is crucial for testing date/time displays, scheduled content, and timezone-aware features:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('Timezone Testing', () => {
  test('displays correct time in Tokyo timezone', async ({ browser }) => {
    const context = await browser.newContext({
      timezoneId: 'Asia/Tokyo',
    });
    const page = await context.newPage();
    await page.goto('https://example.com/dashboard');

    // Evaluate the timezone in the browser
    const timezone = await page.evaluate(() =>
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    expect(timezone).toBe('Asia/Tokyo');

    await context.close();
  });

  test('handles timezone differences in event scheduling', async ({ browser }) => {
    const context = await browser.newContext({
      timezoneId: 'America/Los_Angeles',
    });
    const page = await context.newPage();
    await page.goto('https://example.com/events');

    // Event at 9 AM UTC should show as 1 AM PST
    await expect(page.getByText('1:00 AM PST')).toBeVisible();

    await context.close();
  });
});</code></pre>
        </div>

        <h3>Locale Emulation</h3>
        <p>Locale emulation affects number formatting, date formatting, currency display, and the <code>Accept-Language</code> header sent with requests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.use({ locale: 'de-DE' });

test('displays prices in German format', async ({ page }) => {
  await page.goto('https://example.com/products');

  // German locale uses comma for decimal and period for thousands
  // e.g., 1.299,99 € instead of $1,299.99
  await expect(page.locator('.price').first()).toContainText(',');
});

test('dates use German format', async ({ page }) => {
  await page.goto('https://example.com/orders');

  // German date format: DD.MM.YYYY
  const dateText = await page.locator('.order-date').first().textContent();
  expect(dateText).toMatch(/\\d{2}\\.\\d{2}\\.\\d{4}/);
});

// Test with Japanese locale
test.describe('Japanese Locale', () => {
  test.use({ locale: 'ja-JP' });

  test('shows content in Japanese locale', async ({ page }) => {
    await page.goto('https://example.com');

    const lang = await page.evaluate(() => navigator.language);
    expect(lang).toBe('ja-JP');
  });
});</code></pre>
        </div>

        <h3>Color Scheme (Dark/Light Mode)</h3>
        <p>Testing dark mode and light mode is essential for modern applications. Playwright can emulate the <code>prefers-color-scheme</code> media feature:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.use({ colorScheme: 'dark' });

  test('applies dark theme styles', async ({ page }) => {
    await page.goto('https://example.com');

    // Verify dark mode background
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(18, 18, 18)');

    // Verify dark mode text color
    await expect(body).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('dark mode toggle shows correct state', async ({ page }) => {
    await page.goto('https://example.com/settings');
    await expect(page.getByLabel('Dark Mode')).toBeChecked();
  });
});

test.describe('Light Mode', () => {
  test.use({ colorScheme: 'light' });

  test('applies light theme styles', async ({ page }) => {
    await page.goto('https://example.com');

    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
});

// Toggle color scheme during a test
test('handles dynamic theme switching', async ({ page }) => {
  await page.goto('https://example.com');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> You can combine locale, timezone, geolocation, and color scheme in a single project configuration to fully emulate how a user in a specific region experiences your app — for example, a Japanese user in Tokyo using dark mode.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'How do you change the geolocation coordinates during a running test?',
            options: [
              'page.setGeolocation({ latitude, longitude })',
              'context.setGeolocation({ latitude, longitude })',
              'browser.setGeolocation({ latitude, longitude })',
              'navigator.geolocation.setPosition({ latitude, longitude })'
            ],
            correct: 1,
            explanation: 'The context.setGeolocation() method allows you to change the mocked geolocation coordinates during a running test. Geolocation is set at the browser context level.'
          },
          {
            question: 'How do you emulate dark mode in a Playwright test?',
            options: [
              'test.use({ theme: "dark" })',
              'test.use({ colorScheme: "dark" })',
              'page.setDarkMode(true)',
              'context.setColorScheme("dark")'
            ],
            correct: 1,
            explanation: 'You use test.use({ colorScheme: "dark" }) to emulate the prefers-color-scheme: dark media feature. You can also use page.emulateMedia({ colorScheme: "dark" }) within a test.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 12: Parallel Execution & Sharding
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-12',
  title: 'Module 12: Parallel Execution & Sharding',
  icon: '⚙️',
  sections: [
    {
      id: 'parallel-execution',
      title: 'Parallel Test Execution',
      content: `
        <h2>Parallel Test Execution</h2>
        <p>Playwright is designed for parallelism from the ground up. By default, test files run in parallel across multiple <strong>worker processes</strong>, dramatically reducing your total test suite execution time. Understanding how workers, parallelism modes, and resource isolation work is key to building a fast and reliable test suite.</p>

        <h3>How Workers Work in Playwright</h3>
        <p>Playwright uses a <strong>worker-based architecture</strong> for running tests. Each worker is an independent Node.js process that runs one or more test files. Here's how it works:</p>
        <ul>
          <li>By default, Playwright runs <strong>test files in parallel</strong>, with each file assigned to a worker</li>
          <li>Tests <strong>within a single file</strong> run sequentially by default (one after another)</li>
          <li>Each worker has its own browser instance, ensuring complete isolation</li>
          <li>Workers do not share memory or state — they are separate processes</li>
          <li>The number of workers defaults to half the number of CPU cores</li>
        </ul>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>Diagram</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>┌─────────────────────────────────────────────────┐
│               Playwright Test Runner             │
├─────────────┬──────────────┬──────────────────────┤
│  Worker 1   │  Worker 2    │  Worker 3            │
│  (Process)  │  (Process)   │  (Process)           │
│             │              │                      │
│  login.spec │  cart.spec   │  checkout.spec       │
│  ├─ test 1  │  ├─ test 1   │  ├─ test 1           │
│  ├─ test 2  │  ├─ test 2   │  ├─ test 2           │
│  └─ test 3  │  └─ test 3   │  └─ test 3           │
│             │              │                      │
│  [Browser]  │  [Browser]   │  [Browser]           │
└─────────────┴──────────────┴──────────────────────┘</code></pre>
        </div>

        <h3>fullyParallel Mode</h3>
        <p>When <code>fullyParallel: true</code> is set, Playwright parallelizes not just across files but also <strong>within files</strong>. Each individual test can run in its own worker, maximizing parallelism:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // All tests across all files run in parallel
  fullyParallel: true,
  workers: 4,

  // ... other config
});

// You can also set fullyParallel per project:
// projects: [
//   {
//     name: 'chromium',
//     use: { ...devices['Desktop Chrome'] },
//     fullyParallel: true,
//   },
//   {
//     name: 'e2e-serial',
//     testDir: './tests/serial',
//     fullyParallel: false, // These tests run sequentially within files
//   },
// ]</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> With \`fullyParallel: true\`, every test gets its own worker and browser context. This means tests must be completely independent — they cannot share state or depend on execution order.</div>

        <h3>Serial Mode for Ordered Tests</h3>
        <p>Sometimes tests must run in a specific order, such as a multi-step workflow where each test builds on the previous one. Use <code>test.describe.configure({ mode: 'serial' })</code> for this:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('E-commerce checkout flow', () => {
  test('step 1: add items to cart', async ({ page }) => {
    await page.goto('https://example.com/products');
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('step 2: proceed to checkout', async ({ page }) => {
    await page.goto('https://example.com/cart');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout/);
  });

  test('step 3: fill shipping information', async ({ page }) => {
    await page.goto('https://example.com/checkout');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('New York');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/payment/);
  });

  test('step 4: complete payment', async ({ page }) => {
    await page.goto('https://example.com/checkout/payment');
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> In serial mode, if one test fails, all subsequent tests in the describe block are <strong>skipped</strong>. This is by design — since later tests depend on earlier ones, running them after a failure would produce meaningless results. Use serial mode sparingly and prefer independent, parallelizable tests wherever possible.</div>

        <h3>Worker-Scoped vs. Test-Scoped Fixtures</h3>
        <p>Playwright has two fixture scopes that control resource lifetime and sharing:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test as base } from '@playwright/test';

// Test-scoped fixture: created fresh for EACH test
// Each test gets its own instance
const test = base.extend({
  // Test-scoped (default) — new for every test
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
    // Cleanup after each test
  },

  // Worker-scoped — shared across tests in the SAME worker
  // Created once per worker, reused by all tests assigned to that worker
  dbConnection: [async ({}, use) => {
    const db = await createDatabaseConnection();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],

  // Another worker-scoped example: authenticated API client
  apiClient: [async ({}, use) => {
    const client = await ApiClient.create();
    await client.authenticate('admin', 'password');
    await use(client);
    await client.dispose();
  }, { scope: 'worker' }],
});</code></pre>
        </div>

        <p>Use <strong>worker-scoped fixtures</strong> for expensive resources that are safe to share (database connections, API clients, pre-computed data). Use <strong>test-scoped fixtures</strong> for resources that need to be fresh for each test (pages, contexts, test data).</p>

        <h3>Resource Isolation Between Workers</h3>
        <p>Each worker is a separate process with its own memory space. This provides natural isolation, but you need to be careful with shared external resources:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// GOOD: Each test uses unique data, avoiding conflicts
test('creates a new user', async ({ page }) => {
  const uniqueEmail = \`user-\${Date.now()}-\${Math.random().toString(36).slice(2)}@test.com\`;

  await page.goto('/register');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByText('Welcome')).toBeVisible();
});

// GOOD: Use workerInfo to create worker-specific resources
test('worker-isolated database test', async ({ page }, workerInfo) => {
  const testDb = \`test_db_worker_\${workerInfo.workerIndex}\`;
  // Each worker uses its own database, preventing race conditions
  console.log(\`Running in worker \${workerInfo.workerIndex}, using \${testDb}\`);
});</code></pre>
        </div>

        <h3>Configuring Workers</h3>
        <p>You can control the number of parallel workers via the config file or CLI:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Fixed number of workers
  workers: 4,

  // OR percentage of CPU cores
  // workers: '50%',

  // OR use environment variable
  // workers: process.env.CI ? 2 : undefined,  // undefined = auto-detect
});</code></pre>
        </div>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># CLI options for workers
npx playwright test --workers=4       # Fixed number
npx playwright test --workers=50%     # Percentage of CPU cores
npx playwright test --workers=1       # Run sequentially (useful for debugging)</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> In CI environments, start with 2-4 workers and tune based on your CI machine's resources. Too many workers can cause resource contention (CPU, memory, network), actually slowing down your tests. Use \`--workers=1\` when debugging to eliminate parallel execution as a variable.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the default parallelism behavior in Playwright?',
            options: [
              'All tests run sequentially',
              'Test files run in parallel, tests within a file run sequentially',
              'Everything runs in a single worker',
              'Tests within a file run in parallel, files run sequentially'
            ],
            correct: 1,
            explanation: 'By default, Playwright runs test files in parallel (each in its own worker), while tests within a single file run sequentially. Use fullyParallel: true to parallelize within files too.'
          },
          {
            question: 'What happens when a test fails in serial mode (test.describe.configure({ mode: "serial" }))?',
            options: [
              'The remaining tests in the describe block are retried',
              'The remaining tests continue running',
              'The remaining tests in the describe block are skipped',
              'The entire test suite stops'
            ],
            correct: 2,
            explanation: 'In serial mode, if one test fails, all subsequent tests in the describe block are skipped because they depend on the execution of prior tests.'
          },
          {
            question: 'What is the difference between worker-scoped and test-scoped fixtures?',
            options: [
              'Worker-scoped fixtures are faster, test-scoped are more accurate',
              'Worker-scoped fixtures are shared across all tests in a worker; test-scoped are created fresh for each test',
              'Worker-scoped fixtures use more memory',
              'There is no difference, they are the same'
            ],
            correct: 1,
            explanation: 'Worker-scoped fixtures are created once per worker and shared across all tests assigned to that worker. Test-scoped fixtures are created fresh for each individual test, providing isolation.'
          }
        ]
      }
    },
    {
      id: 'test-sharding',
      title: 'Test Sharding for CI',
      content: `
        <h2>Test Sharding for CI</h2>
        <p>As your test suite grows, even parallel execution on a single machine may not be fast enough. <strong>Test sharding</strong> solves this by splitting your tests across multiple CI machines, running portions of the suite simultaneously. This is the key to achieving fast CI pipelines even with hundreds or thousands of tests.</p>

        <h3>What Is Sharding?</h3>
        <p>Sharding divides your total set of tests into multiple subsets (called "shards"), each of which runs on a separate CI machine. For example, if you have 100 tests and 4 shards, each shard runs approximately 25 tests. All shards execute simultaneously, reducing wall-clock time by a factor proportional to the number of shards.</p>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>Diagram</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>┌────────────────── CI Pipeline ──────────────────┐
│                                                  │
│  Machine 1 (Shard 1/4)  │  Machine 2 (Shard 2/4)│
│  ├─ login.spec.ts        │  ├─ profile.spec.ts   │
│  ├─ register.spec.ts     │  ├─ settings.spec.ts  │
│  └─ dashboard.spec.ts    │  └─ billing.spec.ts   │
│                          │                       │
│  Machine 3 (Shard 3/4)  │  Machine 4 (Shard 4/4)│
│  ├─ cart.spec.ts         │  ├─ admin.spec.ts     │
│  ├─ checkout.spec.ts     │  ├─ reports.spec.ts   │
│  └─ orders.spec.ts       │  └─ api.spec.ts       │
│                                                  │
│  ──────── Merge Reports Step ────────            │
│  Combines all shard results into one report      │
└──────────────────────────────────────────────────┘</code></pre>
        </div>

        <h3>Using the Shard Command</h3>
        <p>Playwright has built-in sharding support via the <code>--shard</code> CLI flag. The format is <code>--shard=current/total</code>:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Split tests into 4 shards and run shard 1
npx playwright test --shard=1/4

# Run shard 2
npx playwright test --shard=2/4

# Run shard 3
npx playwright test --shard=3/4

# Run shard 4
npx playwright test --shard=4/4</code></pre>
        </div>

        <p>Playwright uses a deterministic algorithm to distribute test files across shards, ensuring each test runs in exactly one shard and the distribution is as balanced as possible.</p>

        <h3>Blob Reporter for Shard Merging</h3>
        <p>When using sharding, each shard produces its own test results. To combine them into a single unified report, Playwright provides the <strong>blob reporter</strong>. This reporter outputs a binary blob file that can later be merged:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,

  // Use blob reporter in CI for shard merging
  reporter: process.env.CI
    ? [['blob', { outputDir: 'blob-report' }]]
    : [['html']],

  // You can use multiple reporters simultaneously:
  // reporter: [
  //   ['blob', { outputDir: 'blob-report' }],  // For merging
  //   ['list'],                                  // For console output
  // ],
});</code></pre>
        </div>

        <h3>Merging Shard Reports</h3>
        <p>After all shards have completed, you merge the blob reports from all shards into a single HTML report (or any other format):</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># After all shards complete, merge the blob reports
# All blob files must be in the same directory
npx playwright merge-reports --reporter html ./all-blob-reports

# You can merge into different report formats:
npx playwright merge-reports --reporter json ./all-blob-reports
npx playwright merge-reports --reporter junit ./all-blob-reports

# Merge with multiple reporters at once:
npx playwright merge-reports --reporter html,json ./all-blob-reports</code></pre>
        </div>

        <h3>Complete CI Matrix Example with Sharding (GitHub Actions)</h3>
        <p>Here's a production-ready GitHub Actions workflow that uses sharding to run tests across multiple machines and then merges the results:</p>
        <div class="code-block" data-language="yaml">
          <div class="code-header"><span>YAML</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  playwright-tests:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false  # Don't cancel other shards if one fails
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests (Shard \${{ matrix.shardIndex }}/\${{ matrix.shardTotal }})
        run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}

      - name: Upload blob report
        if: \${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-\${{ matrix.shardIndex }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    if: \${{ !cancelled() }}
    needs: [playwright-tests]
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

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
          name: html-report--attempt-\${{ github.run_attempt }}
          path: playwright-report/
          retention-days: 14</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> Use \`fail-fast: false\` in your CI matrix strategy. This ensures all shards run to completion even if one shard has failures, giving you a complete picture of your test results in the merged report.</div>

        <div class="info-box"><strong>ℹ️ Note:</strong> The optimal number of shards depends on your test suite size, CI machine resources, and budget. Start with 4 shards and adjust based on execution time and cost. Too many shards have diminishing returns due to overhead (machine startup time, browser installation, etc.).</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What CLI flag is used to run a specific shard of tests?',
            options: [
              '--split=1/4',
              '--shard=1/4',
              '--partition=1/4',
              '--chunk=1/4'
            ],
            correct: 1,
            explanation: 'The --shard=current/total flag (e.g., --shard=1/4) tells Playwright to run the specified shard of tests out of the total number of shards.'
          },
          {
            question: 'What reporter is used to create mergeable output from sharded test runs?',
            options: [
              'html reporter',
              'json reporter',
              'blob reporter',
              'junit reporter'
            ],
            correct: 2,
            explanation: 'The blob reporter creates binary blob files that can be merged using npx playwright merge-reports after all shards complete.'
          }
        ]
      }
    }
  ]
});

// ============================================================
// MODULE 13: Advanced Patterns & Best Practices
// ============================================================
window.PLAYWRIGHT_MODULES.push({
  id: 'module-13',
  title: 'Module 13: Advanced Patterns & Best Practices',
  icon: '🏆',
  sections: [
    {
      id: 'test-organization',
      title: 'Test Organization & Structure',
      content: `
        <h2>Test Organization & Structure</h2>
        <p>As your Playwright test suite grows from a handful of tests to hundreds, organization becomes critical. A well-structured test project is easier to maintain, debug, and extend. This section covers proven strategies for organizing tests, managing test data, and handling different environments.</p>

        <h3>File Naming Conventions</h3>
        <p>Consistent file naming helps you quickly identify test files, distinguish between test types, and configure test execution:</p>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>File Naming Conventions</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Recommended naming patterns:

# By feature area
tests/
  auth/
    login.spec.ts
    register.spec.ts
    password-reset.spec.ts
  products/
    product-list.spec.ts
    product-detail.spec.ts
    product-search.spec.ts
  checkout/
    cart.spec.ts
    shipping.spec.ts
    payment.spec.ts

# By test type suffix
tests/
  login.e2e.spec.ts          # End-to-end test
  login.smoke.spec.ts         # Smoke test (quick validation)
  login.visual.spec.ts        # Visual regression test
  login.a11y.spec.ts          # Accessibility test

# Common conventions:
# - Use .spec.ts or .test.ts suffix (configure in testMatch)
# - Use kebab-case for file names
# - Group related tests in directories
# - Keep test files close to what they test</code></pre>
        </div>

        <h3>Grouping Tests: By Feature vs. By Page</h3>
        <p>There are two common strategies for grouping tests, each with trade-offs:</p>

        <p><strong>By Feature (Recommended):</strong> Group tests by the business feature or user flow they test. This aligns tests with how stakeholders think about the application:</p>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>Feature-Based Structure</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>tests/
  features/
    user-authentication/
      login.spec.ts
      register.spec.ts
      social-login.spec.ts
    shopping/
      browse-products.spec.ts
      add-to-cart.spec.ts
      checkout.spec.ts
    user-account/
      profile.spec.ts
      order-history.spec.ts
      settings.spec.ts</code></pre>
        </div>

        <p><strong>By Page:</strong> Group tests by the page or route they primarily interact with. This is simpler but can lead to fragmentation for features spanning multiple pages:</p>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>Page-Based Structure</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>tests/
  pages/
    home-page.spec.ts
    login-page.spec.ts
    product-list-page.spec.ts
    product-detail-page.spec.ts
    cart-page.spec.ts
    checkout-page.spec.ts</code></pre>
        </div>

        <h3>Shared Utilities and Helpers</h3>
        <p>Extract common patterns into reusable helper functions and utilities to keep tests DRY and maintainable:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/helpers/test-data.ts
export function generateUser(overrides = {}) {
  const timestamp = Date.now();
  return {
    email: \`user-\${timestamp}@test.com\`,
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  };
}

export function generateProduct(overrides = {}) {
  return {
    name: \`Product \${Date.now()}\`,
    price: 29.99,
    description: 'A test product',
    category: 'Electronics',
    ...overrides,
  };
}

// tests/helpers/api-helpers.ts
import { APIRequestContext } from '@playwright/test';

export async function createUserViaAPI(request: APIRequestContext, userData) {
  const response = await request.post('/api/users', { data: userData });
  return response.json();
}

export async function seedDatabase(request: APIRequestContext, fixtures) {
  for (const fixture of fixtures) {
    await request.post(\`/api/\${fixture.endpoint}\`, { data: fixture.data });
  }
}

// tests/helpers/assertions.ts
import { expect, Page } from '@playwright/test';

export async function expectToast(page: Page, message: string) {
  const toast = page.locator('.toast-notification');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);
}

export async function expectFormErrors(page: Page, errors: string[]) {
  for (const error of errors) {
    await expect(page.locator('.form-error', { hasText: error })).toBeVisible();
  }
}</code></pre>
        </div>

        <h3>Test Data Management</h3>
        <p>Managing test data effectively is crucial for reliable, independent tests. Here are proven patterns:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// tests/fixtures/test-data.json
// Static test data for reference values
{
  "validCreditCard": {
    "number": "4242424242424242",
    "expiry": "12/30",
    "cvc": "123"
  },
  "addresses": {
    "us": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "uk": {
      "street": "10 Downing Street",
      "city": "London",
      "postcode": "SW1A 2AA"
    }
  }
}

// Loading test data in tests:
import testData from '../fixtures/test-data.json';

test('checkout with US address', async ({ page }) => {
  const { street, city, state, zip } = testData.addresses.us;
  await page.getByLabel('Street').fill(street);
  await page.getByLabel('City').fill(city);
  // ...
});</code></pre>
        </div>

        <h3>Environment-Specific Configurations</h3>
        <p>Most projects need to test against different environments (development, staging, production). Use environment variables and config patterns to handle this cleanly:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const envFile = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, \`./env/.\${envFile}.env\`) });

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      'X-API-Key': process.env.API_KEY || '',
    },
  },
});

// Then run with:
// TEST_ENV=staging npx playwright test
// TEST_ENV=prod npx playwright test</code></pre>
        </div>

        <h3>Using .env Files with dotenv</h3>
        <p>Create separate environment files for each target environment:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Environment Files</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># env/.dev.env
BASE_URL=http://localhost:3000
API_KEY=dev-key-12345
DB_CONNECTION=postgresql://localhost:5432/app_dev

# env/.staging.env
BASE_URL=https://staging.example.com
API_KEY=staging-key-67890
DB_CONNECTION=postgresql://staging-db:5432/app_staging

# env/.prod.env
BASE_URL=https://www.example.com
API_KEY=prod-key-readonly
# No DB access in production tests!</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Never commit .env files with real secrets to version control. Use a secrets manager or CI environment variables for sensitive data. Add \`.env\` files to \`.gitignore\` and provide a \`.env.example\` template instead.</div>

        <div class="tip-box"><strong>💡 Tip:</strong> Install dotenv with \`npm install -D dotenv\` and load it at the top of your config file. This pattern lets you keep environment configuration clean and separate from test code.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the recommended approach for grouping tests in a large project?',
            options: [
              'Put all tests in a single file',
              'Group by feature or user flow',
              'Group alphabetically',
              'Group by developer who wrote them'
            ],
            correct: 1,
            explanation: 'Grouping tests by feature or user flow aligns with how stakeholders think about the application and makes it easy to find and maintain related tests.'
          },
          {
            question: 'How should you handle environment-specific configurations in Playwright?',
            options: [
              'Hardcode URLs in test files',
              'Use separate config files for each environment',
              'Use environment variables with .env files and dotenv',
              'Only test against production'
            ],
            correct: 2,
            explanation: 'Using environment variables with .env files and the dotenv package is the recommended pattern. It keeps configuration separate from test code and makes switching environments easy.'
          },
          {
            question: 'Why should you extract common patterns into shared helper functions?',
            options: [
              'To make tests longer',
              'To make tests harder to read',
              'To keep tests DRY, maintainable, and consistent',
              'Playwright requires it'
            ],
            correct: 2,
            explanation: 'Extracting common patterns into helpers keeps tests DRY (Don\'t Repeat Yourself), makes them easier to maintain, and ensures consistent behavior across the test suite.'
          }
        ]
      }
    },
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      content: `
        <h2>Performance Optimization</h2>
        <p>A fast test suite is a productive test suite. Slow tests waste developer time, delay deployments, and discourage frequent testing. This section covers proven strategies for optimizing Playwright test execution time while maintaining reliability.</p>

        <h3>Reusing Authentication State</h3>
        <p>Logging in via the UI for every test is one of the biggest performance drains. Instead, authenticate once and save the browser state (cookies, localStorage) for reuse across tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project: runs first, performs login
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.ts/,
    },
    // Main tests: depend on setup, use stored auth state
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});

// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Login via UI — this runs only ONCE
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for auth to complete
  await page.waitForURL('/dashboard');

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});

// Now ALL tests in the 'chromium' project start authenticated!
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads for authenticated user', async ({ page }) => {
  // No login needed — storageState is automatically applied
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome, Admin')).toBeVisible();
});</code></pre>
        </div>

        <div class="tip-box"><strong>💡 Tip:</strong> For multiple user roles (admin, regular user, viewer), create separate setup projects and storage state files. Then assign tests to the appropriate project based on which role they need.</div>

        <h3>Parallelization Strategies</h3>
        <p>Beyond the basic <code>fullyParallel</code> flag, consider these strategies for maximizing parallelism:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts — Optimized parallelization
import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined, // 4 workers in CI, auto locally

  projects: [
    // Run smoke tests first, fast feedback
    {
      name: 'smoke',
      testMatch: /.*\\.smoke\\.spec\\.ts/,
      fullyParallel: true,
    },
    // Then run the full suite
    {
      name: 'full',
      testIgnore: /.*\\.smoke\\.spec\\.ts/,
      fullyParallel: true,
      dependencies: ['smoke'], // Only run if smoke tests pass
    },
  ],
});</code></pre>
        </div>

        <h3>Minimizing Browser Launches</h3>
        <p>Each browser launch adds overhead. Structure your fixtures to minimize unnecessary browser/context creation:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test as base } from '@playwright/test';

// Share a browser context across tests when appropriate
const test = base.extend({
  // Worker-scoped: one shared context per worker
  sharedContext: [async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  // Test-scoped page from the shared context
  sharedPage: async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage();
    await use(page);
    await page.close();
  },
});</code></pre>
        </div>

        <h3>Using API for Data Setup Instead of UI</h3>
        <p>One of the most impactful performance optimizations is to use API calls for test data setup instead of clicking through the UI. API calls are orders of magnitude faster than UI interactions:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>import { test, expect } from '@playwright/test';

// SLOW: Setting up data through UI
test.skip('create product via UI (slow)', async ({ page }) => {
  await page.goto('/admin/products/new');
  await page.getByLabel('Name').fill('Test Product');
  await page.getByLabel('Price').fill('29.99');
  await page.getByLabel('Description').fill('A test product');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(/products\\/\\d+/);
  // ... took 3-5 seconds just for setup
});

// FAST: Setting up data through API
test('create product via API (fast)', async ({ page, request }) => {
  // Create test data via API — takes ~100ms
  const response = await request.post('/api/products', {
    data: {
      name: 'Test Product',
      price: 29.99,
      description: 'A test product',
    },
  });
  const product = await response.json();

  // NOW test the UI that displays the product
  await page.goto(\`/products/\${product.id}\`);
  await expect(page.getByText('Test Product')).toBeVisible();
  await expect(page.getByText('$29.99')).toBeVisible();
});</code></pre>
        </div>

        <h3>Selective Test Execution</h3>
        <p>Running only the tests you need drastically reduces feedback time during development:</p>
        <div class="code-block" data-language="bash">
          <div class="code-header"><span>Bash</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code># Run tests matching a pattern
npx playwright test --grep "login"
npx playwright test --grep "checkout"

# Exclude tests matching a pattern
npx playwright test --grep-invert "slow"

# Run tests with specific tags (using @tag in test title)
npx playwright test --grep "@smoke"
npx playwright test --grep "@critical"

# Run a specific test file
npx playwright test tests/auth/login.spec.ts

# Run only changed tests (requires git integration)
npx playwright test --changed</code></pre>
        </div>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Use tags in test titles for filtering
test('@smoke login with valid credentials', async ({ page }) => {
  // This test can be run with: npx playwright test --grep "@smoke"
});

test('@critical checkout complete flow', async ({ page }) => {
  // This runs with: npx playwright test --grep "@critical"
});

test('@slow full report generation', async ({ page }) => {
  // Exclude with: npx playwright test --grep-invert "@slow"
});</code></pre>
        </div>

        <h3>Test Retries and Flaky Test Handling</h3>
        <p>Flaky tests — tests that sometimes pass and sometimes fail — erode trust in your test suite. Playwright provides retries and tools to manage flakiness:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Retry failed tests in CI (helps with flaky infrastructure)
  retries: process.env.CI ? 2 : 0,

  use: {
    // Capture trace on first retry for debugging
    trace: 'on-first-retry',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    // Record video on first retry
    video: 'on-first-retry',
  },
});

// In tests: mark known flaky tests
test('sometimes flaky network test', async ({ page }) => {
  test.fixme(true, 'This test is flaky due to third-party API — tracking in JIRA-123');
  // ... test code
});

// Skip tests conditionally
test('only on CI', async ({ page }) => {
  test.skip(!process.env.CI, 'This test only runs in CI');
  // ...
});</code></pre>
        </div>

        <div class="warning-box"><strong>⚠️ Warning:</strong> Retries are a safety net, not a solution. If a test frequently needs retries, investigate and fix the root cause of the flakiness. Common causes include timing issues (use proper waits), shared state (ensure test isolation), and network dependencies (mock external APIs).</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the most impactful performance optimization for test data setup?',
            options: [
              'Using faster typing speed for form fills',
              'Reducing the number of assertions',
              'Using API calls for data setup instead of UI interactions',
              'Running fewer tests'
            ],
            correct: 2,
            explanation: 'Using API calls for test data setup is orders of magnitude faster than clicking through the UI. A REST API call takes ~100ms compared to 3-5 seconds of UI interaction for the same result.'
          },
          {
            question: 'How do you run only tests tagged with @smoke in Playwright?',
            options: [
              'npx playwright test --tag smoke',
              'npx playwright test --grep "@smoke"',
              'npx playwright test --filter smoke',
              'npx playwright test --only smoke'
            ],
            correct: 1,
            explanation: 'The --grep flag filters tests by matching against test titles. Using --grep "@smoke" runs only tests with @smoke in their title.'
          }
        ]
      }
    },
    {
      id: 'real-world-project',
      title: 'Real-World Project Setup',
      content: `
        <h2>Real-World Project Setup</h2>
        <p>This section brings everything together into a complete, production-ready Playwright project. We'll cover the recommended folder structure, a comprehensive configuration file, multi-environment support, custom reporters, and global setup/teardown patterns that you can adapt for your own projects.</p>

        <h3>Complete Project Structure</h3>
        <p>Here's a recommended folder structure for a mature Playwright project that balances organization with practicality:</p>
        <div class="code-block" data-language="text">
          <div class="code-header"><span>Project Structure</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>project-root/
├── playwright.config.ts          # Main configuration
├── package.json
├── .env.example                  # Template for env variables
├── env/
│   ├── .dev.env                  # Development environment
│   ├── .staging.env              # Staging environment
│   └── .prod.env                 # Production environment
├── tests/
│   ├── auth.setup.ts             # Authentication setup project
│   ├── e2e/                      # End-to-end tests
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── register.spec.ts
│   │   │   └── logout.spec.ts
│   │   ├── products/
│   │   │   ├── browse.spec.ts
│   │   │   ├── search.spec.ts
│   │   │   └── detail.spec.ts
│   │   ├── checkout/
│   │   │   ├── cart.spec.ts
│   │   │   ├── shipping.spec.ts
│   │   │   └── payment.spec.ts
│   │   └── admin/
│   │       ├── dashboard.spec.ts
│   │       └── users.spec.ts
│   ├── visual/                   # Visual regression tests
│   │   └── screenshots.spec.ts
│   └── a11y/                     # Accessibility tests
│       └── audit.spec.ts
├── src/
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ProductPage.ts
│   │   └── CheckoutPage.ts
│   ├── fixtures/                 # Custom fixtures
│   │   ├── base.ts               # Extended test with all fixtures
│   │   ├── auth.fixture.ts
│   │   └── data.fixture.ts
│   ├── helpers/                  # Utility functions
│   │   ├── api-helpers.ts
│   │   ├── test-data.ts
│   │   └── assertions.ts
│   └── reporters/                # Custom reporters
│       └── slack-reporter.ts
├── playwright/
│   └── .auth/                    # Stored auth state (gitignored)
│       └── user.json
├── test-results/                 # Test outputs (gitignored)
├── playwright-report/            # HTML reports (gitignored)
└── blob-report/                  # Shard reports for CI (gitignored)</code></pre>
        </div>

        <h3>Combining All Patterns: POM + Fixtures + Config</h3>
        <p>Here's how to wire Page Object Models and custom fixtures together into a unified test framework:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// src/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly toastNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.footer = page.locator('footer');
    this.toastNotification = page.locator('.toast');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getToastMessage() {
    await this.toastNotification.waitFor({ state: 'visible' });
    return this.toastNotification.textContent();
  }
}

// src/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }
}

// src/fixtures/base.ts — Central fixture file
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend&lt;MyFixtures&gt;({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';

// tests/e2e/checkout/cart.spec.ts — Usage
import { test, expect } from '../../../src/fixtures/base';

test('add product and proceed to checkout', async ({ productPage, checkoutPage }) => {
  await productPage.goto('/products/1');
  await productPage.addToCart();
  await productPage.goToCart();

  await expect(checkoutPage.cartItems).toHaveCount(1);
  await checkoutPage.proceedToCheckout();
});</code></pre>
        </div>

        <h3>Multi-Environment Setup (Dev, Staging, Prod)</h3>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts — Multi-environment support
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
const env = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, \`./env/.\${env}.env\`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [
        ['blob'],
        ['list'],
        ['./src/reporters/slack-reporter.ts'],
      ]
    : [['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    extraHTTPHeaders: {
      'X-Test-Environment': env,
    },
  },

  projects: [
    // Auth setup
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },

    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      dependencies: ['setup'],
    },
  ],
});</code></pre>
        </div>

        <h3>Custom Reporter for Slack Notifications</h3>
        <p>Custom reporters let you integrate test results with team communication tools. Here's a Slack reporter that posts a summary after each test run:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// src/reporters/slack-reporter.ts
import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

class SlackReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private failures: { title: string; error: string }[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    switch (result.status) {
      case 'passed':
        this.passed++;
        break;
      case 'failed':
      case 'timedOut':
        this.failed++;
        this.failures.push({
          title: test.title,
          error: result.error?.message || 'Unknown error',
        });
        break;
      case 'skipped':
        this.skipped++;
        break;
    }
  }

  async onEnd(result: FullResult) {
    const total = this.passed + this.failed + this.skipped;
    const emoji = this.failed === 0 ? '✅' : '❌';
    const status = this.failed === 0 ? 'PASSED' : 'FAILED';

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: \`\${emoji} Test Suite \${status}\`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: \`*Total:* \${total}\` },
            { type: 'mrkdwn', text: \`*Passed:* \${this.passed}\` },
            { type: 'mrkdwn', text: \`*Failed:* \${this.failed}\` },
            { type: 'mrkdwn', text: \`*Skipped:* \${this.skipped}\` },
            { type: 'mrkdwn', text: \`*Duration:* \${(result.duration / 1000).toFixed(1)}s\` },
          ],
        },
      ],
    };

    // Add failure details
    if (this.failures.length > 0) {
      const failureText = this.failures
        .slice(0, 5) // Show max 5 failures
        .map(f => \`• \${f.title}: \${f.error.substring(0, 100)}\`)
        .join('\\n');

      message.blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: \`*Failed Tests:*\\n\${failureText}\` },
      });
    }

    // Send to Slack webhook
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    }
  }
}

export default SlackReporter;</code></pre>
        </div>

        <h3>Global Setup and Teardown Patterns</h3>
        <p>Global setup runs once before all tests; global teardown runs once after all tests complete. Use these for expensive one-time operations like seeding databases or starting services:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  // ... rest of config
});

// global-setup.ts
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Global Setup: Starting...');

  // Seed the database with test data
  const response = await fetch(\`\${process.env.BASE_URL}/api/test/seed\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fixture: 'full-test-data' }),
  });

  if (!response.ok) {
    throw new Error('Failed to seed database');
  }

  // Store data that tests might need
  process.env.SEED_DATA_ID = (await response.json()).seedId;

  console.log('✅ Global Setup: Complete');
}

export default globalSetup;

// global-teardown.ts
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Global Teardown: Cleaning up...');

  // Clean up test data
  await fetch(\`\${process.env.BASE_URL}/api/test/cleanup\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seedId: process.env.SEED_DATA_ID }),
  });

  console.log('✅ Global Teardown: Complete');
}

export default globalTeardown;</code></pre>
        </div>

        <h3>Test Coverage Tracking</h3>
        <p>While Playwright doesn't have built-in code coverage, you can integrate with tools like Istanbul/nyc to track which application code is exercised by your E2E tests:</p>
        <div class="code-block" data-language="javascript">
          <div class="code-header"><span>JavaScript</span><button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
          <pre><code>// Collecting coverage via V8 (Chromium only)
import { test, expect } from '@playwright/test';

test('collect code coverage', async ({ page, browserName }) => {
  // V8 coverage only works in Chromium
  test.skip(browserName !== 'chromium', 'Coverage only supported in Chromium');

  // Start collecting JS coverage
  await page.coverage.startJSCoverage();

  // Run your test
  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Get Started' }).click();
  // ... more interactions

  // Stop and get coverage data
  const coverage = await page.coverage.stopJSCoverage();

  // Process coverage data (e.g., save to file for later analysis)
  const coverageData = coverage.map(entry => ({
    url: entry.url,
    functions: entry.functions,
  }));

  // Save coverage report
  const fs = require('fs');
  fs.writeFileSync(
    'coverage/e2e-coverage.json',
    JSON.stringify(coverageData, null, 2)
  );
});</code></pre>
        </div>

        <div class="info-box"><strong>ℹ️ Note:</strong> E2E test coverage differs from unit test coverage. Rather than aiming for line-by-line coverage, focus on verifying that critical user paths and business logic are exercised by your E2E tests. Use coverage data to identify untested areas, not as a target metric.</div>

        <div class="tip-box"><strong>💡 Tip:</strong> Start with this project structure as a template and adapt it to your team's needs. The key principles are: separate concerns (pages, fixtures, helpers), keep tests independent, use environment variables for configuration, and automate everything in CI.</div>
      `,
      quiz: {
        questions: [
          {
            question: 'What is the purpose of a global setup file in Playwright?',
            options: [
              'To configure each test individually',
              'To run expensive one-time operations before all tests (e.g., database seeding)',
              'To install browser dependencies',
              'To define test fixtures'
            ],
            correct: 1,
            explanation: 'Global setup runs once before all tests, making it ideal for expensive one-time operations like database seeding, starting services, or creating shared resources.'
          },
          {
            question: 'What is the recommended approach for organizing Page Object Models in a project?',
            options: [
              'Put all POMs in a single file',
              'Put POMs in the same directory as tests',
              'Put POMs in a dedicated src/pages/ directory with a base class',
              'POMs should not be used in real projects'
            ],
            correct: 2,
            explanation: 'Placing POMs in a dedicated src/pages/ directory with a shared BasePage class keeps them organized, reusable, and separate from test files.'
          },
          {
            question: 'How should sensitive environment variables be managed in a Playwright project?',
            options: [
              'Hardcode them in the config file',
              'Commit .env files to version control',
              'Use a secrets manager or CI environment variables; add .env to .gitignore',
              'Store them in test files'
            ],
            correct: 2,
            explanation: 'Sensitive values should never be committed to version control. Use a secrets manager or CI environment variables, and add .env files to .gitignore with a .env.example template.'
          }
        ]
      }
    }
  ]
});
