module.exports = {
	root: true,
	env: {
		node: true,
		es2022: true,
	},
	extends: ["eslint:recommended"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	ignorePatterns: ["node_modules/", "dist/", "build/"],
	rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] },
	overrides: [
		{
			files: ["**/*.test.js"],
			env: {
				jest: true,
			},
		},
	],
}
