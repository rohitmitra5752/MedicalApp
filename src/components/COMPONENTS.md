# Medical Manager Components

This document provides an overview of all React components available in the medical-manager application, their props, usage patterns, and implementation details.

## 📋 Table of Contents

0. [Icon Component](#icon-component)
1. [Modal Components](#modal-components)
2. [Form Components](#form-components)
3. [Admin Form Components](#admin-form-components)
4. [Display Components](#display-components)
5. [Navigation Components](#navigation-components)
6. [UI Components](#ui-components)
7. [Usage Examples](#usage-examples)

---

## Icon Component

### Icon
**File:** `Icon.tsx`

Centralized SVG icon component that replaces inline SVG code throughout the application.

#### Props
```typescript
interface IconProps {
  name: IconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: number;
}

export type IconName = 
  | 'edit' | 'delete' | 'add' | 'check' | 'close'
  | 'arrow-left' | 'arrow-right' | 'chevron-right' | 'chevron-down'
  | 'user' | 'users' | 'medicine' | 'settings'
  | 'document' | 'download' | 'upload' | 'chart' | 'table'
  | 'spinner' | 'warning' | 'info' | 'success' | 'error'
  | 'success-circle' | 'warning-triangle'
  | 'grid' | 'grip-vertical' | 'male' | 'female';
```

#### Features
- **25+ Pre-defined Icons**: All commonly used icons in the app
- **Consistent Sizing**: Standardized size system (xs to xl)
- **Type Safety**: TypeScript ensures only valid icon names are used
- **Customizable**: Support for custom classes and stroke width
- **Performance**: Eliminates duplicate SVG code
- **Dark Mode**: Inherits color from parent classes

#### Usage Examples
```tsx
// Basic usage
<Icon name="edit" />

// With custom size and color
<Icon name="delete" size="lg" className="text-red-600" />

// In buttons
<button className="flex items-center">
  <Icon name="add" size="sm" className="mr-2" />
  Add Patient
</button>

// Custom stroke width
<Icon name="user" strokeWidth={1.5} />
```

#### Migration Benefits
- **Before**: 10+ lines of SVG code per icon
- **After**: 1 line with Icon component
- **Consistency**: All icons follow same patterns
- **Maintainability**: Changes to icons in one place

#### Available Icons
**Basic Actions**: edit, delete, add, check, close  
**Navigation**: arrow-left, arrow-right, chevron-right, chevron-down  
**User & Medical**: user, users, medicine, settings  
**Documents**: document, download, upload, chart, table  
**Status**: spinner, warning, info, success, error, success-circle, warning-triangle  
**UI Elements**: grid, grip-vertical, male, female  

---

## Modal Components

### 1. Modal
**File:** `Modal.tsx`

Base modal component with focus trapping and accessibility features.

#### Props
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // Default: 'max-w-md'
}
```

#### Features
- Focus trapping using custom `useFocusTrap` hook
- ESC key handling
- Backdrop click to close
- Body scroll prevention
- Dark mode support
- Accessibility attributes (ARIA)

#### Usage
```tsx
<Modal isOpen={isModalOpen} onClose={closeModal} title="Modal Title">
  <p>Modal content goes here</p>
</Modal>
```

### 2. AlertModal
**File:** `AlertModal.tsx`

Modal for displaying alert messages with different types and icons.

#### Props
```typescript
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning'; // Default: 'info'
}
```

#### Features
- Type-specific icons and colors
- Styled for different alert types
- Single OK button
- Auto-styled based on alert type

#### Usage
```tsx
<AlertModal
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  title="Success"
  message="Patient created successfully!"
  type="success"
/>
```

### 3. ConfirmationModal
**File:** `ConfirmationModal.tsx`

Modal for confirmation dialogs with customizable buttons.

#### Props
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string; // Default: 'Confirm'
  confirmButtonClass?: string;
  isDestructive?: boolean; // Default: false
}
```

#### Features
- Destructive action styling (red buttons)
- Custom confirmation text
- Custom button styling
- Cancel/Confirm actions

#### Usage
```tsx
<ConfirmationModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Patient"
  isDestructive={true}
  confirmText="Delete"
>
  <p>Are you sure you want to delete this patient?</p>
</ConfirmationModal>
```

### 4. PromptModal
**File:** `PromptModal.tsx`

Modal with input field for user prompts.

#### Props
```typescript
interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'email' | 'password' | 'number'; // Default: 'text'
}
```

#### Features
- Enter key submission
- Input validation
- Customizable input types
- Auto-focus on input

#### Usage
```tsx
<PromptModal
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  onConfirm={(value) => handleNameChange(value)}
  title="Edit Name"
  message="Enter the new name:"
  placeholder="Patient name"
  defaultValue={currentName}
/>
```

### 5. PrescriptionModal
**File:** `PrescriptionModal.tsx`

Specialized modal for creating/editing prescriptions.

#### Props
```typescript
interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrescriptionFormData) => void;
  patientName: string;
  prescriptionData?: Prescription | null;
  mode: 'create' | 'edit';
}
```

#### Features
- Prescription type selection
- Valid until date picker
- Form validation
- Create/Edit modes
- Toggle switch integration

---

## Form Components

### 6. ReportForm
**File:** `ReportForm.tsx`

Complex form component for adding/editing medical reports.

#### Props
```typescript
interface ReportFormProps {
  patientId: string;
  editDate?: string;
  mode: 'add' | 'edit';
}
```

#### Features
- Parameter fetching by category
- Sex-specific parameter ranges
- Form validation
- Date selection
- Parameter value input
- Error handling with AlertModal
- Responsive grid layout

#### Key Functions
- `getParameterMinimum()` - Gets sex-specific minimum values
- `getParameterMaximum()` - Gets sex-specific maximum values
- Form submission with validation
- Existing report data loading for edit mode

---

## Admin Form Components

### ImportExportParameters
**File:** `forms/admin/import-export-parameters.tsx`

Component for importing and exporting medical parameter data as JSON files.

#### Props
```typescript
interface ImportExportParametersProps {
  onDataUpdate: () => void;
}
```

#### Features
- **Export functionality**: Downloads all parameter categories and parameters as JSON
- **Import functionality**: Uploads and processes JSON files with parameter data
- **Duplicate handling**: Option to skip duplicates during import
- **Error handling**: Displays import/export errors and success messages
- **Progress indicators**: Shows loading states during operations
- **Import results**: Detailed feedback on imported/skipped items

#### Key Functions
- `handleExport()` - Fetches and downloads parameter data
- `handleImport()` - Processes uploaded JSON files
- `handleFileChange()` - Manages file selection

### ParameterManagement
**File:** `forms/admin/parameter-management.tsx`

Comprehensive component for managing medical parameters and categories.

#### Props
```typescript
interface ParameterManagementProps {
  onDataUpdate?: () => void;
}
```

#### Features
- **Category management**: Create, edit, delete parameter categories
- **Parameter management**: Full CRUD operations for parameters
- **Accordion interface**: Expandable categories showing their parameters
- **Drag & drop sorting**: Reorder parameters within categories
- **Modal forms**: Separate modals for category and parameter forms
- **Confirmation dialogs**: Safe deletion with detailed warnings
- **Real-time updates**: Automatic data refresh after operations
- **Error handling**: Form validation and API error display

#### Modal Components
- Category creation/editing modal
- Parameter creation/editing modal with:
  - Male/female reference ranges
  - Unit specification
  - Sort order management
  - Description field
- Delete confirmation modals for categories and parameters

#### Key Functions
- `fetchData()` - Loads categories and parameters
- `submitCategoryForm()` - Handles category creation/updates
- `submitParameterForm()` - Handles parameter creation/updates
- `handleParameterReorder()` - Updates parameter sort order
- Confirmation handlers for safe deletion

---

## Display Components

### 8. DateReportCard
**File:** `DateReportCard.tsx`

Card component displaying medical reports for a specific date.

#### Props
```typescript
interface DateReportCardProps {
  date: string;
  categories: string[];
  getParametersForDateAndCategory: (date: string, categoryName: string) => ParameterData[];
  formatDate: (date: string) => string;
  patientId: string;
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
}
```

#### Features
- Tabbed interface for categories
- Special "Abnormal Parameters" tab
- Parameter cards with range indicators
- Edit/Delete actions
- Responsive grid layout
- Color-coded abnormal values
- Empty state handling

#### Key Functions
- `getAbnormalParameters()` - Identifies out-of-range parameters
- Category-based parameter filtering
- Date formatting

---

## Navigation Components

### 9. BackButton
**File:** `BackButton.tsx`

Reusable navigation component for consistent "Back to *" functionality across the application.

#### Props
```typescript
interface BackButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}
```

#### Features
- Consistent left arrow icon
- Standardized styling with customization support
- Built on Next.js Link component
- Dark mode support
- Hover effects

#### Usage
```tsx
// Basic usage
<BackButton href="/patients">Back to Patients</BackButton>

// With custom colors
<BackButton 
  href="/" 
  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
>
  Back to Home
</BackButton>
```

#### Implementation Details
- Uses SVG left arrow icon for consistency
- Combines default classes with optional custom classes
- Maintains focus and accessibility standards
- Replaces inline back button implementations throughout the app

---

## UI Components

### 10. ToggleSwitch
**File:** `ToggleSwitch.tsx`

Customizable toggle switch component.

#### Props
```typescript
interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  falseLabel?: string; // Default: 'No'
  trueLabel?: string; // Default: 'Yes'
  disabled?: boolean; // Default: false
  colors?: CustomColors;
  className?: string;
  showLabels?: boolean; // Default: true
}
```

#### Features
- Customizable labels and colors
- Smooth animations
- Accessibility support (ARIA)
- Dark mode compatible
- Disabled state handling

#### Color Customization
```typescript
colors: {
  falseBg?: string;        // Background when false
  trueBg?: string;         // Background when true
  falseActiveText?: string; // Text color when false is active
  trueActiveText?: string;  // Text color when true is active
  inactiveText?: string;    // Text color for inactive label
}
```

---

## Custom Hooks Integration

### useFocusTrap
Used by Modal components for accessibility:
- Traps focus within modal
- Restores focus on close
- Handles keyboard navigation

### useModalDialogs
Provides centralized modal state management:
- Alert modal state
- Confirmation modal state
- Prompt modal state
- Utility functions for showing modals

---

## Usage Examples

### Complete Patient Report Form
```tsx
import { ReportForm } from '@/components/ReportForm';

function PatientReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ReportForm 
        patientId={params.id} 
        mode="add" 
      />
    </div>
  );
}
```

### Modal Workflow
```tsx
import { useState } from 'react';
import { AlertModal, ConfirmationModal } from '@/components';

function PatientActions() {
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePatient();
      setShowAlert(true);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Patient
      </button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Patient"
        isDestructive
      >
        <p>This action cannot be undone.</p>
      </ConfirmationModal>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Success"
        message="Patient deleted successfully"
        type="success"
      />
    </>
  );
}
```

### Form with Selectors
```tsx
import { ToggleSwitch } from '@/components';

function PatientForm() {
  const [isActive, setIsActive] = useState(false);

  return (
    <form>
      <div className="space-y-6">
        <div>
          <label>Active Status:</label>
          <ToggleSwitch 
            value={isActive} 
            onChange={setIsActive}
            trueLabel="Active"
            falseLabel="Inactive"
          />
        </div>
      </div>
    </form>
  );
}
```

---

## Best Practices

1. **Accessibility**: All modal components include proper ARIA attributes and focus management
2. **Dark Mode**: All components support dark mode via Tailwind CSS classes
3. **Responsive Design**: Components are built with mobile-first responsive design
4. **Type Safety**: Full TypeScript support with comprehensive interfaces
5. **Error Handling**: Components include proper error states and fallbacks
6. **Performance**: Components use React best practices for optimization

## Dependencies

- **React 18+** - Core framework
- **Next.js 15** - App Router and Image optimization
- **Tailwind CSS** - Styling framework
- **@dnd-kit** - Drag and drop functionality (SortableParameterList only)
- **Custom hooks** - Focus management and modal state

---

*Last updated: July 29, 2025*
*Version: 1.1.0*
