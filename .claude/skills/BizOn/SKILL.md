```markdown
# BizOn Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the BizOn JavaScript codebase. You'll learn how to structure files, write imports/exports, follow commit conventions, and implement and test features in line with the repository's standards. This guide is designed to help new and existing contributors maintain consistency and quality across the project.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example:  
    ```
    user-profile.js
    order-list.test.js
    ```

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```javascript
    import { fetchOrders } from './order-utils.js';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```javascript
    // order-utils.js
    export function fetchOrders() { ... }
    export const ORDER_STATUS = { ... };
    ```

### Commit Messages
- Commit messages are **freeform** (no strict prefixes), but should be clear and concise (average length ~60 characters).
  - Example:
    ```
    Fix bug in order total calculation
    Add user profile validation
    ```

## Workflows

### Add a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using kebab-case (e.g., `feature-name.js`).
2. Implement the feature using named exports.
3. Use relative imports for any dependencies.
4. Write corresponding tests in a file named `feature-name.test.js`.
5. Commit your changes with a clear, concise message.

### Fix a Bug
**Trigger:** When resolving a bug in the codebase  
**Command:** `/fix-bug`

1. Locate the relevant file(s) using kebab-case naming.
2. Make necessary changes, following import/export conventions.
3. Update or add tests in `*.test.js` files to cover the fix.
4. Commit with a descriptive message about the bug fix.

### Write or Update Tests
**Trigger:** When adding or updating tests for a module  
**Command:** `/write-test`

1. Create or update a test file named `module-name.test.js`.
2. Write tests using the project's preferred (but currently unknown) testing framework.
3. Use relative imports to bring in the module under test.
4. Commit the test file with a message indicating the test coverage.

## Testing Patterns

- **Test File Naming:**  
  Test files follow the pattern `*.test.js` (e.g., `order-utils.test.js`).
- **Testing Framework:**  
  The specific framework is unknown, but standard JavaScript testing patterns apply.
- **Test Placement:**  
  Test files are placed alongside or near the modules they test.
- **Example:**
  ```javascript
  // order-utils.test.js
  import { fetchOrders } from './order-utils.js';

  test('fetchOrders returns correct data', () => {
    // test implementation
  });
  ```

## Commands
| Command       | Purpose                                   |
|---------------|-------------------------------------------|
| /add-feature  | Scaffold and implement a new feature      |
| /fix-bug      | Guide for fixing a bug and updating tests |
| /write-test   | Steps to write or update tests            |
```
