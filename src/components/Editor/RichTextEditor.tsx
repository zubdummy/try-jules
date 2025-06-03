import { useEditor, EditorContent, BubbleMenu, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import React from 'react';
import SelectionToolbar from './SelectionToolbar';
import { SlashCommand } from './SlashCommandExtension';
import CalloutNode from './CalloutExtension'; // Import the CalloutNode

// Placeholder for Tiptap's Placeholder extension, if you decide to use it.
// import Placeholder from '@tiptap/extension-placeholder';

/**
 * Props for the {@link RichTextEditor} component.
 * @interface RichTextEditorProps
 * @property {string} [initialContent] - Optional initial HTML content for the editor.
 * @property {(html: string) => void} [onChange] - Optional callback triggered when editor content changes.
 */
export interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

/**
 * A Tiptap-based rich text editor component that provides a Notion-like editing experience.
 * It includes a bubble menu for quick text formatting and a slash command menu (via a custom extension)
 * for inserting elements.
 *
 * @component
 * @param {RichTextEditorProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered rich text editor, or null if the editor instance is not available.
 *
 * @example
 * ```jsx
 * <RichTextEditor
 *   initialContent="<p>Hello World!</p>"
 *   onChange={(html) => console.log(html)}
 * />
 * ```
 *
 * ### Default Keyboard Shortcuts
 * (Provided by StarterKit extension and Underline extension)
 * - **Bold**: `Ctrl+B` or `Cmd+B`
 * - **Italic**: `Ctrl+I` or `Cmd+I`
 * - **Underline**: `Ctrl+U` or `Cmd+U`
 * - **Strike**: `Ctrl+Shift+X` or `Cmd+Shift+X`
 * - **Code**: `Ctrl+E` or `Cmd+E`
 * - **Paragraph**: `Shift+Ctrl+0` or `Shift+Cmd+0`
 * - **Heading levels 1-6**: `Shift+Ctrl+[1-6]` or `Shift+Cmd+[1-6]`
 * - **Bullet List**: `Shift+Ctrl+8` or `Shift+Cmd+8`
 * - **Ordered List**: `Shift+Ctrl+7` or `Shift+Cmd+7`
 * - **Code Block**: `Shift+Ctrl+\` or `Shift+Cmd+\`
 * - **Blockquote**: `Shift+Ctrl+B` (Tiptap handles conflict with Bold)
 * - **Hard Break**: `Shift+Enter`
 * - **Undo**: `Ctrl+Z` or `Cmd+Z`
 * - **Redo**: `Ctrl+Y` or `Cmd+Shift+Z`
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Example: Disable history if you want to manage it differently.
        // history: false,
        // Example: Configure Placeholder extension if added
        // placeholder: {
        //   placeholder: 'Type / for commands or start writing...',
        // },
      }),
      Underline,
      SlashCommand,
      CalloutNode, // Add the CalloutNode to the extensions array
      // Example: Add Placeholder extension
      // Placeholder.configure({
      //   placeholder: 'Type / for commands or write something …',
      // }),
    ],
    content: initialContent || '<p>Hello World! Type / for commands, or select text for formatting options.</p>',
    onUpdate: ({ editor: currentEditor }: { editor: TiptapEditor }) => {
      if (onChange) {
        onChange(currentEditor.getHTML());
      }
    },
  });

  // The workaround for setting suggestionExtension.options.editor is no longer needed here,
  // as the SlashCommand extension's addProseMirrorPlugins method receives `this.editor`
  // and the Suggestion utility itself passes the editor instance to its render methods.

  if (!editor) {
    return null;
  }

  return (
    // Optional wrapper for additional styling or context for the editor and its popups.
    // Can be useful if you need a specific positioning context for Tippy.js popups
    // if `appendTo: 'parent'` is used for Tippy, or for overall editor layout.
    <div className="tiptap-editor-wrapper">
      <EditorContent editor={editor} />
      {editor && ( // Ensure editor is available before rendering BubbleMenu
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top', zIndex: 10 }} // zIndex can help if it appears below other elements
          className="selection-toolbar-bubble-menu" // Optional: for specific targeting if needed
        >
          <SelectionToolbar editor={editor} />
        </BubbleMenu>
      )}
    </div>
  );
};

export default RichTextEditor;
