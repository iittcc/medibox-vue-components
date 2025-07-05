const js = require("@eslint/js");
const vue = require("eslint-plugin-vue");
const tsParser = require("@typescript-eslint/parser");
const tsEslint = require("@typescript-eslint/eslint-plugin");

require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = [
    {
        ignores: [
            "dist/**/*", 
            "node_modules/**/*",
            "*.config.js",
            "*.config.ts",
            "coverage/**/*",
            ".nuxt/**/*",
            ".output/**/*",
            ".vite/**/*"
        ]
    },
    js.configs.recommended,
    ...vue.configs["flat/essential"],
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vue.parser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsEslint,
        },
        rules: {
            // Disable the multi-word component names rule for medical acronyms
            "vue/multi-word-component-names": "off",
            // Disable the base rule and use the TypeScript-specific one
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_",
                    "ignoreRestSiblings": true,
                    "args": "after-used",
                    "vars": "all",
                    "destructuredArrayIgnorePattern": "^_"
                }
            ],
        },
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            "@typescript-eslint": tsEslint,
        },
        rules: {
            // Disable the base rule and use the TypeScript-specific one
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_",
                    "ignoreRestSiblings": true,
                    "args": "after-used",
                    "vars": "all",
                    "destructuredArrayIgnorePattern": "^_"
                }
            ],
        },
    },
    {
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                // Node.js globals for config files
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
                process: "readonly",
                global: "readonly",
                Buffer: "readonly",
                // Browser globals
                window: "readonly",
                document: "readonly",
                console: "readonly",
                navigator: "readonly",
                fetch: "readonly",
                AbortController: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                CustomEvent: "readonly",
                Event: "readonly",
                MouseEvent: "readonly",
                HTMLElement: "readonly",
                HTMLInputElement: "readonly",
                HTMLDivElement: "readonly",
                Node: "readonly",
                NodeListOf: "readonly",
                NodeJS: "readonly",
                PromiseRejectionEvent: "readonly",
                localStorage: "readonly",
                beforeEach: "readonly",
            },
        },
    },
    {
        settings: {
            "import/resolver": {
                "node": {
                    "extensions": [".js", ".jsx", ".ts", ".tsx",".vue"]
                }
            }
        }
    }
];
