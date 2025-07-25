'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Parameter {
  id: number;
  parameter_name: string;
  minimum_male: number;
  maximum_male: number;
  minimum_female: number;
  maximum_female: number;
  unit: string;
  description: string;
  category_id: number;
  sort_order: number;
  created_at: string;
}

interface SortableParameterItemProps {
  parameter: Parameter;
  onEdit: (parameter: Parameter) => void;
  onDelete: (parameter: Parameter) => void;
  onSortOrderChange: (parameterId: number, newSortOrder: number) => void;
  isDragging?: boolean;
}

function SortableParameterItem({ 
  parameter, 
  onEdit, 
  onDelete, 
  onSortOrderChange,
  isDragging = false 
}: SortableParameterItemProps) {
  const [isEditingSortOrder, setIsEditingSortOrder] = useState(false);
  const [tempSortOrder, setTempSortOrder] = useState(parameter.sort_order.toString());
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: parameter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleSortOrderSubmit = () => {
    const newSortOrder = parseInt(tempSortOrder);
    if (!isNaN(newSortOrder) && newSortOrder !== parameter.sort_order) {
      onSortOrderChange(parameter.id, newSortOrder);
    }
    setIsEditingSortOrder(false);
  };

  const handleSortOrderCancel = () => {
    setTempSortOrder(parameter.sort_order.toString());
    setIsEditingSortOrder(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSortOrderSubmit();
    } else if (e.key === 'Escape') {
      handleSortOrderCancel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 ${
        isSortableDragging ? 'shadow-lg ring-2 ring-purple-500 rotate-1' : 'hover:shadow-md'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Sort Order */}
      <div className="w-16 flex items-center justify-center">
        {isEditingSortOrder ? (
          <input
            type="number"
            value={tempSortOrder}
            onChange={(e) => setTempSortOrder(e.target.value)}
            onBlur={handleSortOrderSubmit}
            onKeyDown={handleKeyPress}
            className="w-12 px-1 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingSortOrder(true)}
            className="w-12 px-1 py-1 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
            title="Click to edit sort order"
          >
            {parameter.sort_order}
          </button>
        )}
      </div>

      {/* Parameter Content */}
      <div className="flex-1 ml-4">
        <h5 className="font-medium text-gray-800 dark:text-white">{parameter.parameter_name}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{parameter.description}</p>
        <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            <span className="text-blue-600 dark:text-blue-400">♂</span> {parameter.minimum_male} - {parameter.maximum_male} {parameter.unit}
          </span>
          <span>
            <span className="text-pink-600 dark:text-pink-400">♀</span> {parameter.minimum_female} - {parameter.maximum_female} {parameter.unit}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onEdit(parameter)}
          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
          title="Edit parameter"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(parameter)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete parameter"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface SortableParameterListProps {
  parameters: Parameter[];
  onEdit: (parameter: Parameter) => void;
  onDelete: (parameter: Parameter) => void;
  onReorder: (newOrder: Parameter[]) => void;
  onSortOrderChange: (parameterId: number, newSortOrder: number) => void;
}

export function SortableParameterList({ 
  parameters, 
  onEdit, 
  onDelete, 
  onReorder,
  onSortOrderChange 
}: SortableParameterListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedParameters.findIndex(p => p.id === active.id);
      const newIndex = sortedParameters.findIndex(p => p.id === over.id);
      
      const newOrder = arrayMove(sortedParameters, oldIndex, newIndex);
      
      // Update sort_order values based on new positions
      const reorderedParameters = newOrder.map((param, index) => ({
        ...param,
        sort_order: index + 1
      }));
      
      onReorder(reorderedParameters);
    }
  };

  // Sort parameters by sort_order for display, then by parameter name for consistent ordering
  const sortedParameters = [...parameters].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.parameter_name.localeCompare(b.parameter_name);
  });

  return (
    <div className="space-y-3">
      {/* Header with instructions */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          Drag to reorder
        </span>
        <span>Click sort order to edit</span>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedParameters.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedParameters.map((parameter, index) => (
              <SortableParameterItem
                key={parameter.id}
                parameter={parameter}
                onEdit={onEdit}
                onDelete={onDelete}
                onSortOrderChange={onSortOrderChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
