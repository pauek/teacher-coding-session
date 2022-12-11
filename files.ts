import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { join } from "https://deno.land/std@0.167.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.167.0/_util/asserts.ts";

const codeDir = Deno.env.get("CODE_DIR") || "./";

const tdec = new TextDecoder();

type FileChangeKind = "changed" | "deleted" | "created";

interface FileChanges {
  filename: string;
  kind: FileChangeKind;
  nlines?: number;
  changes?: [number, string][];
}

export class CodeFile {
  lines: string[] = [];
  constructor(public filename: string) {}

  async readLines() {
    try {
      const bytes = await Deno.readFile(this.filename);
      this.lines = tdec.decode(bytes).split("\n");
      return this.lines.length;
    } catch (e) {
      if (e.name === "NotFound") {
        return -1;
      }
      return 0;
    }
  }

  async getChanges(kind: FileChangeKind): Promise<FileChanges> {
    const oldLines = this.lines;
    const result = await this.readLines();
    if (result === -1) {
      allFiles.delete(this.filename);
      return { filename: this.filename, kind: "deleted" };
    }
    const changes: [number, string][] = [];
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i] != oldLines[i]) {
        changes.push([i, this.lines[i]]);
      }
    }
    return {
      filename: this.filename,
      kind,
      nlines: this.lines.length,
      changes,
    };
  }
}

const _addFile = async (absPath: string) => {
  const codeFile = new CodeFile(absPath);
  await codeFile.readLines(); // don't block!
  allFiles.set(absPath, codeFile);
};

export const onCreated = async (filename: string) => {
  const file = new CodeFile(filename);
  allFiles.set(filename, file);
  return await file.getChanges("created");
};

export const onModified = async (filename: string) => {
  let file = allFiles.get(filename);
  if (file === undefined) {
    file = new CodeFile(filename);
    allFiles.set(filename, file);
    return await file.getChanges("created");
  } else {
    return await file.getChanges("changed");
  }
};

export const onRemoved = (filename: string): FileChanges => {
  allFiles.delete(filename);
  return { filename, kind: "deleted" };
};

export const allFiles = new Map<string, CodeFile>();

for await (const entry of Deno.readDir(codeDir)) {
  if (entry.isFile) {
    _addFile(join(codeDir, entry.name));
  }
}
