# Medical Manager Components

This document provides an overview of all React components available in the medical-manager application, their props, usage patterns, and implementation details.

## 📋 Table of Contents

0. [Icon Component](#icon-component)
1. [Modal Components](#modal-components)
2. [Form Components](#form-components)
3. [Display Components](#display-components)
4. [Navigation Components](#navigation-components)
5. [UI Components](#ui-components)
6. [Usage Examples](#usage-examples)

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

### 7. CountrySelector
**File:** `CountrySelector.tsx`

Dropdown component for selecting country codes for phone numbers.

#### Props
```typescript
interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
```

#### Features
- Pre-configured country codes with flags
- Flag icons using `FlagIcon` component
- Search/filter functionality
- Click outside to close
- Tooltip with country names
- Responsive design

#### Supported Countries
Includes 20+ major countries with their flags and country codes.

### 8. SexSelector (GenderSelector)
**File:** `SexSelector.tsx` / `GenderSelector.tsx`

Visual selector for male/female gender selection.

#### Props
```typescript
interface SexSelectorProps {
  value: 'male' | 'female' | '';
  onChange: (sex: 'male' | 'female') => void;
  className?: string;
}
```

#### Features
- Visual icons for male/female
- Color-coded selection (blue/pink)
- Grid layout
- Selection indicators
- Accessible buttons

---

## Display Components

### 9. DateReportCard
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

### 10. ParameterChart
**File:** `ParameterChart.tsx`

Interactive chart component for visualizing medical parameter trends over time.

#### Props
```typescript
interface ParameterChartProps {
  reports: ReportWithCategory[];
}
```

#### Features
- Interactive line chart with Chart.js/react-chartjs-2
- Smart parameter selection (abnormal parameters prioritized)
- Color-coded data points (blue=normal, red=abnormal)
- Normal range reference lines (green dashed)
- Parameter dropdown with abnormal indicators (⚠️)
- Responsive design with fixed aspect ratio
- Dark mode support
- Detailed tooltips with normal/abnormal status
- Parameter information panel showing:
  - Normal range values
  - Total data points
  - Count of abnormal values
- Visual legend explaining colors and symbols
- Empty state with informative message

#### Key Functions
- `parameterOptions` - Generates sorted parameter list with abnormal flags
- `chartData` - Processes reports into Chart.js format
- `chartOptions` - Configures chart appearance and interactions
- Smart default selection (first abnormal parameter or first available)

#### Dependencies
- `chart.js` - Core charting library
- `react-chartjs-2` - React wrapper for Chart.js
- Registered Chart.js components: CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend

#### Usage
```tsx
<ParameterChart reports={patientReports} />
```

#### Visual Elements
- **Blue dots**: Normal parameter values
- **Red dots**: Abnormal parameter values (outside normal range)
- **Green dashed lines**: Normal minimum/maximum reference lines
- **Parameter selector**: Dropdown with units and abnormal warnings
- **Info panel**: Shows range, data count, and abnormal count

### 11. FlagIcon
**File:** `FlagIcon.tsx`

Component for displaying country flag icons.

#### Props
```typescript
interface FlagIconProps {
  countryCode: string;
  className?: string; // Default: "inline-block mr-2"
}
```

#### Features
- Uses flagcdn.com for flag images
- Error handling with fallback
- Consistent sizing (16x12)
- Next.js Image optimization

### 12. SortableParameterList
**File:** `SortableParameterList.tsx`

Drag-and-drop sortable list for medical parameters with @dnd-kit.

#### Props
```typescript
interface SortableParameterItemProps {
  parameter: Parameter;
  onEdit: (parameter: Parameter) => void;
  onDelete: (parameter: Parameter) => void;
  onSortOrderChange: (parameterId: number, newSortOrder: number) => void;
  isDragging?: boolean;
}
```

#### Features
- Drag-and-drop reordering
- Inline sort order editing
- Parameter information display
- Sex-specific ranges display
- Action buttons (Edit/Delete)
- Visual drag feedback
- Keyboard navigation support

#### Dependencies
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list utilities
- `@dnd-kit/utilities` - CSS utilities

---

## Navigation Components

### 13. BackButton
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

### 14. ToggleSwitch
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
import { SexSelector, CountrySelector, ToggleSwitch, ParameterChart } from '@/components';

function PatientForm() {
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isActive, setIsActive] = useState(false);
  const [reports, setReports] = useState<ReportWithCategory[]>([]);

  return (
    <form>
      <div className="space-y-6">
        <div>
          <label>Gender:</label>
          <SexSelector value={gender} onChange={setGender} />
        </div>

        <div>
          <label>Country Code:</label>
          <CountrySelector 
            value={countryCode} 
            onChange={setCountryCode} 
          />
        </div>

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

### Medical Parameter Chart
```tsx
import { ParameterChart } from '@/components';

function PatientDashboard({ patientReports }: { patientReports: ReportWithCategory[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Medical History</h2>
      
      {/* Interactive parameter chart */}
      <ParameterChart reports={patientReports} />
      
      {/* Individual report sections would follow */}
    </div>
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
- **Chart.js & react-chartjs-2** - Interactive charts (ParameterChart only)
- **Custom hooks** - Focus management and modal state

---

*Last updated: July 29, 2025*
*Version: 1.1.0*
