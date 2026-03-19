import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookCondition } from "../backend.d";
import type { Book } from "../backend.d";
import { useActor } from "./useActor";

export type { Book };
export { BookCondition };

export function useListBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface BookInput {
  id?: string;
  title: string;
  author: string;
  description: string;
  condition: BookCondition;
  price: string;
  imageId: string | null;
}

export function useAddBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookInput) => {
      if (!actor) throw new Error("Not connected");
      const id = input.id ?? crypto.randomUUID();
      await actor.addBook(
        id,
        input.title,
        input.author,
        input.description,
        input.condition,
        input.price,
        input.imageId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BookInput & { id: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateBook(
        input.id,
        input.title,
        input.author,
        input.description,
        input.condition,
        input.price,
        input.imageId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteBook(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useSeedBooks() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.seedBooks();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).claimFirstAdmin();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["isAdmin"] }),
  });
}
