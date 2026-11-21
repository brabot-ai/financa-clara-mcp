import fixture from "@/data/fixture.json";
import type { Dataset } from "./types";
// Swap this function for a future service layer; the engine only depends on Dataset.
export function getDataset(): Dataset {
  return fixture as Dataset;
}
