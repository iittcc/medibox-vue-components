# ✅ CodeIgniter 4 Testing Rules for Code-Generation LLMs

## 🧠 Overview

CodeIgniter 4 extends PHPUnit with its own framework-aware tools. When generating tests, **use CodeIgniter's built-in testing utilities** (not raw PHPUnit style). Tests must simulate full application behavior via CodeIgniter’s helpers and traits.

---

## 📐 Core Rules

### 1. **Use the Correct Base Class**

All tests must extend:

```php
use CodeIgniter\Test\CIUnitTestCase;
```

Never use PHPUnit's `TestCase` directly. This gives access to CI-specific tools, request simulation, service injection, trait-based setup, and more.

---

### 2. **Use CI Testing Traits**

Use the appropriate trait(s) for the test type:

- `ControllerTestTrait`: for unit testing controllers
- `FeatureTestTrait`: for simulating full HTTP requests (like `$this->get()` / `$this->post()`)
- `DatabaseTestTrait`: for DB-related tests with migrations/rollback
- `EventTestTrait`: for checking triggered events

CI will automatically call the trait-specific `setUp*()` and `tearDown*()` methods.

---

### 3. **Match Application Namespace in Test Classes**

> ✅ **Test classes should use the same namespace as the class under test**, even if the test files live in `tests/`.

#### ✅ Correct Example:

```php
// File: tests/app/Controllers/FooControllerTest.php
namespace App\Controllers;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\ControllerTestTrait;

class FooControllerTest extends CIUnitTestCase
{
    use ControllerTestTrait;

    public function testIndex()
    {
        $result = $this->controller(FooController::class)->execute('index');
        $this->assertTrue($result->isOK());
    }
}
```

#### 🚫 Incorrect:

```php
namespace Tests\Feature; // ❌ This will break controller routing and filters
```

This behavior is different from other frameworks like Laravel/Symfony where `Tests\Feature` or `Tests\Unit` is standard.

---

### 4. **Simulate Requests Properly**

For **controller testing**, use:

```php
$this->withRequest($request)
     ->withUri('http://localhost/resource')
     ->controller(MyController::class)
     ->execute('method');
```

For **feature tests**, use:

```php
$response = $this->get('/my/path');
```

Use `$this->withBody()`, `$this->withSession()`, `$this->withHeaders()`, etc. to configure the request before making the call.

---

### 5. **Database-Aware Tests**

Use `DatabaseTestTrait` and configure:

```php
protected $refresh = true; // Run fresh migrations per test
protected $seed = 'MySeeder'; // Seed initial data if needed
```

Use CI assertions:

```php
$this->seeInDatabase('users', ['email' => 'foo@bar.com']);
$this->dontSeeInDatabase(...);
```

Database changes are rolled back automatically after each test.

---

### 6. **Use CodeIgniter’s Assertions and Helpers**

Prefer:

- `$this->assertHeaderEmitted()`
- `$this->assertEventTriggered()`
- `$this->assertLogged()`
- `$this->seeInDatabase()`

These are aware of the CI framework internals.

---

### 7. **Always Call `parent::setUp()` and `parent::tearDown()`**

When overriding:

```php
protected function setUp(): void
{
    parent::setUp(); // ✅ Required
    // your setup code
}
```

This ensures traits, services, routes, and config are bootstrapped.

---

## ✅ Summary

| Area                 | CodeIgniter 4                     | Conventional PHPUnit                  |
|----------------------|----------------------------------|----------------------------------------|
| Base class           | `CIUnitTestCase`                 | `PHPUnit\Framework\TestCase`         |
| Namespacing          | Match `App\...` exactly          | `Tests\Unit`, `Tests\Feature`, etc.  |
| Routing              | Simulated via `controller()`     | Usually mocked manually               |
| Request Simulation   | `withRequest()`, `call()`, etc.  | None built-in                         |
| Database Testing     | `DatabaseTestTrait` + rollback   | Manual setup/teardown                 |

---

## 🧩 8. CI Services and Mocks

CodeIgniter services (from `Config\Services`) are globally shared and often injected automatically. During tests, you must **reset or replace services manually** if you want to mock them.

### 🔁 Resetting Services

```php
\Config\Services::reset(); // Clear all cached services
```

Call this in `setUp()` to ensure a clean state before each test if your tests rely on shared services.

### 🧪 Injecting Mocks

You can override any service using `Services::injectMock()`:

```php
use Tests\Support\Mocks\MockSession;

\Config\Services::injectMock('session', new MockSession());
```

> This replaces `service('session')` globally with the mock version.

### 🧱 Mocking Dependencies Cleanly

Instead of hardcoding `new Foo()` in your app code, **use dependency injection** and **fetch services via `service('foo')` or `Services::foo()`**. This allows your tests to inject mocks seamlessly.

```php
$this->fooService = service('foo'); // ✅ mockable
```

If you use `new FooService()` directly, mocking becomes difficult.

### ✅ Best Practices

- Call `Services::reset()` in `tearDown()` to avoid cross-test contamination.
- Mock services before controller execution, e.g. before `$this->controller()->execute()`.
- Use CodeIgniter’s test doubles (in `Tests\Support\Mocks`) where available.

---

