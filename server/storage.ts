import { db } from "./db";
import {
  words, rules, verbs, contextSentences,
  type Word, type InsertWord, type UpdateWordRequest,
  type Rule, type InsertRule, type UpdateRuleRequest,
  type Verb, type InsertVerb, type UpdateVerbRequest,
  type ContextSentence, type InsertContextSentence
} from "@shared/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  getWords(): Promise<Word[]>;
  getWord(id: number): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  updateWord(id: number, updates: UpdateWordRequest): Promise<Word | undefined>;
  deleteWord(id: number): Promise<boolean>;

  getRules(): Promise<Rule[]>;
  getRule(id: number): Promise<Rule | undefined>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, updates: UpdateRuleRequest): Promise<Rule | undefined>;
  deleteRule(id: number): Promise<boolean>;

  getVerbs(): Promise<Verb[]>;
  getVerb(id: number): Promise<Verb | undefined>;
  createVerb(verb: InsertVerb): Promise<Verb>;
  updateVerb(id: number, updates: UpdateVerbRequest): Promise<Verb | undefined>;
  deleteVerb(id: number): Promise<boolean>;

  searchContext(query: string): Promise<ContextSentence[]>;
  getContextCount(): Promise<number>;
  createContextSentence(sentence: InsertContextSentence): Promise<ContextSentence>;
  createContextSentencesBulk(sentences: InsertContextSentence[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWords(): Promise<Word[]> {
    return await db.select().from(words);
  }
  async getWord(id: number): Promise<Word | undefined> {
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word;
  }
  async createWord(word: InsertWord): Promise<Word> {
    const [created] = await db.insert(words).values(word).returning();
    return created;
  }
  async updateWord(id: number, updates: UpdateWordRequest): Promise<Word | undefined> {
    const [updated] = await db.update(words).set(updates).where(eq(words.id, id)).returning();
    return updated;
  }
  async deleteWord(id: number): Promise<boolean> {
    const [deleted] = await db.delete(words).where(eq(words.id, id)).returning();
    return !!deleted;
  }

  async getRules(): Promise<Rule[]> {
    return await db.select().from(rules);
  }
  async getRule(id: number): Promise<Rule | undefined> {
    const [rule] = await db.select().from(rules).where(eq(rules.id, id));
    return rule;
  }
  async createRule(rule: InsertRule): Promise<Rule> {
    const [created] = await db.insert(rules).values(rule).returning();
    return created;
  }
  async updateRule(id: number, updates: UpdateRuleRequest): Promise<Rule | undefined> {
    const [updated] = await db.update(rules).set(updates).where(eq(rules.id, id)).returning();
    return updated;
  }
  async deleteRule(id: number): Promise<boolean> {
    const [deleted] = await db.delete(rules).where(eq(rules.id, id)).returning();
    return !!deleted;
  }

  async getVerbs(): Promise<Verb[]> {
    return await db.select().from(verbs);
  }
  async getVerb(id: number): Promise<Verb | undefined> {
    const [verb] = await db.select().from(verbs).where(eq(verbs.id, id));
    return verb;
  }
  async createVerb(verb: InsertVerb): Promise<Verb> {
    const [created] = await db.insert(verbs).values(verb).returning();
    return created;
  }
  async updateVerb(id: number, updates: UpdateVerbRequest): Promise<Verb | undefined> {
    const [updated] = await db.update(verbs).set(updates).where(eq(verbs.id, id)).returning();
    return updated;
  }
  async deleteVerb(id: number): Promise<boolean> {
    const [deleted] = await db.delete(verbs).where(eq(verbs.id, id)).returning();
    return !!deleted;
  }
  async searchContext(query: string): Promise<ContextSentence[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const wordPattern = `% ${q} %`;
    const startPattern = `${q} %`;
    const endPattern = `% ${q}`;
    const exactPattern = q;
    const substringPattern = `%${q}%`;

    const results = await db.select().from(contextSentences).where(
      or(
        ilike(contextSentences.dutch, wordPattern),
        ilike(contextSentences.dutch, startPattern),
        ilike(contextSentences.dutch, endPattern),
        sql`lower(${contextSentences.dutch}) = ${exactPattern}`,
        ilike(contextSentences.dutch, substringPattern),
      )
    ).limit(20);
    return results;
  }

  async getContextCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(contextSentences);
    return Number(result[0]?.count ?? 0);
  }

  async createContextSentence(sentence: InsertContextSentence): Promise<ContextSentence> {
    const [created] = await db.insert(contextSentences).values(sentence).returning();
    return created;
  }

  async createContextSentencesBulk(sentences: InsertContextSentence[]): Promise<void> {
    if (sentences.length === 0) return;
    const batchSize = 50;
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      await db.insert(contextSentences).values(batch);
    }
  }
}

export const storage = new DatabaseStorage();
