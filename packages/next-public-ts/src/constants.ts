const HANDLED_EXTENSIONS = ["ts", "mjs", "js", "cjs"] as const;
export const HANDLED_GLOB_EXTENSIONS = `{${HANDLED_EXTENSIONS.join(",")}}`;
export const HANDLED_REGEX_EXTENSIONS = new RegExp(
  `\.(${HANDLED_EXTENSIONS.join("|")})$`
);

export const PUBLIC_ENV_REGEX = /process\.env\.NEXT_PUBLIC_([a-zA-Z\_]+)/g;

export const encoder = new TextEncoder();
