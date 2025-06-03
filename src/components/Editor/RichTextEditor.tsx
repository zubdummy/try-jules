import { useEditor, EditorContent, BubbleMenu, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Suggestion, { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import React, { useRef } from 'react'; // Import useRef
import SelectionToolbar from './SelectionToolbar';
import slashCommands from './slashCommands'; // SlashCommandItem is used by SuggestionProps, no need to import separately
import SlashCommandsList, { SlashCommandsListRef } from './SlashCommandsList'; // Import ref type
import tippy, { GetReferenceClientRect, Instance as TippyInstance } from 'tippy.js';

/**
 * Props for the {@link RichTextEditor} component.
 * @typedef {object} RichTextEditorProps
 * @property {string} [initialContent] - Optional initial HTML content for the editor.
 */

/**
 * A Tiptap-based rich text editor component that provides a Notion-like editing experience.
 * It includes a bubble menu for quick text formatting and a slash command menu for inserting elements.
 *
 * Default keyboard shortcuts (provided by StarterKit extension):
 * - Bold: Ctrl+B or Cmd+B
 * - Italic: Ctrl+I or Cmd+I
 * - Underline: Ctrl+U or Cmd+U (Note: Underline extension is added separately)
 * - Strike: Ctrl+Shift+X or Cmd+Shift+X
 * - Code: Ctrl+E or Cmd+E
 * - Paragraph: Shift+Ctrl+0 or Shift+Cmd+0
 * - Heading levels 1-6: Shift+Ctrl+[1-6] or Shift+Cmd+[1-6]
 * - Bullet List: Shift+Ctrl+8 or Shift+Cmd+8
 * - Ordered List: Shift+Ctrl+7 or Shift+Cmd+7
 * - Code Block: Shift+Ctrl+\ or Shift+Cmd+\
 * - Blockquote: Shift+Ctrl+B or Shift+Cmd+B
 * - Hard Break: Shift+Enter
 * - Undo: Ctrl+Z or Cmd+Z
 * - Redo: Ctrl+Y or Cmd+Shift+Z
 *
 * @param {RichTextEditorProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered rich text editor, or null if the editor instance is not available.
 */
const RichTextEditor = ({ initialContent }: { initialContent?: string }) => { // Typed props for clarity
  // Ref for the slash command list component to allow calling its onKeyDown method
  const slashCommandsListRef = useRef<SlashCommandsListRef>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history to use Tiptap's own history handling if needed, or configure as desired
        // history: false,
      }),
      Underline,
      Suggestion({
        editor: editorInstance, // This will be populated once useEditor runs and is mainly for the render method's context
        char: '/',
        /**
         * Filters slash command items based on the user's query.
         * @param {object} params - Parameters provided by the suggestion utility.
         * @param {string} params.query - The text entered after the trigger character (/).
         * @returns {SlashCommandItem[]} The filtered list of commands.
         */
        items: ({ query }: { query: string }) => {
          return slashCommands.filter(item =>
            item.title.toLowerCase().startsWith(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10); // Limit results for performance and usability
        },
        /**
         * Executes the selected slash command.
         * @param {object} params - Parameters provided by the suggestion utility.
         * @param {Editor} params.editor - The Tiptap editor instance.
         * @param {any} params.range - The range where the suggestion was triggered.
         * @param {SlashCommandItem} params.props - The selected command item.
         */
        command: ({ editor: currentEditor, range, props: commandProps }) => {
          // Type assertion for commandProps as SlashCommandItem
          (commandProps as any as SlashCommandItem).command({ editor: currentEditor, range });
        },
        /**
         * Renders the suggestion list popup.
         * @returns {object} An object with lifecycle methods for the popup.
         */
        render: () => {
          let component: ReactRenderer<SlashCommandsListRef, SuggestionProps<any>>; // Typed ReactRenderer
          let popup: TippyInstance[];

          return {
            /**
             * Called when the suggestion popup starts.
             * Initializes the ReactRenderer with SlashCommandsList and creates the tippy.js popup.
             * @param {SuggestionProps<SlashCommandItem>} props - Props provided by the suggestion utility.
             */
            onStart: props => {
              component = new ReactRenderer(SlashCommandsList, {
                props,
                editor: props.editor,
                ref: slashCommandsListRef, // Pass the ref to SlashCommandsList
              });

              if (!props.clientRect) {
                return;
              }

              const clientRect = props.clientRect as GetReferenceClientRect;

              popup = tippy('body', {
                getReferenceClientRect: clientRect,
                appendTo: () => document.body, // Consider appending to a more specific element if needed
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'light', // Optional: if you have tippy themes
                arrow: false, // Optional: disable tippy arrow
              });
            },
            /**
             * Called when the suggestion query updates.
             * Updates the props of the SlashCommandsList component.
             * @param {SuggestionProps<SlashCommandItem>} props - Updated props.
             */
            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              const clientRect = props.clientRect as GetReferenceClientRect;
              popup[0].setProps({
                getReferenceClientRect: clientRect,
              });
            },
            /**
             * Called on keydown events when the suggestion popup is active.
             * Handles Escape to close the popup and forwards other relevant key events
             * to the SlashCommandsList component for navigation.
             * @param {object} params - Keydown event parameters.
             * @param {KeyboardEvent} params.event - The keyboard event.
             * @returns {boolean} True if the event was handled, false otherwise.
             */
            onKeyDown({ event }: { event: KeyboardEvent }) { // Destructure event from props
              if (event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              // Pass event to SlashCommandsList's onKeyDown method via its ref
              return slashCommandsListRef.current?.onKeyDown({ event }) ?? false;
            },
            /**
             * Called when the suggestion popup exits.
             * Destroys the tippy.js instance and the ReactRenderer component.
             */
            onExit() {
              if (popup && popup[0]) {
                popup[0].destroy();
              }
              if (component) {
                component.destroy();
              }
            },
          };
        },
      } as unknown as SuggestionOptions<any>), // Cast to SuggestionOptions<any> to satisfy Tiptap types
    ],
    content: initialContent || '<p>Hello World! Type / for commands, or select text for formatting options.</p>',
  });

  // Workaround: Provide the editor instance to the Suggestion extension's options.
  // This is needed because the `editor` object is not available when the `extensions` array is defined.
  // The Suggestion extension's `render` method relies on `options.editor` to pass to ReactRenderer.
  if (editor) {
    const suggestionExtension = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'suggestion'
    ) as any; // Use 'as any' for easier access to options, or define a more specific type
    if (suggestionExtension && !suggestionExtension.options.editor) {
      suggestionExtension.options.editor = editor;
    }
  }
 *
 * Default keyboard shortcuts (provided by StarterKit):
 * - Bold: Ctrl+B or Cmd+B
 * - Italic: Ctrl+I or Cmd+I
 * - Strike: Ctrl+Shift+X or Cmd+Shift+X
 * - Code: Ctrl+E or Cmd+E
 * - Paragraph: Shift+Ctrl+0 or Shift+Cmd+0
 * - Heading levels 1-6: Shift+Ctrl+[1-6] or Shift+Cmd+[1-6]
 * - Bullet List: Shift+Ctrl+8 or Shift+Cmd+8
 * - Ordered List: Shift+Ctrl+7 or Shift+Cmd+7
 * - Code Block: Shift+Ctrl+\ or Shift+Cmd+\
 * - Blockquote: Shift+Ctrl+B or Shift+Cmd+B (Note: Tiptap handles priority with Bold)
 * - Hard Break: Shift+Enter
 * - Undo: Ctrl+Z or Cmd+Z
 * - Redo: Ctrl+Y or Cmd+Shift+Z
 *
 * @param {RichTextEditorProps} props - The props for the component.
 * @returns {JSX.Element}
 */
const RichTextEditor = ({ initialContent }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Suggestion({
        editor: editorInstance, // This will be populated once useEditor runs
        char: '/',
        items: ({ query }) => {
          return slashCommands.filter(item =>
            item.title.toLowerCase().startsWith(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10); // Limit results for performance
        },
        command: ({ editor: currentEditor, range, props: commandProps }) => {
          commandProps.command({ editor: currentEditor, range });
        },
        render: () => {
          let component: ReactRenderer<any, any>; // Type according to Tiptap's ReactRenderer
          let popup: TippyInstance[];

          return {
            onStart: props => {
              component = new ReactRenderer(SlashCommandsList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              const clientRect = props.clientRect as GetReferenceClientRect;

              popup = tippy('body', {
                getReferenceClientRect: clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              const clientRect = props.clientRect as GetReferenceClientRect;
              popup[0].setProps({
                getReferenceClientRect: clientRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              // Pass event to SlashCommandsList for up/down/enter navigation
              return component.ref?.onKeyDown?.(props) ?? false;
            },
            onExit() {
              if (popup && popup[0]) {
                popup[0].destroy();
              }
              if (component) {
                component.destroy();
              }
            },
          };
        },
      }),
    ],
    content: initialContent || '<p>Hello World! Type / for commands.</p>',
  });

  // This is a bit of a hack to provide the editor instance to the Suggestion extension.
  // Suggestion's `editor` property needs the editor instance, but useEditor hasn't returned it yet
  // when the extensions array is defined.
  if (editor && editor.extensionManager.extensions) {
    const suggestionExtension = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'suggestion'
    );
    if (suggestionExtension && !suggestionExtension.options.editor) {
      suggestionExtension.options.editor = editor;
    }
  }

  if (!editor) {
    return null;
  }

  return (
    <>
      <EditorContent editor={editor} />
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        className="selection-toolbar-bubble-menu" // For potential specific styling
      >
        <SelectionToolbar editor={editor} />
      </BubbleMenu>
    </>
  );
};

export default RichTextEditor;
