import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

// eslint-config-next 16 ya exporta flat config nativo: se extiende directo, sin
// FlatCompat (que además rompe con estos configs — referencias circulares al
// serializar el plugin de react).
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts']
  }
];

export default eslintConfig;
