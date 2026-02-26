import { z } from "zod";
import { insertWordSchema, insertRuleSchema, insertVerbSchema, words, rules, verbs } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  words: {
    list: {
      method: "GET" as const,
      path: "/api/words" as const,
      responses: {
        200: z.array(z.custom<typeof words.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/words" as const,
      input: insertWordSchema,
      responses: {
        201: z.custom<typeof words.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/words/:id" as const,
      input: insertWordSchema.partial(),
      responses: {
        200: z.custom<typeof words.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/words/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  rules: {
    list: {
      method: "GET" as const,
      path: "/api/rules" as const,
      responses: {
        200: z.array(z.custom<typeof rules.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/rules" as const,
      input: insertRuleSchema,
      responses: {
        201: z.custom<typeof rules.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/rules/:id" as const,
      input: insertRuleSchema.partial(),
      responses: {
        200: z.custom<typeof rules.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/rules/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  verbs: {
    list: {
      method: "GET" as const,
      path: "/api/verbs" as const,
      responses: {
        200: z.array(z.custom<typeof verbs.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/verbs" as const,
      input: insertVerbSchema,
      responses: {
        201: z.custom<typeof verbs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/verbs/:id" as const,
      input: insertVerbSchema.partial(),
      responses: {
        200: z.custom<typeof verbs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/verbs/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
