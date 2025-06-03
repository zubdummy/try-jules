# Notion-Style Rich Text Editor

## Overview

This project implements a Notion-style rich text editor using [Tiptap](https://tiptap.dev/) within a React + TypeScript + Vite application. The editor provides a clean, block-based editing experience with support for common rich text formatting options, a selection-based toolbar, and slash commands for quick element insertion.

## Features

### 1. Rich Text Formatting
The editor supports standard text formatting options:

*   **Bold**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (macOS)
*   **Italic**: `Ctrl+I` (Windows/Linux) or `Cmd+I` (macOS)
*   **Underline**: `Ctrl+U` (Windows/Linux) or `Cmd+U` (macOS)
*   **Strikethrough**: `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
*   **Code**: `Ctrl+E` (Windows/Linux) or `Cmd+E` (macOS)

Other formatting options available via keyboard shortcuts (primarily from Tiptap's StarterKit):

*   **Paragraph**: `Shift+Ctrl+0` or `Shift+Cmd+0`
*   **Heading levels 1-6**: `Shift+Ctrl+[1-6]` or `Shift+Cmd+[1-6]` (e.g., `Shift+Ctrl+1` for H1)
*   **Bullet List**: `Shift+Ctrl+8` or `Shift+Cmd+8`
*   **Ordered List**: `Shift+Ctrl+7` or `Shift+Cmd+7`
*   **Code Block**: `Shift+Ctrl+\` or `Shift+Cmd+\`
*   **Blockquote**: `Shift+Ctrl+B` (Tiptap manages conflict with Bold)
*   **Hard Break**: `Shift+Enter`
*   **Undo**: `Ctrl+Z` or `Cmd+Z`
*   **Redo**: `Ctrl+Y` or `Cmd+Shift+Z` (Windows/Linux) or `Ctrl+Shift+Z` or `Cmd+Shift+Z` (macOS)

### 2. Selection Toolbar (Bubble Menu)
When text is selected, a floating toolbar (Bubble Menu) appears, providing quick access to common formatting tools:
*   Bold
*   Italic
*   Underline
*   Strikethrough

Buttons on the toolbar visually indicate if the current selection has the respective format active.

### 3. Slash Commands
Typing `/` in the editor on a new line or at the beginning of a paragraph opens a dropdown menu of available commands. This allows for quick insertion of different content types.

Available slash commands:
*   **/Paragraph**: Converts the current block to a normal paragraph.
*   **/Heading 1**: Converts the current block to a Heading 1.
*   **/Heading 2**: Converts the current block to a Heading 2.
*   **/Heading 3**: Converts the current block to a Heading 3.
*   **/Bullet List**: Converts the current block to a bullet list item or starts a new bullet list.
*   **/Ordered List**: Converts the current block to an ordered list item or starts a new ordered list.

The list is filterable by typing after the `/` and navigable with arrow keys (Up, Down) and Enter to select.

## Component Structure

The editor is primarily composed of the following React components located in `src/components/Editor/`:

*   **`RichTextEditor.tsx`**:
    *   The main component that initializes the Tiptap editor instance (`useEditor`).
    *   Configures all extensions, including `StarterKit` for basic nodes/marks, `Underline`, the `BubbleMenu` (Selection Toolbar), and the `Suggestion` utility (for Slash Commands).
    *   Renders the `EditorContent` where the user types and the `BubbleMenu`.
*   **`SelectionToolbar.tsx`**:
    *   Renders the UI for the Bubble Menu.
    *   Contains buttons for toggling bold, italic, underline, and strikethrough formats.
    *   Dynamically reflects the active formatting state of the selected text.
*   **`SlashCommandsList.tsx`**:
    *   Renders the list of available slash commands in a popup.
    *   Handles keyboard navigation and click selection of commands from the list.
*   **`slashCommands.ts`**:
    *   Defines the configuration for each available slash command (title, description, icon, and the Tiptap command to execute).

## Setup and Usage

The `RichTextEditor` component is the primary entry point for using the editor. It is currently integrated and rendered within `src/App.tsx`.

To use it in another part of the application, you can import and render it like so:
```tsx
import { RichTextEditor } from './components/Editor'; // Adjust path as needed

function MyPageComponent() {
  return (
    <div>
      <h2>My Document</h2>
      <RichTextEditor
        initialContent="<p>Start typing here...</p>"
        onChange={(html) => {
          console.log("Editor content changed:", html);
          // You can save the HTML content to a database or state management store here
        }}
      />
    </div>
  );
}
```

## Customization

Tiptap is highly extensible. To add more features (e.g., more formatting options, custom nodes, different suggestion types):
1.  **Add Extensions**: Install any necessary Tiptap extensions (e.g., `@tiptap/extension-link`, `@tiptap/extension-image`).
2.  **Configure Editor**: Add the new extensions to the `extensions` array in `RichTextEditor.tsx`.
3.  **Update UI**:
    *   For toolbar buttons, modify `SelectionToolbar.tsx` or create new toolbars.
    *   For slash commands, add new command definitions to `slashCommands.ts` and ensure `SlashCommandsList.tsx` can render them appropriately.
4.  **CSS**: Add any necessary styling for new elements or toolbar buttons in `src/index.css` or component-specific CSS.

---

This project was initialized using the React + TypeScript + Vite template. For more information on the base template, see below.

# React + TypeScript + Vite (Original Template Info)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```typescript
// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Previous Eslint config items
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
