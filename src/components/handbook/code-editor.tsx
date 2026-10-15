"use client";

import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Colours come from CSS variables, so the editor follows the light/dark theme without reconfiguring.
const theme = EditorView.theme({
  "&": {
    color: "var(--ink)",
    backgroundColor: "var(--tint)",
    fontSize: "13px",
    maxHeight: "520px",
    border: "1px solid var(--line)",
  },
  "&.cm-focused": { outline: "2px solid var(--accent)", outlineOffset: "2px" },
  ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.6", minHeight: "160px" },
  ".cm-content": { caretColor: "var(--ink)", padding: "10px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--ink)" },
  ".cm-gutters": { backgroundColor: "var(--tint)", color: "var(--muted)", border: "none" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--ink) 6%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent) !important",
  },
  ".cm-tooltip": { backgroundColor: "var(--bg)", border: "1px solid var(--line)", color: "var(--ink)" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "var(--tint)", color: "var(--ink)" },
});

const highlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword], color: "var(--accent)", fontWeight: "600" },
    { tag: [t.string, t.special(t.string), t.regexp], color: "var(--success)" },
    { tag: [t.number, t.bool, t.null, t.atom], color: "var(--syntax-number)" },
    { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--muted)", fontStyle: "italic" },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: "var(--syntax-function)" },
    { tag: [t.className, t.typeName], color: "var(--syntax-function)" },
  ]),
);

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export function CodeEditor({ value, onChange, onRun }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const handlers = useRef({ onChange, onRun });

  useEffect(() => {
    handlers.current = { onChange, onRun };
  });

  // Create the editor once; later `value` changes (e.g. reset) are synced below.
  useEffect(() => {
    const editor = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          javascript(),
          theme,
          highlight,
          EditorView.contentAttributes.of({ "aria-label": "Trình soạn code JavaScript" }),
          // Highest precedence: the default keymap binds Mod-Enter to "insert blank line".
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  handlers.current.onRun();
                  return true;
                },
              },
              {
                // Tab indents inside the editor, so Escape is the way out for keyboard users.
                key: "Escape",
                run: (v) => {
                  v.contentDOM.blur();
                  return true;
                },
              },
            ]),
          ),
          keymap.of([indentWithTab]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) handlers.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `value` only seeds the initial document
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div ref={host} className="code-editor" />;
}
