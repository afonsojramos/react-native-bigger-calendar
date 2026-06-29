import fs from "node:fs";
import path from "node:path";

// Architectural guard: the whole point of separate packages is that the package
// boundary is enforceable. core stays platform-free, dom never pulls React
// Native, native never pulls react-dom, and no package imports its own barrel
// internally (which would defeat tree-shaking / lean chunks). This scans source
// files directly so a forbidden import fails CI rather than slipping through.

const REPO = path.resolve(__dirname, "..");

function sources(pkg: string): string[] {
  const dir = path.join(REPO, "packages", pkg, "src");
  return fs
    .readdirSync(dir, { recursive: true })
    .map((entry) => path.join(dir, entry.toString()))
    .filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes("__tests__"));
}

function importsOf(file: string): string[] {
  // Strip comments first: JSDoc @example blocks legitimately show consumers the
  // public barrel import (e.g. `import { Calendar } from "@super-calendar/native"`),
  // which is documentation, not a real internal import that would hurt tree-shaking.
  const code = fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  const specs: string[] = [];
  const re = /(?:\bfrom|\brequire\(|\bimport)\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) specs.push(m[1]);
  return specs;
}

function findForbidden(pkg: string, forbidden: RegExp): string[] {
  const hits: string[] = [];
  for (const file of sources(pkg)) {
    for (const spec of importsOf(file)) {
      if (forbidden.test(spec)) hits.push(`${path.relative(REPO, file)} -> ${spec}`);
    }
  }
  return hits;
}

describe("package import boundaries", () => {
  it("core imports no platform packages (RN, react-dom, Legend List)", () => {
    expect(findForbidden("core", /^(react-native|react-native-.+|react-dom|@legendapp\/)/)).toEqual(
      [],
    );
  });

  it("dom imports no React Native packages", () => {
    expect(
      findForbidden(
        "dom",
        /^(react-native|react-native-reanimated|react-native-gesture-handler|react-native-worklets)$/,
      ),
    ).toEqual([]);
  });

  it("native imports no react-dom", () => {
    expect(findForbidden("native", /^react-dom(\/.*)?$/)).toEqual([]);
  });

  it("no package imports its own published barrel internally", () => {
    const selfNames: Record<string, string> = {
      core: "@super-calendar/core",
      native: "@super-calendar/native",
      dom: "@super-calendar/dom",
    };
    const hits: string[] = [];
    for (const [pkg, name] of Object.entries(selfNames)) {
      for (const file of sources(pkg)) {
        for (const spec of importsOf(file)) {
          if (spec === name || spec.startsWith(`${name}/`)) {
            hits.push(`${path.relative(REPO, file)} -> ${spec}`);
          }
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
