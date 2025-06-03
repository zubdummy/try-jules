import { Editor } from '@tiptap/react';
import { Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered, LucideIcon } from 'lucide-react';

/**
 * Represents a single command available through the slash command menu.
 * @interface SlashCommandItem
 * @property {string} title - The user-facing title of the command.
 * @property {string} description - A brief description of what the command does.
 * @property {LucideIcon} icon - A Lucide icon component to visually represent the command.
 * @property {function({ editor: Editor, range?: any }): void} command - The function to execute when the command is selected.
 *   It receives the Tiptap editor instance and an optional range (provided by the suggestion utility).
 */
export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon; // Use LucideIcon for better type safety if all icons are from lucide.
  command: ({ editor, range }: { editor: Editor; range?: any }) => void;
}

/**
 * An array of predefined slash commands available in the editor.
 * Each command specifies its appearance, behavior, and the Tiptap action to perform.
 * @type {SlashCommandItem[]}
 */
export const slashCommands: SlashCommandItem[] = [
  {
    title: 'Paragraph',
    description: 'Normal text style',
    icon: Pilcrow,
    command: ({ editor }) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: List,
    command: ({ editor }) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Ordered List',
    description: 'Create a list with numbering',
    icon: ListOrdered,
    command: ({ editor }) => editor.chain().focus().toggleOrderedList().run(),
  },
  // Add more commands as needed
];

export default slashCommands;
