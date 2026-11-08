import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: api.getProducts, staleTime: 60_000 });

export const useProduct = (id: number) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id),
    enabled: Number.isFinite(id),
    retry: false,
  });
