---
description: Enforce best practices and structure for writing PHPUnit tests
globs: ["*.php"]
---

# PHPUnit Test Best Practices (PHPUnit 10.5+/11.x, PHP 8.2+)

## Quick Reference Table
| Do                                      | Don't                        |
|------------------------------------------|------------------------------|
| Use `#[Test]` attribute                  | Use `@test` annotation       |
| Use `PHPUnit\\Framework\\TestCase`         | Use `PHPUnit_Framework_TestCase` |
| Use `assertSame()`                       | Use `assertEquals()`         |
| Use data providers for variations        | Use logic/loops in tests     |
| Use descriptive, behavior-driven names   | Use generic names like `testSomething` |

---

## Minimum Requirements
- PHPUnit: 11.x
- PHP: 8.2

---

## ❌ Forbidden Patterns (Reject)
- `function test[A-Z]`: Test method names should use snake_case and be annotated with `#[Test]`.
- `@test`: Do not use `@test` annotations; use `#[Test]` attributes.
- `extends PHPUnit_Framework_TestCase`: Use `PHPUnit\\Framework\\TestCase` instead.

---

## ✅ Best Practices (Suggest)
- **Test Class Naming**: End with `Test` and extend `PHPUnit\\Framework\\TestCase`.
- **Test Method Naming**: Use `#[Test]` and descriptive, behavior-driven names (e.g., `it_creates_a_user`).
- **Assertions**: Use strict assertions (`assertSame`, `assertTrue`, etc.).
- **Arrange-Act-Assert**: Structure each test clearly.
- **Data Providers**: Use for input variations.
- **Test Doubles**: Use `createMock`, `createStub` as appropriate.
- **Setup/TearDown**: Use `setUp()`/`tearDown()` for reusable initialization/cleanup.
- **Group Tests**: Use `#[Group('unit')]`, `#[Group('integration')]` as needed.
- **Edge Cases**: Test both happy path and edge/failure cases.
- **No Logic in Tests**: Avoid loops/conditionals in test methods.
- **Type Safety**: Use `declare(strict_types=1)` and type hints.
- **No Deprecated Features**: Do not use deprecated features (e.g., `@test`, `assertEquals`).
- **No Real System Time**: Use clock abstraction for time-based tests.
- **No Global State Pollution**: Reset shared state in `tearDown()`.

---

## ⚠️ Common Pitfalls
- Do not use deprecated features (e.g., `@test`, `assertEquals`).
- Do not rely on real system time; use clock abstraction.
- Do not pollute global state between tests.

---

## ℹ️ Why These Rules?
To ensure tests are maintainable, future-proof, and provide clear, actionable feedback on failure.

---

## Example
```php
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\Group;

final class UserServiceTest extends TestCase
{
    protected function setUp(): void
    {
        // common setup
    }

    #[Test]
    #[Group('unit')]
    public function it_creates_a_user(): void
    {
        $service = new UserService();
        $user = $service->create('Alice');
        $this->assertSame('Alice', $user->getName());
    }
}
```

<rule>
name: phpunit-test-best-practices
description: Ensure PHPUnit test classes follow structure and best practices per PHPUnit 10.5, including class naming, annotations, and assertions.

filters:
  - type: file_extension
    pattern: "\\.php$"
  - type: content
    pattern: "class\\s+\\w+Test\\s+extends\\s+TestCase"
  - type: location
    pattern: "\app\application\tests\"
actions:
  - type: reject
    conditions:
      - pattern: "function\\s+test[A-Z]"
        message: "Test method names should use Pascal Case and be annotated with #[Test] in PHPUnit 10+"
      - pattern: "@test"
        message: "Avoid @test annotations; use #[Test] attributes in PHPUnit 10+"
      - pattern: "extends\\s+PHPUnit_Framework_TestCase"
        message: "Outdated base class. Use PHPUnit\\Framework\\TestCase instead."
  
  - type: suggest
    message: |
      Goal:
      - Your ultimate objective is to create a robust, complete test suite for the provided PHP code to test the real code.
      
      Guidelines:
      - **Implement the AAA Pattern**: Implement the Arrange-Act-Assert (AAA) paradigm in each test, establishing necessary preconditions and inputs (Arrange), executing the object or method under test (Act), and asserting the results against the expected outcomes (Assert).
      - **Test the Happy Path and Failure Modes**: Your tests should not only confirm that the code works under expected conditions (the 'happy path') but also how it behaves in failure modes.
      - **Testing Edge Cases**: Go beyond testing the expected use cases and ensure edge cases are also tested to catch potential bugs that might not be apparent in regular use.
      - **Avoid Logic in Tests**: Strive for simplicity in your tests, steering clear of logic such as loops and conditionals, as these can signal excessive test complexity.
      - **Leverage PHP's Type System**: Leverage static typing to catch potential bugs before they occur, potentially reducing the number of tests needed.
      - **Write Complete Test Cases**: Avoid writing test cases as mere examples or code skeletons. You have to write a complete set of tests. They should effectively validate the functionality under test.


      Follow PHPUnit 11.5 best practices:
      - **Use PHP 8+ native attributes**: `#[Test]` to denote test methods.
      - **Use One Assertion Per Test (When Possible)**: Improves granularity and readability of failures. If multiple assertions are needed, they should validate logically related behavior.
      - **Use Data Providers for Test Variations**: `#[DataProvider('provideInput')]`
      ```php
        #[DataProvider('provideInput')]
        public function testSomething($input, $expected): void
        {
            $this->assertSame($expected, doSomething($input));
        }

        public static function provideInput(): array
        {
            return [
                ['abc', 'ABC'],
                ['123', '123'],
            ];
        }
        ```
      - **Use Test Doubles (Mock/Stubs) Thoughtfully**: Don't mock values you don't control (e.g., DateTimeImmutable). Prefer dependency injection for testability.
        - Test Stubs (PHPUnit v11.5)
            - Valid methods for creating stubs:
                - `createStub(string $type)`
                - `createStubForIntersectionOfInterfaces(array $interfaces)`
                - `createConfiguredStub()`
            - Valid methods for configuring stubs:
                - `willReturn()`
                - `willThrowException()`
                - `willReturnArgument()`
                - `willReturnCallback()`
                - `willReturnSelf()`
                - `willReturnMap()`
        - Mock Objects (PHPUnit v11.5)
            - Valid methods for creating Mock Objects:
                - `createMock(string $type)`
                - `createMockForIntersectionOfInterfaces(array $interfaces)`
                - `createConfiguredMock()`
            - Valid methods for configuring Mock Object:
                - `setConstructorArgs(array $args)`
                - `disableOriginalConstructor()`
                - `enableOriginalConstructor()`
                - `disableOriginalClone()`
                - `enableOriginalClone()`
                - `disableAutoReturnValueGeneration()`
                - `enableAutoReturnValueGeneration()`
                - `onlyMethods(array $methods)`
                - `getMock()`
      - **Use Clock Abstraction for Time-Based Tests**: Avoid sleep() or relying on real system time. Inject a ClockInterface and mock return values.
      - **Use Clear and Descriptive Test Names**: Use behavior-driven naming: it_does_something_under_certain_condition.
        ```php
        #[Test]
        public function it_calculates_tax_for_norwegian_customer(): void
        ```
      - **Use expectException(), expectExceptionMessage(), etc., to test for failures explicitly.**
        ```php
        #[Test]
        public function it_throws_when_input_is_invalid(): void
        {
            $this->expectException(InvalidArgumentException::class);
            $this->service->process('bad_input');
        }
        ```
      - Test class names should end with `Test` and extend `PHPUnit\Framework\TestCase`.
      - **Clean Up Deprecated Features**:
        - PHPUnit 11.x removes or deprecates many older features:
            - No support for @test annotations.
            - Deprecated assertions like assertEquals() in favor of strict versions.
        - Use strict assertions: `$this->assertSame()`, `$this->assertTrue()`, etc.
      - **Use TestCase Subclasses for Custom Assertions**: DRY and reusable helpers
      ```php
        class BaseTestCase extends TestCase
        {
            protected function assertIsUuid(string $uuid): void
            {
                $this->assertMatchesRegularExpression('/^[0-9a-f-]{36}$/', $uuid);
            }
        }
      ```
      - **Group tests logically** using `#[Group('unit')]`, `#[Group('integration')]`, etc.
      - Use setup/teardown methods for reusable initialization with `protected function setUp(): void`
      - Use declare(strict_types=1), InvalidArgumentException, Error, TypeError when testing invalid assignments.
      - **Reset Shared State in tearDown()**: Clear mocks, files, globals, caches, etc. to prevent test pollution.

      

      Example:
      ```php
      use PHPUnit\Framework\TestCase;
      use PHPUnit\Framework\Attributes\Test;
      use PHPUnit\Framework\Attributes\Group;

      final class UserServiceTest extends TestCase
      {
          protected function setUp(): void
          {
              // common setup
          }

          #[Test]
          #[Group('unit')]
          public function it_creates_a_user(): void
          {
              $service = new UserService();
              $user = $service->create('Alice');
              $this->assertSame('Alice', $user->getName());
          }
      }
      ```

examples:
  - input: |
      class UserServiceTest extends TestCase {
          /** @test */
          public function itCreatesAUser() {
              $this->assertEquals('Alice', 'Alice');
          }
      }
  - output: |
      use PHPUnit\Framework\TestCase;
      use PHPUnit\Framework\Attributes\Test;

      final class UserServiceTest extends TestCase {
          #[Test]
          public function it_creates_a_user(): void {
              $this->assertSame('Alice', 'Alice');
          }
      }

metadata:
  priority: high
  version: 1.0
  tags:
    - php
    - phpunit
    - testing
    - best-practices
</rule>
