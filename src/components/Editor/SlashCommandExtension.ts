import { Extension } from '@tiptap/core';
import { ReactRenderer, Editor as TiptapReactEditor } from '@tiptap/react'; // Use TiptapReactEditor for type clarity
import Suggestion, { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import tippy, { GetReferenceClientRect, Instance as TippyInstance } from 'tippy.js';
import { Plugin } from 'prosemirror-state';

import slashCommands, { SlashCommandItem } from './slashCommands';
import SlashCommandsList, { SlashCommandsListRef } from './SlashCommandsList'; // Assuming ref is exported for ReactRenderer
import { RefObject } from 'react'; // For the ref

// Optional: Define options for your extension if you want to make it configurable
export interface SlashCommandExtensionOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandItem>, 'editor'>; // Allow overriding suggestion options
}

export const SlashCommand = Extension.create<SlashCommandExtensionOptions>({
  name: 'slashCommand',

  defaultOptions: {
    suggestion: {
      char: '/',
      items: ({ query }: { query: string }): SlashCommandItem[] => {
        return slashCommands
          .filter(item =>
            item.title.toLowerCase().startsWith(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10);
      },
      command: ({ editor, range, props }) => {
        props.command({ editor, range });
      },
      render: () => {
        let component: ReactRenderer<SlashCommandsListRef, SuggestionProps<SlashCommandItem>>;
        let popup: TippyInstance[];
        // Ref for the slash command list component to allow calling its onKeyDown method
        // This ref will be managed by ReactRenderer
        // const slashCommandsListRef: RefObject<SlashCommandsListRef> = { current: null };

        return {
          onStart: (props: SuggestionProps<SlashCommandItem>) => {
            component = new ReactRenderer(SlashCommandsList, {
              props,
              editor: props.editor as TiptapReactEditor, // Cast to TiptapReactEditor
              // ref: slashCommandsListRef, // Pass the ref to SlashCommandsList - ReactRenderer handles ref forwarding
            });

            // The 'ref' for SlashCommandsList is handled internally by ReactRenderer if SlashCommandsList uses forwardRef.
            // We will access component.ref to call methods like onKeyDown.

            if (!props.clientRect) return;
            const clientRect = props.clientRect as GetReferenceClientRect;

            popup = tippy('body', {
              getReferenceClientRect: clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              theme: 'light-border',
              arrow: false,
            });
          },
          onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
            component.updateProps(props);
            if (!props.clientRect) return;
            const clientRect = props.clientRect as GetReferenceClientRect;
            popup[0].setProps({ getReferenceClientRect: clientRect });
          },
          onKeyDown: ({ event }: { event: KeyboardEvent }): boolean => {
            if (event.key === 'Escape') {
              popup[0].hide();
              return true;
            }
            // Access the ref via component.ref (if component is an instance of ReactRenderer)
            // and SlashCommandsList is a forwardRef component exposing onKeyDown
            return component.ref?.onKeyDown({ event }) ?? false;
          },
          onExit: () => {
            if (popup && popup[0]) popup[0].destroy();
            if (component) component.destroy();
          },
        };
      },
    },
  },

  addProseMirrorPlugins() {
    // Important: `this.editor` is the Tiptap editor instance
    // `this.options.suggestion` holds the suggestion configuration defined above
    // We need to ensure the `editor` property within the suggestion options is correctly set.
    // The Suggestion utility itself handles passing the editor to its internal callbacks.

    const suggestionOptionsWithEditor = {
      ...this.options.suggestion,
      editor: this.editor, // Pass the editor instance to the suggestion plugin
    };

    return [
      Suggestion(suggestionOptionsWithEditor as SuggestionOptions<any>), // Cast to any to avoid type mismatch for now
    ];
  },
});

export default SlashCommand;
