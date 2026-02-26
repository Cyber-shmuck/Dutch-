import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertVerb, type UpdateVerbRequest } from "@shared/routes";

export function useVerbs() {
  return useQuery({
    queryKey: [api.verbs.list.path],
    queryFn: async () => {
      const res = await fetch(api.verbs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch verbs");
      const data = await res.json();
      return api.verbs.list.responses[200].parse(data);
    },
  });
}

export function useCreateVerb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertVerb) => {
      const res = await fetch(api.verbs.create.path, {
        method: api.verbs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create verb");
      const json = await res.json();
      return api.verbs.create.responses[201].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.verbs.list.path] }),
  });
}

export function useUpdateVerb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateVerbRequest }) => {
      const url = buildUrl(api.verbs.update.path, { id });
      const res = await fetch(url, {
        method: api.verbs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update verb");
      const json = await res.json();
      return api.verbs.update.responses[200].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.verbs.list.path] }),
  });
}

export function useDeleteVerb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.verbs.delete.path, { id });
      const res = await fetch(url, { method: api.verbs.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete verb");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.verbs.list.path] }),
  });
}
