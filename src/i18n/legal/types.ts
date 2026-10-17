/**
 * Structure of the legal texts (Impressum, Datenschutz).
 *
 * Text conventions (resolved by <LegalText> in src/components/legal/LegalPage.tsx):
 *  - `{name}`, `{street}`, `{zip}`, `{city}`, `{phone}`, `{email}`, `{domain}` are filled in from src/data/site.ts
 *  - `[text in square brackets]` = something the client MUST confirm or fill in.
 *    It is highlighted on the page, and a "draft" banner is shown until none are left.
 *  - "\n" inside a paragraph = line break
 */
export type LegalBlock = string | string[] // string = paragraph, string[] = bullet list

export interface LegalSection {
  id: string
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  intro?: string
  sections: LegalSection[]
}

export interface LegalTexts {
  impressum: LegalDoc
  datenschutz: LegalDoc
}
