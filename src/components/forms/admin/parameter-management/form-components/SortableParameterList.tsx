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
import { Icon, Icons } from '@/components';
import { Parameter } from '../types';

interface SortableParameterItemProps {
  parameter: Parameter;
  onEdit: (parameter: Parameter) => void;
  onDelete: (parameter: Parameter) => void;
  onSortOrderChange: (parameterId: number, newSortOrder: number) => void;
}

function SortableParameterItem({ 
  parameter, 
  onEdit, 
  onDelete, 
  onSortOrderChange
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
        <Icon name={Icons.GRIP_VERTICAL} size="sm" />
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
          <Icon name={Icons.EDIT} size="sm" />
        </button>
        <button
          onClick={() => onDelete(parameter)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete parameter"
        >
          <Icon name={Icons.DELETE} size="sm" />
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

export default function SortableParameterList({ 
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
          <Icon name={Icons.GRIP_VERTICAL} size="sm" className="mr-1" />
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
            {sortedParameters.map((parameter) => (
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
