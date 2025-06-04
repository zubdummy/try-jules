import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered, Terminal, Highlighter } from 'lucide-react';

/**
 * Props for the {@link SelectionToolbar} component.
 * @interface SelectionToolbarProps
 * @property {Editor} editor - The Tiptap editor instance, used to execute commands and check active states.
 */
interface SelectionToolbarProps {
  editor: Editor;
}

/**
 * @typedef {object} ToolbarButtonProps
 * @property {() => void} onClick - Function to call when the button is clicked.
 * @property {boolean} isActive - Whether the formatting option this button represents is currently active in the editor.
 * @property {React.ReactNode} children - The content of the button, typically an icon.
 * @property {string} [ariaLabel] - Accessible label for the button.
 */

/**
 * A reusable button component for the toolbar.
 * @param {ToolbarButtonProps} props - The props for the button.
 * @returns {JSX.Element}
 */
const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ onClick, isActive, children, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded transition-colors duration-100 ease-in-out
        ${isActive
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' // Active styles
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50' // Inactive and hover styles
        }`}
      aria-pressed={isActive}
      aria-label={ariaLabel} // Add aria-label for accessibility
      title={ariaLabel} // Tooltip for sighted users
    >
      {children}
    </button>
  );

/**
 * A toolbar component that appears when text is selected in the Tiptap editor (Bubble Menu).
 * It provides buttons for common text formatting options like Bold, Italic, Underline, and Strikethrough.
 *
 * @component
 * @param {SelectionToolbarProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered selection toolbar, or null if the editor instance is not available.
 */
const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Defines the configuration for each button in the toolbar.
  const toolbarItems = [
    { name: 'Bold', command: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold },
    { name: 'Italic', command: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic },
    { name: 'Underline', command: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), icon: UnderlineIcon },
    { name: 'Strikethrough', command: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), icon: Strikethrough },
    { name: 'Code', command: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), icon: Code },
    { name: 'CodeBlock', command: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock'), icon: Terminal },
    { name: 'BulletList', command: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List },
    { name: 'OrderedList', command: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered },
    { name: "Highlight", command: () => editor.chain().focus().toggleHighlight({ color: '#00bc7d' }).run(), isActive: editor.isActive('highlight'), icon: Highlighter },
  ];

  return (
    <div className="flex space-x-1 bg-white dark:bg-gray-800 shadow-lg rounded-md p-1 border border-gray-200 dark:border-gray-600">
      {toolbarItems.map((item) => (
        <ToolbarButton
          key={item.name}
          onClick={item.command}
          isActive={item.isActive}
          ariaLabel={item.name}
        >
          <item.icon size={18} strokeWidth={2} />
        </ToolbarButton>
      ))}
    </div>
  );
};

export default SelectionToolbar;
