import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertRule, type UpdateRuleRequest } from "@shared/routes";

export function useRules() {
  return useQuery({
    queryKey: [api.rules.list.path],
    queryFn: async () => {
      const res = await fetch(api.rules.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rules");
      const data = await res.json();
      return api.rules.list.responses[200].parse(data);
    },
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRule) => {
      const res = await fetch(api.rules.create.path, {
        method: api.rules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create rule");
      const json = await res.json();
      return api.rules.create.responses[201].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.rules.list.path] }),
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateRuleRequest }) => {
      const url = buildUrl(api.rules.update.path, { id });
      const res = await fetch(url, {
        method: api.rules.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update rule");
      const json = await res.json();
      return api.rules.update.responses[200].parse(json);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.rules.list.path] }),
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.rules.delete.path, { id });
      const res = await fetch(url, { method: api.rules.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete rule");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.rules.list.path] }),
  });
}
