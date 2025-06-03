import { Node, mergeAttributes } from '@tiptap/react';

/**
 * Interface for the attributes of a CalloutNode.
 * @property {string} [icon] - The emoji or character to be used as the icon. Defaults to '📣'.
 * @property {string} [backgroundColor] - Tailwind CSS class(es) for the background color. Defaults to 'bg-sky-100 dark:bg-sky-900'.
 */
export interface CalloutNodeAttributes {
  icon?: string;
  backgroundColor?: string;
}

// Augment Tiptap's command interface to include the `setCallout` command.
// This provides type safety when using `editor.commands.setCallout()`.
declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Toggles a callout block or updates its attributes.
       * If the current selection or node is already a callout, it can update its attributes.
       * If the selection is not a callout, it wraps the current block(s) or creates a new callout.
       * If attributes are provided, they are applied to the callout.
       *
       * @param attributes {CalloutNodeAttributes} [attributes] - Optional attributes to set for the callout node.
       * @example editor.commands.setCallout({ icon: '🎉', backgroundColor: 'bg-yellow-100 dark:bg-yellow-800' })
       * @example editor.commands.setCallout() // Uses default attributes
       */
      setCallout: (attributes?: CalloutNodeAttributes) => ReturnType;
    };
  }
}

/**
 * CalloutNode
 *
 * A Tiptap node extension that creates a distinct block for highlighting information,
 * similar to callout blocks in Notion. It consists of an icon and a content area
 * with a background color.
 *
 * @property {string} name - Node name: 'callout'.
 * @property {string} group - Node group: 'block'. Allows it to be treated as a block-level element.
 * @property {string} content - Content schema: 'block+'. Allows multiple block-level child nodes (e.g., paragraphs, lists).
 * @property {boolean} defining - Marks this node as a defining node, which influences ProseMirror's node resolution.
 * @property {boolean} draggable - Allows the node to be dragged within the editor.
 */
export const CalloutNode = Node.create<CalloutNodeAttributes>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  /**
   * Defines the attributes for this node.
   * @returns {Record<string, Attribute>} A map of attribute definitions.
   * @property {Attribute} icon - Stores the icon for the callout (e.g., an emoji).
   *   - `default`: '📣'
   *   - `parseHTML`: Reads from `data-icon` attribute.
   *   - `renderHTML`: Writes to `data-icon` attribute, used by CSS `::before` pseudo-element.
   * @property {Attribute} backgroundColor - Stores Tailwind CSS class(es) for the background.
   *   - `default`: 'bg-sky-100 dark:bg-sky-900'
   *   - `parseHTML`: Reads from `data-background-color` attribute.
   *   - `renderHTML`: Writes to `data-background-color` attribute (for storage/parsing); actual class is applied in the main `renderHTML`.
   */
  addAttributes() {
    return {
      icon: {
        default: '📣',
        parseHTML: element => element.getAttribute('data-icon') || this.options.icon,
        renderHTML: attributes => {
          if (!attributes.icon) {
            return {};
          }
          return { 'data-icon': attributes.icon };
        },
      },
      backgroundColor: {
        default: 'bg-sky-100 dark:bg-sky-900',
        parseHTML: element => element.getAttribute('data-background-color') || this.options?.backgroundColor,
        renderHTML: attributes => {
          // This stores the value in data-background-color, useful for parsing back.
          // The actual class is applied in the main renderHTML function.
          if (!attributes.backgroundColor) {
            return {};
          }
          return { 'data-background-color': attributes.backgroundColor };
        }
      },
    };
  },

  /**
   * Defines how this node is parsed from HTML input.
   * It looks for a `div` with the attribute `data-type="callout"`.
   * @returns {ParseRule[]} An array of parse rules.
   */
  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  /**
   * Defines how this node is rendered into HTML.
   * It creates a `div` element with `data-type="callout"`, `data-icon`, and applies
   * the background color class. The content of the node is rendered inside this div.
   * The `0` in the returned array schema represents the content hole.
   * @param options {object}
   * @param options.HTMLAttributes {Record<string, any>} HTML attributes from the editor state.
   * @param options.node {ProseMirrorNode} The ProseMirror node instance.
   * @returns {DOMOutputSpec} A DOM output specification.
   */
  renderHTML({ HTMLAttributes, node }) {
    const currentIcon = node.attrs.icon || this.options.icon;
    const currentBgColor = node.attrs.backgroundColor || this.options.backgroundColor;
    // const currentIcon = node.attrs.icon || this.options.attrs.icon.default;
    // const currentBgColor = node.attrs.backgroundColor || this.options.attrs.backgroundColor.default;

    console.log(this.options);

    let finalClass = 'callout-node'; // Base class for CSS styling
    if (currentBgColor) {
      finalClass += ` ${currentBgColor}`; // Add Tailwind background class
    }

    const mergedAttributes = mergeAttributes(HTMLAttributes, {
      'data-type': 'callout',
      class: finalClass,
      'data-icon': currentIcon, // Used by CSS ::before pseudo-element for the icon
    });

    return ['div', mergedAttributes, 0]; // `0` is the content hole
  },

  /**
   * Defines commands available for this node.
   * @returns {Commands} An object mapping command names to command functions.
   * @property {function} setCallout - Command to toggle the callout block or update its attributes.
   */
  addCommands() {
    return {
      setCallout: (attributes?: CalloutNodeAttributes) => ({ commands }) => {
        // `toggleNode` converts the selected node(s) to this node type (`this.name`)
        // or back to a paragraph if already this type.
        // It also applies the provided attributes.
        return commands.toggleNode(this.name, 'paragraph', attributes);

        // console.log(this);

        // return commands.setNode(this.name, attributes);
      },
    };
  },

  // Example of how keyboard shortcuts could be added:
  // addKeyboardShortcuts() {
  //   return {
  //     // Example: 'Mod-Shift-C': () => this.editor.commands.setCallout(),
  //   };
  // },
});

export default CalloutNode;
