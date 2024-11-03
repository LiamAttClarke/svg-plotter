const isProduction = process.env.NODE_ENV === "production";

module.exports = {
    root: true,
    env: {
        node: true,
        browser: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2020,
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".ts", ".d.ts"],
                paths: ["node_modules/", "node_modules/@types/"],
            }
        }
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "google",
    ],
    plugins: [
        "@typescript-eslint",
    ],
    rules: {
        "no-console": isProduction ? 2 : 1,
        "import/extensions": 0,
        "@typescript-eslint/type-annotation-spacing": 2,
        "indent": ["error", 4],
        "max-len": ["error", 200],
        "quotes": ["error", "double"],
        "operator-linebreak": [2, "before"],
        "require-jsdoc": 0,
        "object-curly-spacing": [2, "always"],
        "valid-jsdoc": 0,
    },
    overrides: [
        {
            files: [
                "bin/**/*.js",
                "demo/**/*.js",
            ],
            rules: {
                "@typescript-eslint/no-var-requires": 0,
                "no-console": 0,
            }
        }
    ]
};
