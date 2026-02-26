import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertWord, UpdateWordRequest } from "@shared/schema";

export function useWords() {
  return useQuery({
    queryKey: [api.words.list.path],
    queryFn: async () => {
      const res = await fetch(api.words.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch words");
      const data = await res.json();
      return api.words.list.responses[200].parse(data);
    },
  });
}

export function useCreateWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWord) => {
      const res = await fetch(api.words.create.path, {
        method: api.words.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create word");
      const json = await res.json();
      return api.words.create.responses[201].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.words.list.path] }),
  });
}

export function useUpdateWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateWordRequest }) => {
      const url = buildUrl(api.words.update.path, { id });
      const res = await fetch(url, {
        method: api.words.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update word");
      const json = await res.json();
      return api.words.update.responses[200].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.words.list.path] }),
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.words.delete.path, { id });
      const res = await fetch(url, { method: api.words.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete word");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.words.list.path] }),
  });
}
