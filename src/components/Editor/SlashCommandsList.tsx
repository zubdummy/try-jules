import React, { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tiptap/react';
import { SlashCommandItem } from './slashCommands';

/**
 * Props for the {@link SlashCommandsList} component.
 */
interface SlashCommandsListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  editor: Editor; // Although not directly used in this component's logic, it's passed by ReactRenderer and might be useful for more complex scenarios.
}

/**
 * Defines the methods exposed by the {@link SlashCommandsList} component via its ref.
 * This is used by the Tiptap suggestion utility to control the list's behavior (e.g., keyboard navigation).
 */
export interface SlashCommandsListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

/**
 * Renders a list of slash commands and handles their selection.
 * This component is designed to be used with Tiptap's suggestion utility.
 * It uses `forwardRef` to allow the parent (Tiptap's `ReactRenderer`) to call methods on this component,
 * specifically for handling keyboard navigation.
 */
const SlashCommandsList = forwardRef<SlashCommandsListRef, SlashCommandsListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  /**
   * Executes the command associated with the item at the given index.
   */
  const selectItem = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  }, [command, items]);

  // Expose the onKeyDown method to the parent component (ReactRenderer) via ref.
  // This allows the suggestion utility to manage keyboard navigation for the list.
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => (prevIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  // Reset selectedIndex when items change (e.g., due to filtering) to prevent out-of-bounds errors
  // and ensure the selection starts from the top.
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="slash-command-list bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden py-1"
      role="listbox" // WAI-ARIA role for the container of options
      aria-orientation="vertical"
    >
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`flex items-center w-full px-3 py-2 text-left text-sm transition-colors duration-100 ease-in-out
            ${ index === selectedIndex
              ? 'bg-gray-100 dark:bg-gray-700' // Active selection style
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50' // Hover style
            }
          `}
          onClick={() => selectItem(index)}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          id={`slash-command-item-${index}`} // For aria-activedescendant if needed, though direct selection highlighting is used here
        >
          <item.icon size={18} className="mr-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{item.title}</span>
            {item.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandsList.displayName = 'SlashCommandsList'; // For better debugging in React DevTools

export default SlashCommandsList;
