# Icon Component Usage Guide

The `Icon` component provides a centralized way to use SVG icons throughout the application. Instead of embedding SVG code directly in components, you can now use the `Icon` component with a specific icon name.

## Usage

```tsx
import { Icon } from '@/components/Icon';

// Basic usage
<Icon name="edit" />

// With custom size
<Icon name="delete" size="lg" />

// With custom className
<Icon name="add" className="text-green-600" />

// With custom stroke width
<Icon name="user" strokeWidth={1.5} />
```

## Available Icons

### Basic Actions
- `edit` - Pencil/edit icon
- `delete` - Trash can icon
- `add` - Plus icon
- `check` - Checkmark
- `close` - X/close icon

### Navigation
- `arrow-left` - Left arrow (used in BackButton)
- `arrow-right` - Right arrow
- `chevron-right` - Right chevron (>)
- `chevron-down` - Down chevron

### User & Medical
- `user` - Single user profile icon
- `users` - Multiple users icon
- `medicine` - Medicine/flask icon
- `settings` - Gear/settings icon

### Documents & Data
- `document` - Document/file icon
- `download` - Download/export icon
- `upload` - Upload/import icon
- `chart` - Bar chart icon
- `table` - Table/grid icon

### Status & Feedback
- `spinner` - Loading spinner
- `warning` - Warning triangle (outline)
- `info` - Info circle
- `success` - Success checkmark
- `error` - Error X
- `success-circle` - Success with circle (filled)
- `warning-triangle` - Warning triangle (filled)

### UI Elements
- `grid` - Grid layout icon
- `grip-vertical` - Drag handle (vertical grip lines)

### Gender Icons
- `male` - Male silhouette (filled)
- `female` - Female silhouette (filled)

## Size Options

- `xs` - 12px (w-3 h-3)
- `sm` - 16px (w-4 h-4)  
- `md` - 20px (w-5 h-5) - Default
- `lg` - 24px (w-6 h-6)
- `xl` - 32px (w-8 h-8)
- `number` - Custom size using Tailwind classes

## Migration Examples

### Before (old SVG code):
```tsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
</svg>
```

### After (using Icon component):
```tsx
<Icon name="edit" size="sm" />
```

### Button with Icon:
```tsx
// Before
<button className="flex items-center">
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Add Patient
</button>

// After
<button className="flex items-center">
  <Icon name="add" size="sm" className="mr-2" />
  Add Patient
</button>
```

## Benefits

1. **Consistency** - All icons use the same component structure
2. **Maintainability** - Icons are defined in one place
3. **Reusability** - Easy to reuse icons across components
4. **Type Safety** - TypeScript ensures only valid icon names are used
5. **Performance** - Smaller bundle size by eliminating duplicate SVG code
6. **Customization** - Easy to apply consistent styling

## Adding New Icons

To add a new icon:

1. Add the icon name to the `IconName` type
2. Add the path data to the `iconPaths` object
3. Specify if it's filled or stroked, and any special properties

```tsx
// Add to IconName type
export type IconName = 
  | 'existing-icons...'
  | 'new-icon-name';

// Add to iconPaths object
const iconPaths: Record<IconName, IconData> = {
  // ... existing icons
  'new-icon-name': {
    path: "M... your SVG path data ...",
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }
};
```
