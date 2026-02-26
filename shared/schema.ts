import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  dutch: text("dutch").notNull(),
  translation: text("translation").notNull(),
  translationRu: text("translation_ru").notNull(),
  translationEn: text("translation_en").notNull(),
  translationUk: text("translation_uk").notNull().default(''),
  knownCount: integer("known_count").notNull().default(0),
  isLearned: boolean("is_learned").notNull().default(false),
  level: text("level"),
  isUserAdded: boolean("is_user_added").notNull().default(false),
  wrongCount: integer("wrong_count").notNull().default(0),
  repeatKnownCount: integer("repeat_known_count").notNull().default(0),
  inRepeatList: boolean("in_repeat_list").notNull().default(false),
});

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
  titleEn: text("title_en").notNull().default(''),
  explanationEn: text("explanation_en").notNull().default(''),
  titleUk: text("title_uk").notNull().default(''),
  explanationUk: text("explanation_uk").notNull().default(''),
  difficulty: text("difficulty").notNull(),
});

export const verbs = pgTable("verbs", {
  id: serial("id").primaryKey(),
  infinitive: text("infinitive").notNull(),
  pastSingular: text("past_singular").notNull(),
  pastParticiple: text("past_participle").notNull(),
  translation: text("translation").notNull(),
  example: text("example").notNull(),
  isLearned: boolean("is_learned").notNull().default(false),
});

export const contextSentences = pgTable("context_sentences", {
  id: serial("id").primaryKey(),
  dutch: text("dutch").notNull(),
  english: text("english").notNull(),
  level: text("level"),
});

export const insertContextSentenceSchema = createInsertSchema(contextSentences).omit({ id: true });
export type ContextSentence = typeof contextSentences.$inferSelect;
export type InsertContextSentence = z.infer<typeof insertContextSentenceSchema>;

export const insertWordSchema = createInsertSchema(words).omit({ id: true });
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true });
export const insertVerbSchema = createInsertSchema(verbs).omit({ id: true });

export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type UpdateWordRequest = Partial<InsertWord>;

export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type UpdateRuleRequest = Partial<InsertRule>;

export type Verb = typeof verbs.$inferSelect;
export type InsertVerb = z.infer<typeof insertVerbSchema>;
export type UpdateVerbRequest = Partial<InsertVerb>;

export * from "./models/auth";
