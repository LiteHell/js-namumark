export type NamuMarkOptions = {
  wiki: {
    read: (docName: string) => Promise<null | string>; // return null if not found, return content if found
  };
  allowedExternalImageExts: string[];
  included: boolean;
  includeParameters: { [key: string]: string };
  macroNames: string[];
};

export default defaultOptions;
