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
  `\.(${HANDLED_EXTENSIONS.join("|")})$`
);

/**
 * Regex pattern for public environment variables
 * Used to replace `process.env.NEXT_PUBLIC_*` with the actual value (or "" if it's not defined)
 */
export const PUBLIC_ENV_REGEX = /process\.env\.NEXT_PUBLIC_([a-zA-Z\_]+)/g;

export const encoder = new TextEncoder();
