import type { Metadata } from 'next'
import {
  Inter,
  Cormorant_Garamond,
  Great_Vibes,
  Lora,
  Pinyon_Script,
  EB_Garamond,
} from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Wedding invitation display/script/body fonts, self-hosted via next/font so they
// actually ship in the bundle (a plain @import url(...) in globals.css gets
// silently dropped by the build and never fetches at runtime).
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
})
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-great-vibes',
})
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
})
const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon-script',
})
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
})

export const metadata: Metadata = {
  title: 'Digital Wedding Invitations',
  description: 'Create beautiful digital wedding invitations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${cormorantGaramond.variable} ${greatVibes.variable} ${lora.variable} ${pinyonScript.variable} ${ebGaramond.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
