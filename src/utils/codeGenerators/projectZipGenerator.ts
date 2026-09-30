import JSZip from 'jszip';
import { FormConfig } from '../../types/form';
import { generateAngularReactiveCode } from './angularReactiveGenerator';
import { generateAngularSignalCode } from './angularSignalFormGenerator';
import { generateZodSchema } from './zodSchemaGenerator';
import { generateTanStackAngularCode } from './tanstackAngularGenerator';

export async function generateProjectZip(config: FormConfig): Promise<Blob> {
  const zip = new JSZip();
  const reactiveCode = generateAngularReactiveCode(config);
  const signalCode = generateAngularSignalCode(config);
  const zodSchema = generateZodSchema(config);
  const tanstackCode = generateTanStackAngularCode(config);

  const packageJson = {
    name: `angular-${config.id}-form`,
    version: '1.0.0',
    private: true,
    scripts: {
      ng: 'ng',
      start: 'ng serve',
      build: 'ng build',
      watch: 'ng build --watch --configuration development',
    },
    dependencies: {
      '@angular/animations': '^19.0.0',
      '@angular/common': '^19.0.0',
      '@angular/compiler': '^19.0.0',
      '@angular/core': '^19.0.0',
      '@angular/forms': '^19.0.0',
      '@angular/platform-browser': '^19.0.0',
      '@angular/platform-browser-dynamic': '^19.0.0',
      '@angular/router': '^19.0.0',
      '@tanstack/angular-form': '^0.41.0',
      '@tanstack/zod-form-adapter': '^0.41.0',
      'rxjs': '~7.8.0',
      'tslib': '^2.3.0',
      'zone.js': '~0.15.0',
      'zod': '^3.23.8',
    },
    devDependencies: {
      '@angular-devkit/build-angular': '^19.0.0',
      '@angular/cli': '^19.0.0',
      '@angular/compiler-cli': '^19.0.0',
      '@types/node': '^18.18.0',
      'autoprefixer': '^10.4.19',
      'postcss': '^8.4.38',
      'tailwindcss': '^3.4.4',
      'typescript': '~5.5.2',
    },
  };

  const readmeMd = `# ${config.title} (Angular Standalone Form)

Generated with **NgFormCraft** (inspired by tancn.dev for Angular).

## Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run local development server:
\`\`\`bash
npm start
\`\`\`
Navigate to \`http://localhost:4200/\`.

## Form Architecture Highlights
- **Official Angular Signal Forms**: \`src/app/${config.id}-signal.component.ts\` (Built with @angular/forms/signals as documented on https://angular.dev/essentials/signal-forms)
- **Angular Reactive Forms + Signals**: \`src/app/${config.id}-form.component.ts\`
- **TanStack Angular Form**: \`src/app/${config.id}.tanstack.component.ts\` (Headless Zod-driven forms)
- **Zod Schema**: \`src/app/${config.id}.schema.ts\`
- **FormArray Repeater**: Strongly typed repeater fields using modern \`@for\` control flow
- **Styling**: Tailwind CSS modern utility classes
`;

  // Add files to zip
  zip.file('package.json', JSON.stringify(packageJson, null, 2));
  zip.file('README.md', readmeMd);

  const srcApp = zip.folder('src/app');
  if (srcApp) {
    // Angular 19+ Signal Form
    srcApp.file(`${config.id}-signal.component.ts`, signalCode.tsCode);
    srcApp.file(`${config.id}-signal.component.html`, signalCode.htmlCode);
    srcApp.file(`${config.id}-signal.component.css`, '/* Signal component styles */\n');

    // Angular Reactive Form
    srcApp.file(`${config.id}-form.component.ts`, reactiveCode.tsCode);
    srcApp.file(`${config.id}-form.component.html`, reactiveCode.htmlCode);
    srcApp.file(`${config.id}-form.component.css`, '/* Component specific CSS if needed */\n');

    // Zod Schema & TanStack Form
    srcApp.file(`${config.id}.schema.ts`, zodSchema);
    srcApp.file(`${config.id}.tanstack.component.ts`, tanstackCode);
  }

  return await zip.generateAsync({ type: 'blob' });
}
