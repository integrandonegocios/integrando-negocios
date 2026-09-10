import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import ts from "typescript";

// Execute the real server module with explicit isolated dependencies. No network or DB.
export function loadServerModule<T>(file: string, dependencies: Record<string, unknown> = {}): T {
  const filename = resolve(file);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = createRequire(filename);
  const isolatedRequire = (name: string) => {
    if (name === "server-only") return {};
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name.startsWith("node:")) return localRequire(name);
    throw new Error("Dependência de teste não configurada.");
  };
  const loaded = { exports: {} };
  new Function("require", "module", "exports", source)(isolatedRequire, loaded, loaded.exports);
  return loaded.exports as T;
}
