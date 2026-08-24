"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { useUpdateNote } from "@/hooks/use-notes";
import { Note } from "@/lib/types";
import toast from "react-hot-toast";

interface TiptapEditorProps {
  note: Note;
}

export function TiptapEditor({ note }: TiptapEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const updateNote = useUpdateNote();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something amazing...",
      }),
      CharacterCount,
    ],
    content: note.content || "",
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      setHasChanges(true);
      // Auto-save with 3-second debounce
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveNote(newContent);
      }, 3000);
    },
  });

  const saveNote = useCallback(
    async (newContent: string) => {
      try {
        await updateNote.mutateAsync({
          id: note.id,
          title: title.trim() || "Untitled",
          content: newContent,
        });
        setHasChanges(false);
        toast.success("Note saved", { duration: 1500, icon: "💾" });
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to save note");
      }
    },
    [note.id, title, updateNote]
  );

  // Auto-save title changes with 3-second debounce
  useEffect(() => {
    if (!hasChanges && title === note.title) return;
    
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        const newContent = editor?.getHTML() || content;
        saveNote(newContent);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, hasChanges, saveNote, note, editor]);

  const saveNow = () => {
    const newContent = editor?.getHTML() || content;
    saveNote(newContent);
  };

  const charLimit = 10000;
  const currentChars = editor?.getText().length || 0;

  return (
    <div className="space-y-4">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-2xl font-bold bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/50"
      />

      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("bold") ? "bg-accent text-primary" : ""
            }`}
            title="Bold (⌘B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("italic") ? "bg-accent text-primary" : ""
            }`}
            title="Italic (⌘I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("strike") ? "bg-accent text-primary" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-accent text-primary" : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-accent text-primary" : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-accent text-primary" : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("bulletList") ? "bg-accent text-primary" : ""
            }`}
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("orderedList") ? "bg-accent text-primary" : ""
            }`}
            title="Ordered list"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("blockquote") ? "bg-accent text-primary" : ""
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-accent transition-colors ${
              editor.isActive("code") ? "bg-accent text-primary" : ""
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1 ml-auto" />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Undo (⌘Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Redo (⌘Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={saveNow}
            className="p-1.5 rounded hover:bg-accent transition-colors text-xs text-muted-foreground"
            title="Save now (Ctrl+Enter)"
          >
            {hasChanges ? "Saving..." : "Saved"}
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="min-h-[300px] border border-border rounded-xl bg-card overflow-hidden">
        <EditorContent
          editor={editor}
          className="tiptap p-6"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Auto-saves every 3 seconds • {currentChars}/{charLimit} characters
        </span>
        {hasChanges && (
          <span className="text-primary font-medium">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
