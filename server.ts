import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import * as files from "./files.ts";
import { clear } from "https://deno.land/x/clear@v1.3.0/mod.ts";
import { allFiles } from "./files.ts";

const codeDir = Deno.env.get("CODE_DIR") || "./";
const enc = new TextEncoder();

const watcher = Deno.watchFs(codeDir);
for await (const event of watcher) {
  clear(true);
  console.log(JSON.stringify(event));
  for (const path of event.paths) {
    let changes;
    switch (event.kind) {
      case "create":
        changes = await files.onCreated(path);
        break;
      case "modify":
        changes = await files.onModified(path);
        break;
      case "remove":
        changes = files.onRemoved(path);
        break;
    }
    console.log(changes);
    for (const [file, { lines }] of allFiles.entries()) {
      Deno.stdout.writeSync(enc.encode(`${file}\n`));
      Deno.stdout.writeSync(
        enc.encode(lines.map((l) => `  ${l}`).join("\n") + "\n\n")
      );
    }
  }
}
