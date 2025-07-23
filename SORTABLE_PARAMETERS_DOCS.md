# Sortable Parameter List Implementation

## Overview
Added drag-and-drop functionality and inline sort order editing to the parameter administration interface, similar to Steam's list management interface.

## Features Implemented

### 1. Drag-and-Drop Reordering
- **Library**: Used `@dnd-kit` library for robust drag-and-drop functionality
- **Visual Feedback**: Parameters show visual feedback when being dragged (shadow, ring, slight rotation)
- **Touch Support**: Works on both desktop and touch devices
- **Keyboard Support**: Accessible via keyboard navigation

### 2. Inline Sort Order Editing
- **Click to Edit**: Click on any sort order number to edit it inline
- **Input Validation**: Ensures only valid numbers are accepted
- **Auto-save**: Automatically saves changes when focus is lost or Enter is pressed
- **Cancel Support**: Press Escape to cancel editing and revert changes

### 3. Visual Enhancements
- **Drag Handle**: Clear drag handle (hamburger icon) on the left side
- **Instructions**: Header text explains how to use the features
- **Hover Effects**: Subtle hover effects for better user experience
- **Consistent Sorting**: Maintains consistent ordering by sort_order, then by name

## Files Modified/Created

### New Files
1. **`src/components/SortableParameterList.tsx`**
   - Main sortable component with drag-and-drop functionality
   - Inline editing for sort order
   - Steam-like interface design

2. **`src/app/api/parameters/reorder/route.ts`**
   - API endpoint for bulk updating parameter sort orders
   - Supports both single and multiple parameter updates

### Modified Files
1. **`src/app/(pages)/admin/page.tsx`**
   - Integrated the new sortable component
   - Added handlers for reordering and sort order changes
   - Replaced the old static parameter list

2. **`src/lib/parameters.ts`**
   - Added `updateParametersSortOrder` function
   - Supports atomic updates using database transactions

3. **`package.json`**
   - Added `@dnd-kit` dependencies for drag-and-drop functionality

## API Endpoints

### PATCH `/api/parameters/reorder`
Updates the sort order for one or more parameters.

**Request Body:**
```json
{
  "parameters": [
    { "id": 1, "sort_order": 1 },
    { "id": 2, "sort_order": 2 }
  ]
}
```

**Response:**
```json
{ "success": true }
```

## Usage Instructions

### For Drag-and-Drop:
1. Navigate to the Admin panel
2. Expand any parameter category
3. Use the drag handle (≡) on the left side of each parameter
4. Drag parameters up or down to reorder them
5. Changes are automatically saved

### For Inline Editing:
1. Click on any sort order number in the parameter list
2. Type the new sort order value
3. Press Enter to save or Escape to cancel
4. Changes are automatically saved and the list is refreshed

## Technical Details

### Drag-and-Drop Implementation
- Uses `@dnd-kit/core` for the main DnD context
- `@dnd-kit/sortable` for vertical list sorting
- `@dnd-kit/utilities` for CSS transforms
- Activation distance of 8px to prevent accidental drags

### Database Updates
- Uses SQLite transactions for atomic updates
- Bulk updates supported for efficiency
- Proper error handling and rollback on failures

### State Management
- Local state updates for immediate UI feedback
- API calls for persistent storage
- Automatic data refresh after changes

## Benefits

1. **User Experience**: Intuitive drag-and-drop interface similar to popular applications
2. **Efficiency**: Quick reordering without opening edit modals
3. **Flexibility**: Both drag-and-drop and direct number input for different user preferences
4. **Accessibility**: Keyboard support and proper ARIA labels
5. **Performance**: Efficient bulk updates and minimal re-renders

## Testing

The implementation has been tested with:
- ✅ Drag-and-drop reordering
- ✅ Inline sort order editing
- ✅ API endpoint functionality
- ✅ Database transaction handling
- ✅ Visual feedback and animations
- ✅ Error handling and validation
