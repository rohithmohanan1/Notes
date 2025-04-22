import {
  users, notes, folders, categories, tags, noteTags,
  type User, type InsertUser,
  type Note, type InsertNote,
  type Folder, type InsertFolder,
  type Category, type InsertCategory,
  type Tag, type InsertTag,
  type NoteTag, type InsertNoteTag
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Notes
  getNote(id: number): Promise<Note | undefined>;
  getNotesByUserId(userId: number): Promise<Note[]>;
  getNotesByFolderId(folderId: number): Promise<Note[]>;
  getNotesByCategoryId(categoryId: number): Promise<Note[]>;
  getNotesByTagId(tagId: number): Promise<Note[]>;
  searchNotes(userId: number, query: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Folders
  getFolder(id: number): Promise<Folder | undefined>;
  getFoldersByUserId(userId: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Tags
  getTag(id: number): Promise<Tag | undefined>;
  getTagsByUserId(userId: number): Promise<Tag[]>;
  getTagsByNoteId(noteId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Note Tags
  addTagToNote(noteTag: InsertNoteTag): Promise<NoteTag>;
  removeTagFromNote(noteId: number, tagId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  private folders: Map<number, Folder>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private noteTags: Map<number, NoteTag>;
  
  userCurrentId: number;
  noteCurrentId: number;
  folderCurrentId: number;
  categoryCurrentId: number;
  tagCurrentId: number;
  noteTagCurrentId: number;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.folders = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.noteTags = new Map();
    
    this.userCurrentId = 1;
    this.noteCurrentId = 1;
    this.folderCurrentId = 1;
    this.categoryCurrentId = 1;
    this.tagCurrentId = 1;
    this.noteTagCurrentId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Notes
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }

  async getNotesByFolderId(folderId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.folderId === folderId);
  }

  async getNotesByCategoryId(categoryId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.categoryId === categoryId);
  }

  async getNotesByTagId(tagId: number): Promise<Note[]> {
    const noteIds = Array.from(this.noteTags.values())
      .filter(noteTag => noteTag.tagId === tagId)
      .map(noteTag => noteTag.noteId);
    
    return Array.from(this.notes.values())
      .filter(note => noteIds.includes(note.id));
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const lowercasedQuery = query.toLowerCase();
    
    return Array.from(this.notes.values())
      .filter(note => 
        note.userId === userId && 
        (
          note.title.toLowerCase().includes(lowercasedQuery) ||
          JSON.stringify(note.content).toLowerCase().includes(lowercasedQuery)
        )
      );
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    const note: Note = { ...insertNote, id, createdAt: now, updatedAt: now };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, partialNote: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    
    if (!existingNote) {
      return undefined;
    }
    
    const updatedNote: Note = { 
      ...existingNote, 
      ...partialNote, 
      updatedAt: new Date() 
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    // Delete associated note-tag relationships
    Array.from(this.noteTags.entries())
      .filter(([_, noteTag]) => noteTag.noteId === id)
      .forEach(([noteTagId, _]) => this.noteTags.delete(noteTagId));
      
    return this.notes.delete(id);
  }

  // Folders
  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async getFoldersByUserId(userId: number): Promise<Folder[]> {
    return Array.from(this.folders.values())
      .filter(folder => folder.userId === userId);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.folderCurrentId++;
    const now = new Date();
    const folder: Folder = { ...insertFolder, id, createdAt: now };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, partialFolder: Partial<InsertFolder>): Promise<Folder | undefined> {
    const existingFolder = this.folders.get(id);
    
    if (!existingFolder) {
      return undefined;
    }
    
    const updatedFolder: Folder = { 
      ...existingFolder, 
      ...partialFolder
    };
    
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    // Update notes in this folder to have null folderId
    Array.from(this.notes.entries())
      .filter(([_, note]) => note.folderId === id)
      .forEach(([noteId, note]) => {
        this.notes.set(noteId, { ...note, folderId: null });
      });
      
    return this.folders.delete(id);
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.userId === userId);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const now = new Date();
    const category: Category = { ...insertCategory, id, createdAt: now };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, partialCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    
    if (!existingCategory) {
      return undefined;
    }
    
    const updatedCategory: Category = { 
      ...existingCategory, 
      ...partialCategory
    };
    
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Update notes in this category to have null categoryId
    Array.from(this.notes.entries())
      .filter(([_, note]) => note.categoryId === id)
      .forEach(([noteId, note]) => {
        this.notes.set(noteId, { ...note, categoryId: null });
      });
      
    return this.categories.delete(id);
  }

  // Tags
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagsByUserId(userId: number): Promise<Tag[]> {
    return Array.from(this.tags.values())
      .filter(tag => tag.userId === userId);
  }

  async getTagsByNoteId(noteId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.noteTags.values())
      .filter(noteTag => noteTag.noteId === noteId)
      .map(noteTag => noteTag.tagId);
    
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.tagCurrentId++;
    const now = new Date();
    const tag: Tag = { ...insertTag, id, createdAt: now };
    this.tags.set(id, tag);
    return tag;
  }

  async updateTag(id: number, partialTag: Partial<InsertTag>): Promise<Tag | undefined> {
    const existingTag = this.tags.get(id);
    
    if (!existingTag) {
      return undefined;
    }
    
    const updatedTag: Tag = { 
      ...existingTag, 
      ...partialTag
    };
    
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: number): Promise<boolean> {
    // Delete associated note-tag relationships
    Array.from(this.noteTags.entries())
      .filter(([_, noteTag]) => noteTag.tagId === id)
      .forEach(([noteTagId, _]) => this.noteTags.delete(noteTagId));
      
    return this.tags.delete(id);
  }

  // Note Tags
  async addTagToNote(insertNoteTag: InsertNoteTag): Promise<NoteTag> {
    // Check if relationship already exists
    const exists = Array.from(this.noteTags.values()).some(
      noteTag => noteTag.noteId === insertNoteTag.noteId && noteTag.tagId === insertNoteTag.tagId
    );
    
    if (exists) {
      throw new Error('Tag is already assigned to this note');
    }
    
    const id = this.noteTagCurrentId++;
    const noteTag: NoteTag = { ...insertNoteTag, id };
    this.noteTags.set(id, noteTag);
    return noteTag;
  }

  async removeTagFromNote(noteId: number, tagId: number): Promise<boolean> {
    const noteTagEntry = Array.from(this.noteTags.entries())
      .find(([_, noteTag]) => noteTag.noteId === noteId && noteTag.tagId === tagId);
    
    if (!noteTagEntry) {
      return false;
    }
    
    return this.noteTags.delete(noteTagEntry[0]);
  }
}

export const storage = new MemStorage();
