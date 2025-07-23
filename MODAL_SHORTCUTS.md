# Modal Keyboard Shortcuts

This application now supports keyboard shortcuts for modal dialogs to improve user experience and productivity.

## Ctrl+Enter Submit Shortcut

When a modal dialog is open, you can press **Ctrl+Enter** (or **Cmd+Enter** on Mac) to automatically submit the form or trigger the primary action button.

### How it works:

1. **Form Submit Buttons**: If the modal contains a `<button type="submit">`, it will be clicked automatically.

2. **Action Buttons**: If no submit button is found, the system looks for buttons with common action keywords:
   - "submit"
   - "save" 
   - "create"
   - "update"
   - "confirm"
   - "add"
   - "ok"

3. **Form Submission**: If suitable buttons aren't found but a form exists, it dispatches a submit event on the form.

### Excluded Buttons:
The following button types are **excluded** from Ctrl+Enter activation:
- Buttons with "cancel" text
- Buttons with "close" text  
- Buttons with "delete" text
- Buttons with "remove" text
- Disabled buttons

### Modal Types Supported:
- **Report Forms**: Add/edit medical report forms
- **Parameter Forms**: Add/edit parameter forms in admin
- **Category Forms**: Add/edit category forms in admin
- **Confirmation Modals**: Trigger the confirm action
- **Alert Modals**: Close with OK button
- **Prompt Modals**: Submit the input value

### Usage Examples:

- **Adding a Report**: Fill out the form fields, then press Ctrl+Enter instead of clicking "Save Report"
- **Confirming Deletion**: In a confirmation modal, press Ctrl+Enter instead of clicking "Confirm"
- **Creating Parameters**: In admin, fill out parameter details and press Ctrl+Enter instead of clicking "Create"

This feature is implemented in the `useFocusTrap` hook and automatically works with all modal dialogs that use the base `Modal` component.
