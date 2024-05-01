const HANDLED_EXTENSIONS = ["ts", "mts", "cts", "js", "mjs", "cjs"] as const;

/**
 * Glob pattern for handled extensions
 * Used to find all files with handled extensions
 */
export const HANDLED_GLOB_EXTENSIONS = `{${HANDLED_EXTENSIONS.join(",")}}`;

/**
 * Regex pattern for handled extensions
 * Used to replace `.ts` with `.js` in file paths
 */
export const HANDLED_REGEX_EXTENSIONS = new RegExp(
  `\.(${HANDLED_EXTENSIONS.join("|")})$`,
);

