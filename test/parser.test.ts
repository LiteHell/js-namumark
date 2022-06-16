import NamumarkParser from "../src/parser";
import { promises as fs, existsSync } from "fs";
import { join } from "path";

jest.setTimeout(5000);

async function testParser(testFileName: string) {
  const wikitextPath = join(
    process.cwd(),
    `test/wikitexts/${testFileName}.txt`
  );
  const goodResultPath = join(
    process.cwd(),
    `test/parseResults/${testFileName}.json`
  );
  const wikitext = await fs.readFile(wikitextPath, { encoding: "utf8" });
  const parser = new NamumarkParser(wikitext);
  const result = parser.parse();
  if (!existsSync(goodResultPath)) {
    console.log(`Parse result of ${testFileName}\n` + JSON.stringify(result));
    throw new Error("goodResult file not found!");
  }
  const goodResult = JSON.parse(
    await fs.readFile(goodResultPath, { encoding: "utf8" })
  );
  expect(result).toStrictEqual(goodResult);
}

test("Headings and text decorations", async () => {
  await testParser("headingsAndDecorations");
});

test("Broken text decorations", async () => {
  await testParser("brokenTextDecorations");
});

test("Hyperlink, image embedding, and category", async () => {
  await testParser("hyperLinkLikes");
});

test("Macros", async () => {
  await testParser("macros");
});

test("Footnotes", async () => {
  await testParser("footnotes");
});
