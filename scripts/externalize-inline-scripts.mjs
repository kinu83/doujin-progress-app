// nuxt generate の出力HTMLに含まれるインラインスクリプトを外部ファイルに移す。
// CSPの script-src から 'unsafe-inline' を外すため。
// インラインスクリプトの中身（buildId など）はビルドごとに変わり、firebase.json のヘッダーにハッシュを固定で書けないので、
// ハッシュ方式ではなく外部ファイル化して script-src 'self' で許可する。
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const publicDir = process.argv[2] ?? ".output/public";
const assetsDir = "_nuxt";

// 実行されない（CSPの対象外の）スクリプトの type。
const dataScriptTypes = new Set(["application/json", "application/ld+json"]);

const scriptPattern = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;

const findHtmlFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(path);
      return entry.name.endsWith(".html") ? [path] : [];
    }),
  );
  return files.flat();
};

const getType = (attributes) => /\btype\s*=\s*"([^"]*)"/.exec(attributes)?.[1]?.toLowerCase();

const isExecutableInlineScript = (attributes, content) => {
  if (!content.trim()) return false;
  if (/\bsrc\s*=/.test(attributes)) return false;
  const type = getType(attributes);
  return !type || !dataScriptTypes.has(type);
};

const writtenFiles = new Set();

const externalize = async (attributes, content) => {
  const type = getType(attributes);
  // importmap は外部ファイルにできないため、nuxt.config.ts の experimental.entryImportMap で出力しないようにしている。
  if (type && type !== "text/javascript" && type !== "module") {
    throw new Error(`外部ファイルにできないインラインスクリプトがあります（type="${type}"）`);
  }

  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const fileName = `inline.${hash}.js`;
  if (!writtenFiles.has(fileName)) {
    await writeFile(join(publicDir, assetsDir, fileName), content);
    writtenFiles.add(fileName);
  }

  // 元と同じ位置に置き、defer にしないことで実行順を保つ。
  const typeAttribute = type === "module" ? ' type="module"' : "";
  return `<script${typeAttribute} src="/${assetsDir}/${fileName}"></script>`;
};

const htmlFiles = await findHtmlFiles(publicDir);
if (htmlFiles.length === 0) {
  throw new Error(`${publicDir} にHTMLがありません。先に nuxt generate を実行してください。`);
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const replacements = [];
  for (const match of html.matchAll(scriptPattern)) {
    const [tag, attributes = "", content] = match;
    if (isExecutableInlineScript(attributes, content)) {
      replacements.push([tag, await externalize(attributes, content)]);
    }
  }

  let result = html;
  for (const [tag, replacement] of replacements) {
    result = result.replace(tag, replacement);
  }

  for (const [, attributes = "", content] of result.matchAll(scriptPattern)) {
    if (isExecutableInlineScript(attributes, content)) {
      throw new Error(`${relative(publicDir, file)} にインラインスクリプトが残っています`);
    }
  }

  if (replacements.length > 0) {
    await writeFile(file, result);
  }
}

console.log(
  `インラインスクリプトを外部ファイルに移しました（HTML ${htmlFiles.length}件、スクリプト ${writtenFiles.size}件）`,
);
