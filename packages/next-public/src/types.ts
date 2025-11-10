export type PluginOptions = {
  enabled?: boolean;
  shouldLog?: boolean;
} & (
  | {
      inputDir: string | string[];
      outputDir: string;
      autoDetect?: false;
    }
  | {
      autoDetect: true;
    }
);
