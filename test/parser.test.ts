import NamumarkParser from "../src/parser";
import fs from "fs/promises";
import { join } from "path";

jest.setTimeout(5000);

async function testParser(testFileName: string) {
  const wikitext = await fs.readFile(
    join(process.cwd(), `test/wikitexts/${testFileName}.txt`),
    { encoding: "utf8" }
  );
  const parser = new NamumarkParser(wikitext);
  const result = parser.parse();
  const goodResult = JSON.parse(
    await fs.readFile(
      join(process.cwd(), `test/parseResults/${testFileName}.json`),
      { encoding: "utf8" }
    )
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
