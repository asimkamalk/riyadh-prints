import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/site/**/*.{ts,tsx}",
      "src/components/seo/**/*.{ts,tsx}",
      "src/components/admin/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(?:^|[\\s\"'`:])(?:ml|mr|pl|pr|left|right)-|(?:^|[\\s\"'`:])(?:text-left|text-right|float-left|float-right)\\b/]",
          message:
            "Use logical Tailwind classes (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) instead of left/right for layout.",
        },
        {
          selector:
            "TemplateElement[value.raw=/(?:^|[\\s\"'`:])(?:ml|mr|pl|pr|left|right)-|(?:^|[\\s\"'`:])(?:text-left|text-right|float-left|float-right)\\b/]",
          message:
            "Use logical Tailwind classes (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) instead of left/right for layout.",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
  },
];

export default eslintConfig;
