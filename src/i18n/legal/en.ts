/**
 * ⚠️  LEGAL TEXTS – HAVE THEM REVIEWED BEFORE LAUNCH  ⚠️
 *
 * English convenience translation of src/i18n/legal/de.ts. This is a carefully prepared DRAFT,
 * not legal advice. Before going live, have the client / a lawyer review the German originals
 * or generate them with a German legal generator such as e-recht24.de, then update this file to match.
 * Everything in [square brackets] must be confirmed with the client and replaced. While brackets
 * remain, the page shows a visible draft notice.
 */
import type { LegalTexts } from './types'

const en: LegalTexts = {
  impressum: {
    sections: [
      {
        id: 'angaben',
        heading: 'Information pursuant to § 5 DDG',
        blocks: [
          '{name}\n[Full name of the owner]\n[Legal form, e.g. sole proprietorship]\n{street}\n{zip} {city}\nGermany',
        ],
      },
      {
        id: 'kontakt',
        heading: 'Contact',
        blocks: ['Phone: {phone}\nEmail: {email}\nWebsite: {domain}'],
      },
      {
        id: 'ust',
        heading: 'VAT ID',
        blocks: [
          'VAT identification number pursuant to § 27 a of the German VAT Act (Umsatzsteuergesetz):\n[VAT ID (USt-IdNr.), if any – otherwise remove this section]',
        ],
      },
      {
        id: 'register',
        heading: 'Register entry and supervision',
        blocks: [
          'Register entry: [commercial register and registration number, if registered – otherwise remove]',
          'Competent chamber or supervisory authority: [e.g. Handwerkskammer Berlin, if applicable – otherwise remove]',
        ],
      },
      {
        id: 'verantwortlich',
        heading: 'Responsible for content pursuant to § 18 (2) MStV',
        blocks: ['[Name of the responsible person]\n{street}\n{zip} {city}'],
      },
      {
        id: 'streitbeilegung',
        heading: 'Consumer dispute resolution',
        blocks: [
          '[Please confirm:] We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
        ],
      },
      {
        id: 'haftung-inhalte',
        heading: 'Liability for content',
        blocks: [
          'As a service provider, we are responsible for our own content on these pages in accordance with general legislation. However, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity.',
          'Obligations to remove or block the use of information under general legislation remain unaffected. Liability in this respect is only possible from the point in time at which we become aware of a specific infringement. Once we become aware of such infringements, we will remove the content immediately.',
        ],
      },
      {
        id: 'haftung-links',
        heading: 'Liability for links',
        blocks: [
          'Our website contains links to external third-party websites over whose content we have no influence. We therefore cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content. No legal violations were apparent at the time of linking. Once we become aware of any infringements, we will remove such links immediately.',
        ],
      },
      {
        id: 'urheberrecht',
        heading: 'Copyright',
        blocks: [
          'The content and works created by us on these pages are subject to German copyright law. Reproduction, editing, distribution and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator. Downloads and copies of this page are only permitted for private, non-commercial use.',
          'Where content on this page was not created by us, the copyrights of third parties are respected. Should you nevertheless become aware of a copyright infringement, please let us know. Once we become aware of infringements, we will remove such content immediately.',
        ],
      },
    ],
  },

  datenschutz: {
    intro:
      'Protecting your personal data matters to us. This privacy policy explains which data is processed when you visit this website and when you contact us, and what rights you have. (This English version is provided for convenience; the German version is the legally binding one.)',
    sections: [
      {
        id: 'verantwortlicher',
        heading: '1. Controller',
        blocks: [
          'The controller responsible for data processing on this website under the General Data Protection Regulation (GDPR) is:',
          '{name}\n[Full name of the owner], [legal form]\n{street}\n{zip} {city}\nPhone: {phone}\nEmail: {email}',
        ],
      },
      {
        id: 'ueberblick',
        heading: '2. Overview: no cookies, no tracking',
        blocks: [
          'This website does not use cookies and does not use any analytics, tracking or advertising services. We do not automatically embed maps, videos, font servers or social media plugins. The texts and images of this website are loaded from our own database at Supabase (see section 4). No cookies are set, so no cookie banner is required.',
          'We process personal data only as described in the following sections.',
        ],
      },
      {
        id: 'hosting',
        heading: '3. Hosting (Vercel)',
        blocks: [
          'This website is hosted by Vercel Inc. [check the address in Vercel’s privacy policy, e.g. 440 N Barranca Ave #4133, Covina, CA 91723, USA]. When you visit the website, the hosting provider processes technically necessary connection data in server log files. This includes in particular:',
          [
            'IP address of the requesting device',
            'date and time of access',
            'requested page or file and amount of data transferred',
            'browser type and version, operating system and the previously visited page (referrer)',
          ],
          'The legal basis is Art. 6 (1) (f) GDPR. Our legitimate interest is the secure, stable and efficient provision of our website. Log files are deleted after [please check: retention period according to Vercel].',
          'Because Vercel is based in the USA, personal data may be transferred to a third country. The transfer relies on [please check: certification under the EU-US Data Privacy Framework and/or EU Standard Contractual Clauses]. A [please check: data processing agreement (DPA) under Art. 28 GDPR] is in place with the provider.',
        ],
      },
      {
        id: 'datenbank',
        heading: '4. Database and content (Supabase)',
        blocks: [
          'The content of this website (e.g. services, texts, photos, certificates and business details) is maintained in a database and loaded from there. For this we use the service Supabase [check and add provider details and address from Supabase’s privacy policy]. Our Supabase project is operated in the European Union (Frankfurt, Germany region).',
          'When you open the website, your browser loads texts, images and documents directly from Supabase’s servers. Technically necessary connection data is processed in the process, in particular your IP address as well as the date, time and requested content. The legal basis is Art. 6 (1) (f) GDPR. Our legitimate interest is the reliable and secure delivery of the website content. No cookies are set, and visitors do not have to log in.',
          'For faster display, your browser stores a copy of this content in local storage (see section 8). This copy contains no personal data about you.',
          'Messages sent through the contact form are also stored in this database (see section 5). Access is restricted to the website operator by access rules (Row Level Security); visitors can only submit messages, not read, change or delete them.',
          'Because Supabase Inc. is based outside the EU, access to data by the provider may constitute a transfer to a third country. It relies on [please check: EU Standard Contractual Clauses and/or certification under the EU-US Data Privacy Framework]. A [please check: data processing agreement (DPA) under Art. 28 GDPR, available in the Supabase dashboard] is in place with the provider.',
        ],
      },
      {
        id: 'kontaktformular',
        heading: '5. Contact form (Web3Forms)',
        blocks: [
          'If you send us an enquiry via the contact form, we process the data you enter: name, email address, optionally your phone number, the selected service and your message, as well as your consent to this privacy policy. We use this data solely to handle your enquiry and to contact you. Your message is stored in our database at Supabase (EU, Frankfurt – see section 4) and also delivered to us by email.',
          'To transmit the form we use the service Web3Forms (web3forms.com) [add provider details and address from Web3Forms’ privacy policy]. When you submit the form, your input is transmitted to Web3Forms and forwarded from there by email to our inbox. Web3Forms may process technical data such as your IP address in the process. A transfer to third countries, in particular the USA, is possible [please check: safeguards / standard contractual clauses]. A [please check: data processing agreement with Web3Forms] is in place.',
          'The legal basis is your consent (Art. 6 (1) (a) GDPR), which you give by ticking the box in the form, and – if your enquiry aims at a contract – Art. 6 (1) (b) GDPR. You can withdraw your consent at any time with effect for the future (see section 10).',
          'Messages from the contact form are automatically deleted from the database 12 months after they are received [please check: automatic deletion is active in Supabase, see SUPABASE_SETUP.md]. We delete emails in our inbox once the enquiry is dealt with, unless statutory retention obligations apply (e.g. for contracts that were concluded).',
        ],
      },
      {
        id: 'kontakt-direkt',
        heading: '6. Contact by phone, email and WhatsApp',
        blocks: [
          'If you call us or write us an email, we process your phone number or email address and the content of your message in order to answer your enquiry. The legal basis is Art. 6 (1) (b) GDPR (pre-contractual measures) or Art. 6 (1) (f) GDPR (legitimate interest in answering enquiries).',
          'This website contains links that open WhatsApp (wa.me). These are mere links: simply visiting our site does not transmit any data to WhatsApp. Only when you click such a link are you forwarded to WhatsApp. If you send us a message there, WhatsApp processes your data (including phone number, metadata and message content) under its own privacy terms. The provider is WhatsApp Ireland Limited / Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Ireland. A transfer of data to the USA is possible. See whatsapp.com/legal/privacy-policy-eea. [Please confirm: the business’s use of WhatsApp or WhatsApp Business.]',
          'The legal basis for communicating with us via WhatsApp is your consent or your voluntary contact (Art. 6 (1) (a) and (b) GDPR). If you do not want to send messages via WhatsApp, you can reach us by phone, email or the contact form.',
        ],
      },
      {
        id: 'schriftarten',
        heading: '7. Fonts (self-hosted)',
        blocks: [
          'This website uses the font “JetBrains Mono”. The font files are delivered from our own server (hosting see section 3) and are not loaded from external servers such as Google Fonts. No connection to third-party servers is made for this, and no data is transmitted to third parties.',
        ],
      },
      {
        id: 'speicher',
        heading: '8. Local storage (language setting and content cache)',
        blocks: [
          'When you switch the website language (German/English), we save your choice in your browser’s local storage (localStorage) so that it is kept for your next visit. No personal data is stored, and the information does not leave your device. It is technically necessary to provide the function you requested (§ 25 (2) no. 2 TDDDG). In addition, your browser stores a copy of the website content (texts and details from the database) so the page appears faster on your next visit. This copy contains no personal data. You can delete both entries at any time in your browser settings.',
        ],
      },
      {
        id: 'externe-links',
        heading: '9. External links (e.g. Google Maps)',
        blocks: [
          'We link our address with a simple link to Google Maps. No map is embedded. Only when you click the link does Google Maps open in a new tab, and Google processes data under its own privacy policy (policies.google.com/privacy). No data is transmitted to Google before you click.',
        ],
      },
      {
        id: 'rechte',
        heading: '10. Your rights',
        blocks: [
          'Under the GDPR you have the following rights towards us as the controller:',
          [
            'access to the data we hold about you (Art. 15 GDPR)',
            'rectification of inaccurate data (Art. 16 GDPR)',
            'erasure of your data (Art. 17 GDPR)',
            'restriction of processing (Art. 18 GDPR)',
            'data portability (Art. 20 GDPR)',
            'objection to processing based on legitimate interests (Art. 21 GDPR)',
            'withdrawal of consent given, with effect for the future (Art. 7 (3) GDPR)',
          ],
          'To exercise your rights, an informal message to {email} is enough.',
          'You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR). The authority responsible for us is: Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin, Germany, www.datenschutz-berlin.de.',
        ],
      },
      {
        id: 'sicherheit',
        heading: '11. Data security',
        blocks: [
          'For security reasons this website uses SSL/TLS encryption. You can recognise an encrypted connection by “https://” in your browser’s address bar.',
        ],
      },
      {
        id: 'aktualitaet',
        heading: '12. Currency and changes',
        blocks: [
          'We will update this privacy policy if the website or the legal requirements change. The version published here applies.',
          'Last updated: [enter date]',
        ],
      },
    ],
  },
}

export default en
