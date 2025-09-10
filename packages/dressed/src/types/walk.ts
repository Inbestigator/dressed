export interface WalkEntry {
  name: string;
  path: string;
  uid: string;
}

export interface ImportedWalkEntry extends WalkEntry {
  category: "commands" | "components" | "events";
  exports: unknown;
}
