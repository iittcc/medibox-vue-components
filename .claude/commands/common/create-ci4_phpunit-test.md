# /create-phpunit-test

Generate PHPUnit tests for CodeIgniter 4 controllers, models, and APIs following established best practices and avoiding common pitfalls.

## Usage

```
/create-phpunit-test [controller|model|api|feature] [ClassName]
```

## Task

<task>
You are a PHPUnit test generation specialist for CodeIgniter 4 applications. Create comprehensive test suites that follow CI4 testing best practices, handle common pitfalls, and ensure reliable test coverage.
</task>

<context>
Key References:
- Testing Guide: @/docs/CodeIgniter4-Testing-Guide.md  
- Project Structure: @/backend/tests/
- Lessons Learned: @/docs/LESSONSLEARNED.md (Backend Unit Testing section)
</context>

## Test Generation Process

### Phase 1: Analyze Target

**Identify Test Requirements**
- Determine test type (unit, feature, or integration)
- Analyze class/controller methods to test
- Identify dependencies and mock requirements
- Check for existing tests to avoid duplication

**Code Analysis**
```bash
# Find the target file
fd "{{ClassName}}" backend/app/

# Analyze class structure
rg "public function" backend/app/{{Type}}/{{ClassName}}.php

# Check for existing tests
fd "{{ClassName}}Test" backend/tests/
```

### Phase 2: Test Structure Setup

**Generate Test Class Based on Type**

#### For Controllers (Feature Tests):
```php
namespace Tests\Feature;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\FeatureTestTrait;
use Tests\Support\Traits\ApiTestTrait;

class {{ClassName}}Test extends CIUnitTestCase
{
    use FeatureTestTrait;
    use ApiTestTrait; // Custom trait for API assertions
    
    protected $migrate = true;
    protected $refresh = true;
    protected $seed = 'TestSeeder';
    
    protected function setUp(): void
    {
        parent::setUp();
        // Create test user for authentication
        $this->createTestUser();
    }
    
    protected function tearDown(): void
    {
        parent::tearDown();
    }
}
```

#### For Models (Unit Tests):
```php
namespace Tests\Unit\Models;

use CodeIgniter\Test\CIUnitTestCase;
use App\Models\{{ClassName}};

class {{ClassName}}Test extends CIUnitTestCase
{
    protected $migrate = true;
    protected $refresh = true;
    
    private {{ClassName}} $model;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->model = new {{ClassName}}();
    }
}
```

### Phase 3: Test Method Generation

**CRUD Operation Tests**

```php
// CREATE Tests
public function testCreateReturnsSuccessWithValidData()
{
    $data = $this->getValid{{Entity}}Data();
    
    $result = $this->withSession()->post('api/{{endpoint}}', $data);
    
    $result->assertStatus(201);
    $this->assertSuccessResponse($result);
    
    // Verify database
    $this->seeInDatabase('{{table}}', [
        'name' => $data['name']
    ]);
}

public function testCreateFailsWithInvalidData()
{
    $data = []; // Invalid empty data
    
    $result = $this->withSession()->post('api/{{endpoint}}', $data);
    
    $result->assertStatus(422);
    $this->assertErrorResponse($result, 422);
}

// READ Tests
public function testIndexReturnsSuccessResponse()
{
    // Create test data
    $this->createTest{{Entity}}();
    
    $result = $this->withSession()->get('api/{{endpoint}}');
    
    $result->assertStatus(200);
    $this->assertSuccessResponse($result);
    
    $data = json_decode($result->getJSON(), true);
    $this->assertIsArray($data['data']);
    $this->assertNotEmpty($data['data']);
}

// UPDATE Tests
public function testUpdateReturnsSuccessWithValidData()
{
    $entity = $this->createTest{{Entity}}();
    $updateData = ['name' => 'Updated Name'];
    
    $result = $this->withSession()->put("api/{{endpoint}}/{$entity['id']}", $updateData);
    
    $result->assertStatus(200);
    $this->assertSuccessResponse($result);
    
    // Verify database update
    $this->seeInDatabase('{{table}}', [
        'id' => $entity['id'],
        'name' => 'Updated Name'
    ]);
}

// DELETE Tests
public function testDeleteReturnsSuccessForExistingRecord()
{
    $entity = $this->createTest{{Entity}}();
    
    $result = $this->withSession()->delete("api/{{endpoint}}/{$entity['id']}");
    
    $result->assertStatus(200);
    $this->assertSuccessResponse($result);
    
    // Verify deletion
    $this->dontSeeInDatabase('{{table}}', [
        'id' => $entity['id']
    ]);
}
```

### Phase 4: Common Pitfall Handlers

**Input Format Flexibility**
```php
// In test helper methods
protected function makeRequest(string $method, string $uri, array $data = [])
{
    // Handle both JSON and form data
    if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
        return $this->withSession()
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->call($method, $uri, json_encode($data));
    }
    
    return $this->withSession()->call($method, $uri);
}
```

**Response Parsing**
```php
protected function getResponseData($result): array
{
    // Always parse JSON response
    $json = $result->getJSON();
    $this->assertIsString($json, 'Response should be JSON string');
    
    $data = json_decode($json, true);
    $this->assertIsArray($data, 'Decoded response should be array');
    
    return $data;
}
```

**CORS Testing**
```php
public function testOptionsRequestReturnsCorsHeaders()
{
    $result = $this->call('options', 'api/{{endpoint}}');
    
    $this->assertCorsHeaders($result);
}
```

### Phase 5: Test Data Management

**Create Test Seeders**
```php
// tests/_support/Seeds/{{Entity}}TestSeeder.php
namespace Tests\Support\Seeds;

use CodeIgniter\Database\Seeder;

class {{Entity}}TestSeeder extends Seeder
{
    public function run()
    {
        // Create parent dependencies first
        $this->db->table('users')->insert([
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'active' => 1
        ]);
        
        // Create test entities
        $data = [
            [
                'id' => 1,
                'name' => 'Test {{Entity}} 1',
                'created_by' => 1,
                'created_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => 2,
                'name' => 'Test {{Entity}} 2',
                'created_by' => 1,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
        
        $this->db->table('{{table}}')->insertBatch($data);
    }
}
```

**Test Helper Traits**
```php
// tests/_support/Traits/{{Entity}}TestTrait.php
namespace Tests\Support\Traits;

trait {{Entity}}TestTrait
{
    protected function getValid{{Entity}}Data(): array
    {
        return [
            'name' => 'Test {{Entity}}',
            'slug' => 'test-{{entity_lower}}',
            'content_json' => json_encode(['type' => 'test']),
            'status' => 'active'
        ];
    }
    
    protected function createTest{{Entity}}(array $overrides = []): array
    {
        $data = array_merge($this->getValid{{Entity}}Data(), $overrides);
        
        $model = new \App\Models\{{Entity}}Model();
        $id = $model->insert($data);
        
        return $model->find($id);
    }
}
```

### Phase 6: Edge Cases and Error Scenarios

**Test Categories to Include**

1. **Validation Tests**
   - Required fields missing
   - Invalid data types
   - Constraint violations
   - Business rule violations

2. **Authentication Tests**
   - Unauthenticated requests
   - Insufficient permissions
   - Invalid tokens

3. **Edge Cases**
   - Empty data sets
   - Null values
   - Boundary conditions
   - Concurrent modifications

4. **Error Handling**
   - Database connection failures
   - Foreign key violations
   - Unique constraint violations
   - Server errors

## Generated File Structure

```
backend/tests/
├── feature/
│   └── API/
│       └── {{ClassName}}Test.php
├── unit/
│   ├── Controllers/
│   │   └── {{ClassName}}Test.php
│   └── Models/
│       └── {{ClassName}}Test.php
└── _support/
    ├── Seeds/
    │   └── {{Entity}}TestSeeder.php
    └── Traits/
        └── {{Entity}}TestTrait.php
```

## Common Pitfalls to Avoid

<pitfalls>
Based on the CodeIgniter 4 Testing Guide:

1. **Database State**: Always create parent records before dependent records
2. **Response Parsing**: Use `json_decode($result->getJSON(), true)` not just `$result->getJSON()`
3. **Header Access**: Use `hasHeader()` and `getHeaderLine()`, not deprecated `getHeaders()`
4. **Input Flexibility**: Controllers should handle both JSON and form data
5. **Type Consistency**: Ensure models always return arrays with `$returnType = 'array'`
6. **CORS Testing**: Test both simple requests and OPTIONS preflight
7. **Foreign Keys**: Match exact data types (INT(11) UNSIGNED for Shield user IDs)
8. **Test Isolation**: Use `$refresh = true` to ensure clean state between tests
</pitfalls>

## Interactive Questions

When generating tests, ask:

1. "What type of test do you need? (controller/model/api/feature)"
2. "What is the class name to test?"
3. "Does this class have any special dependencies or authentication requirements?"
4. "Are there any specific edge cases or business rules to test?"
5. "Should I include performance or load tests?"

## Post-Generation Checklist

After generating tests:
- [ ] Test file follows CI4 naming conventions
- [ ] Includes proper namespace and imports
- [ ] Has database migration setup (`$migrate = true`)
- [ ] Creates test data in correct order (parents first)
- [ ] Handles both JSON and form input
- [ ] Parses JSON responses correctly
- [ ] Tests CORS headers for API endpoints
- [ ] Includes both success and failure scenarios
- [ ] Has proper cleanup in tearDown()
- [ ] Uses test traits for reusable logic

## Running the Tests

```bash
# Run all tests
cd backend
vendor/bin/phpunit

# Run specific test file
vendor/bin/phpunit tests/feature/API/{{ClassName}}Test.php

# Run with coverage
vendor/bin/phpunit --coverage-html coverage/

# Run specific test method
vendor/bin/phpunit --filter testCreateReturnsSuccessWithValidData
```

## Integration with CI/CD

The generated tests should work with the GitHub Actions workflow defined in the testing guide, requiring only that the test database is properly configured in the CI environment.