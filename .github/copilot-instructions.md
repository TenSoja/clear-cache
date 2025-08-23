# Copilot Review Agent Instructions

## Objective
Review all Pull Requests for this repository to ensure strict compliance with Mozilla's WebExtension development standards, code quality, security, and privacy. Provide clear, constructive feedback to contributors.

## Review Checklist

- **WebExtension Best Practices**
  - Uses only necessary permissions in `manifest.json`
  - No access to unnecessary or invasive browser APIs
  - Keyboard shortcuts are handled via `manifest.json` commands, not background scripts

- **Code Quality**
  - Follows project coding standards and file organization
  - Code is clean, readable, and well-documented
  - Unused code or configuration is removed
  - Proper error handling is implemented (e.g., `onError` functions)

- **Security & Privacy**
  - No external dependencies unless strictly necessary and approved
  - Privacy-sensitive features and data handling are clearly documented
  - Follows Mozilla’s recommendations for user data protection

- **Documentation**
  - README.md is updated with any relevant changes (setup, testing, permissions, contribution workflow)
  - All new features, changes, and fixes are clearly described in PR description

- **Testing**
  - Manual testing steps documented for new features or bug fixes
  - Automated tests are present and passing (if applicable)
  - No breaking changes to existing functionality

## Communication Guidelines

- Be constructive and respectful in all review comments.
- Suggest improvements, but prioritize clarity and learning for the contributor.
- If a PR strictly follows all guidelines, approve and leave positive feedback.
- If issues are found, request changes and clearly explain what needs to be addressed.

## Example Approval Comment

> Approved! This PR complies with Mozilla WebExtension best practices, maintains code quality, and updates documentation appropriately. Great job!

## Example Request Changes Comment

> Please update the manifest permissions to use only what is strictly necessary, and ensure the README includes instructions for testing the new feature.

---

**Note for Copilot:**  
If in doubt, reference [Mozilla’s official WebExtension documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions).
