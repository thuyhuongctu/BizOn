```markdown
# BizOn Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the BizOn JavaScript codebase. It covers file organization, import/export styles, commit message habits, and testing patterns, providing clear examples and step-by-step workflows to help you contribute effectively.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.js`, `orderManager.js`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```javascript
    import { fetchData } from './apiUtils';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```javascript
    // In userProfile.js
    export function getUserProfile(id) { ... }

    // In another file
    import { getUserProfile } from './userProfile';
    ```

### Commit Messages
- Commit messages are **freeform** (no enforced prefixes).
- Average length is about 64 characters.
  - Example:
    ```
    Add logic for handling multiple user sessions
    ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add new functionality as a separate module.
**Command:** `/add-module`

1. Create a new file using camelCase naming (e.g., `orderManager.js`).
2. Implement your functions and export them using named exports.
    ```javascript
    // orderManager.js
    export function createOrder(data) { ... }
    export function cancelOrder(id) { ... }
    ```
3. Import your module using a relative path where needed.
    ```javascript
    import { createOrder } from './orderManager';
    ```
4. Write corresponding tests in a file named `orderManager.test.js`.

### Writing and Running Tests
**Trigger:** When you need to test a module or function.
**Command:** `/run-tests`

1. Create a test file with the pattern `*.test.js` (e.g., `userProfile.test.js`).
2. Write your tests using the project's preferred (but unspecified) testing framework.
    ```javascript
    // userProfile.test.js
    import { getUserProfile } from './userProfile';

    test('returns correct user data', () => {
      // test implementation
    });
    ```
3. Run the tests using the project's test runner (framework not specified).

### Committing Changes
**Trigger:** When you are ready to save your work to version control.
**Command:** `/commit-changes`

1. Write a clear, concise commit message (no specific prefix required).
    ```
    Fix bug in order cancellation logic
    ```
2. Commit your changes using your version control tool.

## Testing Patterns

- Test files use the `*.test.js` naming convention.
- The specific testing framework is **unknown**; follow existing test file patterns.
- Example test file:
    ```javascript
    // orderManager.test.js
    import { createOrder } from './orderManager';

    test('creates an order successfully', () => {
      // test implementation
    });
    ```

## Commands
| Command          | Purpose                                   |
|------------------|-------------------------------------------|
| /add-module      | Scaffold and add a new module             |
| /run-tests       | Run all test files matching `*.test.js`   |
| /commit-changes  | Commit staged changes to version control  |
```
