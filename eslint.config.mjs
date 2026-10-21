import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const EFFECT_ALLOWLIST = [
  "src/app/error.tsx",
  "src/components/ChatMessageList.tsx",
  "src/components/ServiceWorkerRegister.tsx",
  "src/components/onboarding/useCarouselProgress.ts",
  "src/components/onboarding/useTelegramLinkPolling.ts",
  "src/components/whatsapp/useWhatsappPairing.ts",
  "src/components/ui/**",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value='react'] > ImportNamespaceSpecifier",
          message: "Não use `import * as React from 'react'`; importe diretamente o que for usar (ex.: `import { useState } from 'react'`).",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["useEffect", "useLayoutEffect"],
              message: "Evite efeitos: derive estado, use handlers ou useSyncExternalStore. Só os arquivos da allowlist podem usar useEffect.",
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      "max-lines": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ["src/components/ui/**", "src/db/migrations/**"],
    rules: { "max-lines": "off" },
  },
  {
    files: EFFECT_ALLOWLIST,
    rules: { "no-restricted-imports": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
