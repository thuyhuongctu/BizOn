```markdown
# BizOn Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the BizOn JavaScript codebase. It covers file organization, import/export styles, and test structuring, providing a foundation for contributing code that aligns with project standards. While no formal frameworks or automated workflows are detected, this guide ensures consistency and maintainability across the project.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  ```text
  user-profile.js
  order-summary.test.js
  ```

### Import Style
- **Relative imports** are used throughout the codebase.
- **Example:**  
  ```javascript
  import { calculateTotal } from './utils/calculate-total.js';
  ```

### Export Style
- **Named exports** are preferred.
- **Example:**  
  ```javascript
  // In utils/calculate-total.js
  export function calculateTotal(items) {
    // ...
  }
  ```

### Commit Messages
- **Freeform style** (no enforced prefixes)
- **Average length:** 67 characters
- **Example:**  
  ```
  Fix bug in order calculation when item quantity is zero
  ```

## Workflows

### Adding a New Module
**Trigger:** When you need to create a new feature or utility module  
**Command:** `/add-module`

1. Create a new file using kebab-case (e.g., `new-feature.js`).
2. Implement your logic using named exports.
3. Import dependencies using relative paths.
4. If applicable, create a corresponding test file named `new-feature.test.js`.

### Writing a Test
**Trigger:** When adding or updating functionality that requires testing  
**Command:** `/write-test`

1. Create a test file with the pattern `*.test.js` (e.g., `cart-utils.test.js`).
2. Write your test cases using your preferred testing framework.
3. Use relative imports to bring in the module under test.
4. Ensure tests are comprehensive and cover edge cases.

### Refactoring Existing Code
**Trigger:** When improving or restructuring existing modules  
**Command:** `/refactor-module`

1. Update the relevant `.js` file, maintaining kebab-case naming.
2. Ensure all imports/exports remain relative and named.
3. Update or add tests as necessary.
4. Use descriptive commit messages summarizing the changes.

## Testing Patterns

- **Test File Naming:**  
  Test files follow the pattern `*.test.js` and are placed alongside or near the modules they test.
  - **Example:**  
    ```
    utils/
      calculate-total.js
      calculate-total.test.js
    ```
- **Framework:**  
  No specific testing framework detected. Use your preferred JavaScript testing library (e.g., Jest, Mocha).
- **Import Style in Tests:**  
  Use relative imports to reference the module under test.
  - **Example:**  
    ```javascript
    import { calculateTotal } from './calculate-total.js';

    test('calculates total for empty array', () => {
      expect(calculateTotal([])).toBe(0);
    });
    ```

## Commands
| Command         | Purpose                                         |
|-----------------|-------------------------------------------------|
| /add-module     | Scaffold a new module following conventions      |
| /write-test     | Create a test file for a module                  |
| /refactor-module| Refactor an existing module                      |
```
