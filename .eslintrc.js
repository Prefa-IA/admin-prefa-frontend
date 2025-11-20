module.exports = {
  // 1. Cambio a presets estrictos según PDF
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/strict', // A11y modo estricto
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['node_modules', 'build', 'dist'],
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'sonarjs',
    'unicorn',
    'react',
    'react-hooks',
    'jsx-a11y',
    'security',
    'prettier',
    // Plugins requeridos por el estándar PDF
    'functional', // Para inmutabilidad y pureza
    'risxss', // Para sanitización XSS específica de React
  ],
  rules: {
    // ====================================================
    // REGLAS DE ARQUITECTURA Y SRP (PDF Sección IV)
    // ====================================================
    // Fuerza la extracción de lógica si el componente es muy complejo
    complexity: ['error', 12],

    // Previene componentes monolíticos ("God Components")
    'max-lines-per-function': [
      'error',
      { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
    ],

    // ====================================================
    // REGLAS DE INTEGRIDAD DE REACT (PDF Sección II)
    // ====================================================
    'react-hooks/rules-of-hooks': 'error',

    // CRÍTICO: Cambiado de 'warn' a 'error'.
    // Prohíbe stale closures y obliga a usar useCallback/useMemo correctamente
    'react-hooks/exhaustive-deps': 'error',

    // ====================================================
    // PUREZA E INMUTABILIDAD (PDF Sección III)
    // ====================================================
    // Prohíbe mutar props o estado directamente (Esencial para React Compiler)
    'functional/no-mutations': [
      'error',
      {
        ignorePattern: ['^useRef$'], // Excepción común para refs en React
      },
    ],
    // Fomenta el uso de const sobre let
    'functional/no-let': 'error',

    // ====================================================
    // SEGURIDAD (PDF Sección V)
    // ====================================================
    // Regla base para peligrosidad
    'react/no-danger': 'error',

    // Capa extra de seguridad: verifica sanitización en dangerouslySetInnerHTML
    'risxss/catch-potential-xss-react': 'error',

    // Tus reglas de seguridad existentes (Mantenidas)
    'security/detect-eval-with-expression': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-disable-mustache-escape': 'error',

    // ====================================================
    // ACCESIBILIDAD (PDF Sección 5.2)
    // ====================================================
    // Reglas estrictas para interacciones
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/no-autofocus': 'error',
    // Resto de reglas heredadas de 'strict' o sobrescritas aquí
    'jsx-a11y/anchor-is-valid': 'error', // Elevado a error
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // ====================================================
    // TUS REGLAS PREFERIDAS (Mantenidas)
    // ====================================================
    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // Imports (Tu configuración intacta)
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': ['error', { maxDepth: 10 }],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^react', '^@?\\w'],
          ['^(@|components|utils|config|services|hooks|types|contexts|routes)(/.*|$)'],
          ['^\\u0000'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^.+\\.s?css$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',

    // SonarJS & Unicorn (Mantenidos)
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'error',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prefer-array-at': 'off',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/no-array-callback-reference': 'error',

    // React General
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',

    'prettier/prettier': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
};

