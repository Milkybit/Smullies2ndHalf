"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppState } from "@/domain/types";
import { browserRepository, initialState } from "@/services/storage";
import { buildCatalog } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
import { resolveBatch } from "@/calculations/batch";
import { calculateTargets } from "@/calculations/energy";

interface Store {
  state: AppState;
  ready: boolean;
  storageError: string;
  update: (change: (state: AppState) => AppState) => void;
  replace: (state: AppState) => void;
  reset: () => void;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const loaded = browserRepository(window.localStorage).load();
      stateRef.current = loaded;
      setState(loaded);
    } catch {
      setStorageError(
        "Je lokale gegevens konden niet worden geladen. Controleer je browseropslag of herstel een back-up via Instellingen. De opgeslagen inhoud is niet automatisch overschreven.",
      );
    }
    setReady(true);
  }, []);
  const replace = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
    try {
      browserRepository(window.localStorage).save(next);
      setStorageError("");
    } catch {
      setStorageError(
        "Opslaan is niet gelukt. Je wijzigingen staan alleen in deze sessie. Exporteer je gegevens via Instellingen voordat je afsluit.",
      );
    }
  }, []);
  const update = useCallback(
    (change: (state: AppState) => AppState) =>
      replace(change(stateRef.current)),
    [replace],
  );
  const reset = useCallback(() => {
    try {
      browserRepository(window.localStorage).reset();
      stateRef.current = initialState();
      setState(stateRef.current);
      setStorageError("");
    } catch {
      setStorageError(
        "Resetten is niet gelukt. Controleer of je browser lokale opslag toestaat.",
      );
    }
  }, []);
  return (
    <Context.Provider
      value={{ state, ready, storageError, update, replace, reset }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider ontbreekt.");
  return value;
}
export function usePlanner() {
  const store = useStore();
  const catalog = useMemo(
    () => buildCatalog(store.state.ingredientOverrides),
    [store.state.ingredientOverrides],
  );
  const batch = useMemo(
    () => resolveBatch(store.state.batch, recipes, catalog),
    [store.state.batch, catalog],
  );
  const targets = useMemo(
    () =>
      store.state.profile
        ? calculateTargets(store.state.profile, store.state.overrides)
        : null,
    [store.state.profile, store.state.overrides],
  );
  return { ...store, catalog, batch, targets };
}
