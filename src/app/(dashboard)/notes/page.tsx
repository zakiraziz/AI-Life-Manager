"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, StickyNote, Trash2, Search, X } from "lucide-react";
import { Header } from "@/components/header";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useNotes, useCreateNote, useDeleteNote, useSearchNotes } from "@/hooks/use-notes";
import { useCommandBar } from "@/components/command-bar-provider";
import { Note } from "@/lib/types";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function NotesPage() {
  const { data: notes, isLoading, error } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const { openCommandBar } = useCommandBar();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchNotes(searchQuery);

  const displayedNotes = searchQuery.trim()
    ? searchResults || []
    : notes || [];

  const handleCreateNote = async () => {
    try {
      const note = await createNote.mutateAsync({});
      setSelectedNote(note);
      toast.success("Note created");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (confirm(`Delete note "${note.title}"?`)) {
      try {
        await deleteNote.mutateAsync(note.id);
        if (selectedNote?.id === note.id) setSelectedNote(null);
        toast.success("Note deleted");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      <Header
        title="Notes"
        subtitle="Write freely — auto-saves every 3 seconds"
        showSearch
        onSearch={setSearchQuery}
        searchPlaceholder="Search notes..."
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={openCommandBar}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <kbd className="px-1.5 py-0.5 bg-background rounded text-muted-foreground">
                Ctrl K
              </kbd>
              AI
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Note
            </motion.button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Notes List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<StickyNote className="w-6 h-6" />}
              title="Error loading notes"
              description={(error as Error).message}
            />
          ) : displayedNotes.length === 0 ? (
            <EmptyState
              icon={<StickyNote className="w-6 h-6" />}
              title={searchQuery ? "No notes found" : "No notes yet"}
              description={
                searchQuery
                  ? `No notes match "${searchQuery}"`
                  : "Create your first note to get started!"
              }
            />
          ) : (
            displayedNotes.map((note) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedNote?.id === note.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">
                    {note.title || "Untitled"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note);
                    }}
                    className="p-1 rounded hover:bg-accent hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(note.updated_at), "MMM d, h:mm a")}
                </p>
              </motion.button>
            ))
          )}
        </div>

        {/* Editor */}
        <div>
          {selectedNote ? (
            <motion.div
              key={selectedNote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <TiptapEditor note={selectedNote} />
            </motion.div>
          ) : (
            <EmptyState
              icon={<StickyNote className="w-8 h-8" />}
              title="Select a note"
              description="Choose a note from the list or create a new one to start writing."
              action={
                <button onClick={handleCreateNote} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  New Note
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}