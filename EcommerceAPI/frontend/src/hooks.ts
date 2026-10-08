import { useCallback, useEffect, useState, type DependencyList } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { STORE_NAME } from "./config";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

interface ResourceState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/** Fetch on mount and whenever deps change. Keeps previous data while reloading. */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ data: s.data, error, loading: false }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} - ${STORE_NAME}` : STORE_NAME;
  }, [title]);
}

/** Adds to the bag, or sends signed-out visitors to sign in and brings them back. */
export function useAddToBag() {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    async (productId: string, quantity = 1): Promise<boolean> => {
      if (!user) {
        navigate("/account", {
          state: {
            from: location.pathname + location.search,
            notice: "Sign in to add items to your bag.",
          },
        });
        return false;
      }
      return add(productId, quantity);
    },
    [user, add, navigate, location.pathname, location.search],
  );
}
