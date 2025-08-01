import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  bookingId: string;
  initialNotes?: Note[];
}

export default function BookingNotesPanel({ bookingId, initialNotes = [] }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [text, setText] = useState("");

  const addNote = () => {
    if (!text.trim()) return;
    const newNote: Note = { id: crypto.randomUUID(), content: text.trim(), created_at: new Date().toISOString() };
    setNotes([newNote, ...notes]);
    setText("");
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Notes</h4>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add internal note..."
        className="min-h-[60px]"
      />
      <Button size="sm" onClick={addNote} disabled={!text.trim()}>
        Add Note
      </Button>
      <div className="max-h-60 overflow-y-auto space-y-2 mt-2 pr-2">
        {notes.map((n) => (
          <div key={n.id} className="bg-muted/50 p-2 rounded-md text-sm">
            <p>{n.content}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
      </div>
    </div>
  );
}
