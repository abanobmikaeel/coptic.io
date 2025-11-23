import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	eslintPluginPrettier,
	{
		ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '.next/**', 'ui/**'],
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'prettier/prettier': 'warn',
		},
	}
)
