const test = require("node:test");
const { readFile } = require("node:fs/promises");
const { doesNotReject, rejects } = require("node:assert");

test("pages router website", async (t) => {
  await t.test("check file sw.js", async () => {
    doesNotReject(readFile("./public/sw.js"));
  });

  await t.test("files should not contains process.env.NEXT_PUBLIC_*", async () => {
    const fileContent = await readFile("./public/sw.js", "utf8");
    equal(fileContent.includes("process.env.NEXT_PUBLIC_"), false);
  });

  await t.test("check if file in folder exists", async () => {
    doesNotReject(readFile("./public/folder/random-file.js"));
  });

  await t.test("check file non existing file", async () => {
    rejects(readFile("./public/non-existent.js"));
  });
});