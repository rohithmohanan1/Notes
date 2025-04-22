import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertNoteSchema, insertFolderSchema, 
  insertCategorySchema, insertTagSchema, insertNoteTagSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // User routes
  app.get("/api/users/current", async (req, res) => {
    const uid = req.query.uid as string;
    
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }
    
    try {
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const validatedUserData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUserData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Note routes
  app.get("/api/notes", async (req, res) => {
    const userId = Number(req.query.userId);
    const folderId = req.query.folderId ? Number(req.query.folderId) : undefined;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const tagId = req.query.tagId ? Number(req.query.tagId) : undefined;
    const query = req.query.q as string | undefined;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      let notes;
      
      if (query) {
        notes = await storage.searchNotes(userId, query);
      } else if (folderId) {
        notes = await storage.getNotesByFolderId(folderId);
      } else if (categoryId) {
        notes = await storage.getNotesByCategoryId(categoryId);
      } else if (tagId) {
        notes = await storage.getNotesByTagId(tagId);
      } else {
        notes = await storage.getNotesByUserId(userId);
      }
      
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notes" });
    }
  });
  
  app.get("/api/notes/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to get note" });
    }
  });
  
  app.post("/api/notes", async (req, res) => {
    try {
      const validatedNoteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedNoteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid note data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });
  
  app.put("/api/notes/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const validatedNoteData = insertNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateNote(id, validatedNoteData);
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid note data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });
  
  app.delete("/api/notes/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });
  
  // Folder routes
  app.get("/api/folders", async (req, res) => {
    const userId = Number(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      const folders = await storage.getFoldersByUserId(userId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get folders" });
    }
  });
  
  app.post("/api/folders", async (req, res) => {
    try {
      const validatedFolderData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(validatedFolderData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid folder data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });
  
  app.put("/api/folders/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const validatedFolderData = insertFolderSchema.partial().parse(req.body);
      const updatedFolder = await storage.updateFolder(id, validatedFolderData);
      
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(updatedFolder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid folder data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update folder" });
    }
  });
  
  app.delete("/api/folders/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const success = await storage.deleteFolder(id);
      
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    const userId = Number(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const validatedCategoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedCategoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put("/api/categories/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const validatedCategoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, validatedCategoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Tag routes
  app.get("/api/tags", async (req, res) => {
    const userId = Number(req.query.userId);
    const noteId = req.query.noteId ? Number(req.query.noteId) : undefined;
    
    if (!userId && !noteId) {
      return res.status(400).json({ message: "Either User ID or Note ID is required" });
    }
    
    try {
      let tags;
      
      if (noteId) {
        tags = await storage.getTagsByNoteId(noteId);
      } else {
        tags = await storage.getTagsByUserId(userId);
      }
      
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tags" });
    }
  });
  
  app.post("/api/tags", async (req, res) => {
    try {
      const validatedTagData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(validatedTagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid tag data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create tag" });
    }
  });
  
  app.put("/api/tags/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const validatedTagData = insertTagSchema.partial().parse(req.body);
      const updatedTag = await storage.updateTag(id, validatedTagData);
      
      if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(updatedTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid tag data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update tag" });
    }
  });
  
  app.delete("/api/tags/:id", async (req, res) => {
    const id = Number(req.params.id);
    
    try {
      const success = await storage.deleteTag(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });
  
  // Note-Tag routes
  app.post("/api/notes/:noteId/tags/:tagId", async (req, res) => {
    const noteId = Number(req.params.noteId);
    const tagId = Number(req.params.tagId);
    
    try {
      const validatedNoteTagData = insertNoteTagSchema.parse({ noteId, tagId });
      const noteTag = await storage.addTagToNote(validatedNoteTagData);
      res.status(201).json(noteTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to add tag to note" });
    }
  });
  
  app.delete("/api/notes/:noteId/tags/:tagId", async (req, res) => {
    const noteId = Number(req.params.noteId);
    const tagId = Number(req.params.tagId);
    
    try {
      const success = await storage.removeTagFromNote(noteId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Relationship not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
