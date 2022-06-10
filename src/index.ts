import { NamuMarkOptions } from "./types";
import {
  parse as parseNamumark,
  Wikitext,
  BlockWikitext,
  LineGrammar,
  WikiLine,
  ASTKinds,
} from "./namumarkPeg";
import { inspect } from "util";
import defaultOptions from "./defaultOptions";
import NamumarkParser from "./parser";

abstract class NamuMarkRenderer {
  abstract processToken(t: any): Promise<void>;
  abstract getResult(): Promise<NamuMarkRendererResult>;
  abstract setIncludedParameters(
    params: NamuMarkOptions["includeParameters"]
  ): void;
  abstract setRenderer(rendererClass: NamuMarkRenderer, options: any): void;
}

interface NamumarkRendererConstructor {
  new (rendererOptions?: any): NamuMarkRenderer;
}

export default class NamuMark {
  private articleName: string;
  private options: NamuMarkOptions;
  constructor(articleName: string, options: Partial<NamuMarkOptions>) {
    this.articleName = articleName;
    this.options = defaultOptions;
    Object.assign(this.options, options);
  }

  async parse(): Promise<NamuMarkRendererResult> {
    const wikitext = await this.options.wiki.read(this.articleName);
    if (wikitext === null) throw new Error("Article not found!");

    const parser = new NamumarkParser(wikitext);
    const result1 = parser.parse();
    console.log(inspect(result1, false, null, true));
    throw new Error("a");

    // Redirect grammar
    /*
    const redirectGrammarPattern = /^$(redirect|넘겨주기) (.+?)$/m;
    const firstLine = wikitext.includes("\n")
      ? wikitext.substring(0, wikitext.indexOf("\n"))
      : wikitext;
    if (redirectGrammarPattern.test(firstLine)) {
      const regexResult = redirectGrammarPattern.exec(firstLine);
      if (regexResult) {
        return {
          redirect: true,
          target: regexResult[1],
        };
      }
    }

    const result = parseNamumark(wikitext);
    console.log(inspect(result, false, null, true));
    if (result.ast?.kind === ASTKinds.Wikitext_2)
      console.log(this.render(result.ast));
    throw new Error("NOT IMPLEMENTED");
    */
  }
  setIncluded(): void {
    this.options.included = true;
  }
  setIncludeParameters(params: NamuMarkOptions["includeParameters"]): void {
    this.options.includeParameters = params;
  }
}
