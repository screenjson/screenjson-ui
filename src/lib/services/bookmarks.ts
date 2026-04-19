/**
 * Bookmarks and Notes Service
 * Manages user bookmarks and notes stored in localStorage
 */

import { browser } from '$app/environment';
import type { UUID, Lang, Text } from '../types/screenjson';

const STORAGE_KEY_PREFIX = 'screenjson-bookmarks-';
const NOTES_KEY_PREFIX = 'screenjson-notes-';

/** User-created bookmark */
export interface UserBookmark {
  id: string;
  documentId: UUID;
  sceneId: UUID;
  elementId?: UUID;
  title: string;
  description?: string;
  created: string;
  color?: string;
}

/** User-created note */
export interface UserNote {
  id: string;
  documentId: UUID;
  sceneId: UUID;
  elementId: UUID;
  text: string;
  highlight?: [number, number][];
  created: string;
  updated: string;
  color?: string;
}

/** Generate a simple unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Get storage key for a document's bookmarks */
function getBookmarksKey(documentId: UUID): string {
  return `${STORAGE_KEY_PREFIX}${documentId}`;
}

/** Get storage key for a document's notes */
function getNotesKey(documentId: UUID): string {
  return `${NOTES_KEY_PREFIX}${documentId}`;
}

// ============================================================================
// Bookmarks
// ============================================================================

/** Get all bookmarks for a document */
export function getBookmarks(documentId: UUID): UserBookmark[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(getBookmarksKey(documentId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  
  return [];
}

/** Save bookmarks for a document */
function saveBookmarks(documentId: UUID, bookmarks: UserBookmark[]) {
  if (browser) {
    localStorage.setItem(getBookmarksKey(documentId), JSON.stringify(bookmarks));
  }
}

/** Add a bookmark */
export function addBookmark(
  documentId: UUID,
  sceneId: UUID,
  title: string,
  options?: {
    elementId?: UUID;
    description?: string;
    color?: string;
  }
): UserBookmark {
  const bookmark: UserBookmark = {
    id: generateId(),
    documentId,
    sceneId,
    elementId: options?.elementId,
    title,
    description: options?.description,
    created: new Date().toISOString(),
    color: options?.color
  };
  
  const bookmarks = getBookmarks(documentId);
  bookmarks.push(bookmark);
  saveBookmarks(documentId, bookmarks);
  
  return bookmark;
}

/** Update a bookmark */
export function updateBookmark(
  documentId: UUID,
  bookmarkId: string,
  updates: Partial<Pick<UserBookmark, 'title' | 'description' | 'color'>>
): UserBookmark | null {
  const bookmarks = getBookmarks(documentId);
  const index = bookmarks.findIndex((b) => b.id === bookmarkId);
  
  if (index === -1) return null;
  
  bookmarks[index] = { ...bookmarks[index], ...updates };
  saveBookmarks(documentId, bookmarks);
  
  return bookmarks[index];
}

/** Delete a bookmark */
export function deleteBookmark(documentId: UUID, bookmarkId: string): boolean {
  const bookmarks = getBookmarks(documentId);
  const index = bookmarks.findIndex((b) => b.id === bookmarkId);
  
  if (index === -1) return false;
  
  bookmarks.splice(index, 1);
  saveBookmarks(documentId, bookmarks);
  
  return true;
}

/** Get bookmarks for a specific scene */
export function getBookmarksForScene(documentId: UUID, sceneId: UUID): UserBookmark[] {
  return getBookmarks(documentId).filter((b) => b.sceneId === sceneId);
}

// ============================================================================
// Notes
// ============================================================================

/** Get all notes for a document */
export function getNotes(documentId: UUID): UserNote[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(getNotesKey(documentId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  
  return [];
}

/** Save notes for a document */
function saveNotes(documentId: UUID, notes: UserNote[]) {
  if (browser) {
    localStorage.setItem(getNotesKey(documentId), JSON.stringify(notes));
  }
}

/** Add a note */
export function addNote(
  documentId: UUID,
  sceneId: UUID,
  elementId: UUID,
  text: string,
  options?: {
    highlight?: [number, number][];
    color?: string;
  }
): UserNote {
  const now = new Date().toISOString();
  const note: UserNote = {
    id: generateId(),
    documentId,
    sceneId,
    elementId,
    text,
    highlight: options?.highlight,
    created: now,
    updated: now,
    color: options?.color
  };
  
  const notes = getNotes(documentId);
  notes.push(note);
  saveNotes(documentId, notes);
  
  return note;
}

/** Update a note */
export function updateNote(
  documentId: UUID,
  noteId: string,
  updates: Partial<Pick<UserNote, 'text' | 'highlight' | 'color'>>
): UserNote | null {
  const notes = getNotes(documentId);
  const index = notes.findIndex((n) => n.id === noteId);
  
  if (index === -1) return null;
  
  notes[index] = {
    ...notes[index],
    ...updates,
    updated: new Date().toISOString()
  };
  saveNotes(documentId, notes);
  
  return notes[index];
}

/** Delete a note */
export function deleteNote(documentId: UUID, noteId: string): boolean {
  const notes = getNotes(documentId);
  const index = notes.findIndex((n) => n.id === noteId);
  
  if (index === -1) return false;
  
  notes.splice(index, 1);
  saveNotes(documentId, notes);
  
  return true;
}

/** Get notes for a specific element */
export function getNotesForElement(documentId: UUID, elementId: UUID): UserNote[] {
  return getNotes(documentId).filter((n) => n.elementId === elementId);
}

/** Get notes for a specific scene */
export function getNotesForScene(documentId: UUID, sceneId: UUID): UserNote[] {
  return getNotes(documentId).filter((n) => n.sceneId === sceneId);
}

// ============================================================================
// Export/Import
// ============================================================================

/** Export bookmarks and notes for a document */
export function exportUserData(documentId: UUID): {
  bookmarks: UserBookmark[];
  notes: UserNote[];
} {
  return {
    bookmarks: getBookmarks(documentId),
    notes: getNotes(documentId)
  };
}

/** Import bookmarks and notes for a document */
export function importUserData(
  documentId: UUID,
  data: { bookmarks?: UserBookmark[]; notes?: UserNote[] },
  options?: { merge?: boolean }
): void {
  if (options?.merge) {
    // Merge with existing data
    if (data.bookmarks) {
      const existing = getBookmarks(documentId);
      const merged = [...existing];
      for (const bookmark of data.bookmarks) {
        if (!existing.find((b) => b.id === bookmark.id)) {
          merged.push(bookmark);
        }
      }
      saveBookmarks(documentId, merged);
    }
    
    if (data.notes) {
      const existing = getNotes(documentId);
      const merged = [...existing];
      for (const note of data.notes) {
        if (!existing.find((n) => n.id === note.id)) {
          merged.push(note);
        }
      }
      saveNotes(documentId, merged);
    }
  } else {
    // Replace existing data
    if (data.bookmarks) {
      saveBookmarks(documentId, data.bookmarks);
    }
    if (data.notes) {
      saveNotes(documentId, data.notes);
    }
  }
}

/** Clear all user data for a document */
export function clearUserData(documentId: UUID): void {
  if (browser) {
    localStorage.removeItem(getBookmarksKey(documentId));
    localStorage.removeItem(getNotesKey(documentId));
  }
}
