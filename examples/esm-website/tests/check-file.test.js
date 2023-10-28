import { doesNotReject, rejects } from "node:assert";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("esm website", async (t) => {
  await t.test("check file sw.js", async () => {
    doesNotReject(readFile("./public/sw.js"));
  });

  await t.test("check if file in folder exists", async () => {
    doesNotReject(readFile("./public/folder/random-file.js"));
  });

  await t.test("check file non existing file", async () => {
    rejects(readFile("./public/non-existent.js"));
  });
});