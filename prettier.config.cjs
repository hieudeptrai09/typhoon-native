/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  arrowParens: "always",
  bracketSpacing: true,
  singleAttributePerLine: false,
  endOfLine: "lf",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrderParserPlugins: ["typescript", "jsx"],
  importOrderTypeScriptVersion: "5.9.2",
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: { proseWrap: "preserve", printWidth: 80 },
    },
    {
      files: ["app.json", "*.jsonc"],
      options: { parser: "json" },
    },
  ],
};
