import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import RevealInit from '@/components/RevealInit';
import ClipMascot from '@/components/ClipMascot';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '800', '900'], style: ['normal', 'italic'], variable: '--font-archivo' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif-face' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: '400', variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: { default: 'Crudo_ — Tus ideas en su estado más crudo', template: '%s — Crudo_' },
  description: 'Agencia creativa hecha por mujeres argento-colombianas. Branding, naming, diseño, social media, audiovisual, ads e impresiones.',
};

export const viewport: Viewport = { themeColor: '#A33B21' };

/** Marca html como "con JS" para las entradas animadas; a los 3 s lo muestra todo solo si RevealInit nunca arrancó. */
const jsFlag = `document.documentElement.classList.add('js');setTimeout(function(){if(!document.documentElement.classList.contains('rv-ready'))document.documentElement.classList.add('rv-fallback')},3000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${archivo.variable} ${serif.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        {children}
        <RevealInit />
        <ClipMascot />
      </body>
    </html>
  );
}
