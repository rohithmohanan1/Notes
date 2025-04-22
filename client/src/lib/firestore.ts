import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { 
  Note, InsertNote, 
  Folder, InsertFolder, 
  Category, InsertCategory, 
  Tag, InsertTag 
} from "@shared/schema";

// This file helps with offline capabilities by syncing local data with Firestore
// For immediate updates, we use the Express API, then sync with Firestore later

// Notes
export async function syncNotesToFirestore(userId: number): Promise<void> {
  try {
    // Get all notes from the server
    const response = await fetch(`/api/notes?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error("Failed to get notes");
    }
    
    const notes: Note[] = await response.json();
    
    // Get reference to Firestore collection
    const userNotesRef = collection(db, "users", userId.toString(), "notes");
    
    // Create a batch write
    for (const note of notes) {
      const docRef = doc(userNotesRef, note.id.toString());
      await updateDoc(docRef, {
        ...note,
        updatedAt: serverTimestamp()
      }).catch(() => {
        // If update fails, document doesn't exist, so create it
        return addDoc(userNotesRef, {
          ...note,
          id: note.id.toString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
    }
  } catch (error) {
    console.error("Error syncing notes to Firestore", error);
  }
}

// Create a note both in Express and Firestore
export async function createNote(note: InsertNote): Promise<Note> {
  try {
    // First create in Express API
    const response = await apiRequest("POST", "/api/notes", note);
    
    if (!response.ok) {
      throw new Error("Failed to create note");
    }
    
    // Then create in Firestore
    const newNote: Note = await response.json();
    const userNotesRef = collection(db, "users", note.userId.toString(), "notes");
    
    await addDoc(userNotesRef, {
      ...newNote,
      id: newNote.id.toString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    
    return newNote;
  } catch (error) {
    console.error("Error creating note", error);
    throw error;
  }
}

// Update a note both in Express and Firestore
export async function updateNote(id: number, note: Partial<InsertNote>): Promise<Note> {
  try {
    // First update in Express API
    const response = await apiRequest("PUT", `/api/notes/${id}`, note);
    
    if (!response.ok) {
      throw new Error("Failed to update note");
    }
    
    // Then update in Firestore
    const updatedNote: Note = await response.json();
    const userNotesRef = collection(db, "users", updatedNote.userId.toString(), "notes");
    const docRef = doc(userNotesRef, id.toString());
    
    await updateDoc(docRef, {
      ...note,
      updatedAt: serverTimestamp()
    });
    
    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/notes", id.toString()] });
    
    return updatedNote;
  } catch (error) {
    console.error("Error updating note", error);
    throw error;
  }
}

// Delete a note both in Express and Firestore
export async function deleteNote(id: number, userId: number): Promise<void> {
  try {
    // First delete in Express API
    const response = await apiRequest("DELETE", `/api/notes/${id}`, null);
    
    if (!response.ok) {
      throw new Error("Failed to delete note");
    }
    
    // Then delete in Firestore
    const userNotesRef = collection(db, "users", userId.toString(), "notes");
    const docRef = doc(userNotesRef, id.toString());
    
    await deleteDoc(docRef);
    
    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
  } catch (error) {
    console.error("Error deleting note", error);
    throw error;
  }
}

// Similar functions for folders, categories, and tags
// These follow the same pattern as the note functions

// Folders
export async function createFolder(folder: InsertFolder): Promise<Folder> {
  try {
    const response = await apiRequest("POST", "/api/folders", folder);
    const newFolder: Folder = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    return newFolder;
  } catch (error) {
    console.error("Error creating folder", error);
    throw error;
  }
}

export async function updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder> {
  try {
    const response = await apiRequest("PUT", `/api/folders/${id}`, folder);
    const updatedFolder: Folder = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    return updatedFolder;
  } catch (error) {
    console.error("Error updating folder", error);
    throw error;
  }
}

export async function deleteFolder(id: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/folders/${id}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
  } catch (error) {
    console.error("Error deleting folder", error);
    throw error;
  }
}

// Categories
export async function createCategory(category: InsertCategory): Promise<Category> {
  try {
    const response = await apiRequest("POST", "/api/categories", category);
    const newCategory: Category = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    return newCategory;
  } catch (error) {
    console.error("Error creating category", error);
    throw error;
  }
}

export async function updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
  try {
    const response = await apiRequest("PUT", `/api/categories/${id}`, category);
    const updatedCategory: Category = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category", error);
    throw error;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/categories/${id}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
  } catch (error) {
    console.error("Error deleting category", error);
    throw error;
  }
}

// Tags
export async function createTag(tag: InsertTag): Promise<Tag> {
  try {
    const response = await apiRequest("POST", "/api/tags", tag);
    const newTag: Tag = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
    return newTag;
  } catch (error) {
    console.error("Error creating tag", error);
    throw error;
  }
}

export async function updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag> {
  try {
    const response = await apiRequest("PUT", `/api/tags/${id}`, tag);
    const updatedTag: Tag = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
    return updatedTag;
  } catch (error) {
    console.error("Error updating tag", error);
    throw error;
  }
}

export async function deleteTag(id: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/tags/${id}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
  } catch (error) {
    console.error("Error deleting tag", error);
    throw error;
  }
}

// Note Tags
export async function addTagToNote(noteId: number, tagId: number): Promise<void> {
  try {
    await apiRequest("POST", `/api/notes/${noteId}/tags/${tagId}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
  } catch (error) {
    console.error("Error adding tag to note", error);
    throw error;
  }
}

export async function removeTagFromNote(noteId: number, tagId: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/notes/${noteId}/tags/${tagId}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
  } catch (error) {
    console.error("Error removing tag from note", error);
    throw error;
  }
}
