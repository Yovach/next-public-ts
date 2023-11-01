import { doesNotReject, rejects, equal } from "node:assert";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("esm website", async (t) => {
  await t.test("check file sw.js", async () => {
    doesNotReject(readFile("./public/sw.js"));
  });

  await t.test(
    "files should not contains process.env.NEXT_PUBLIC_*",
    async () => {
      const fileContent = await readFile("./public/sw.js", "utf8");
      equal(fileContent.includes("process.env.NEXT_PUBLIC_"), false);
    },
  );

  await t.test(
    "check if `folder/js-file.js` is handled by the plugin",
    async () => {
      doesNotReject(readFile("./public/folder/js-file.js"));
    },
  );

  await t.test(
    "check if `folder/ts-file.js` is handled by the plugin",
    async () => {
      doesNotReject(readFile("./public/folder/ts-file.js"));
    },
  );

  await t.test("check file non existing file", async () => {
    rejects(readFile("./public/non-existent.js"));
  });
});
