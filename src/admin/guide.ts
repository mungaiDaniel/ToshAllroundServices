/**
 * The short guide for Daniel (shown at /admin/hilfe). Keep it in step with ADMIN_GUIDE.md in the project root.
 */
export interface GuideSection {
  id: string
  titleDe: string
  titleEn: string
  introDe?: string
  introEn?: string
  stepsDe: string[]
  stepsEn: string[]
  /** where the section's task is done */
  to?: string
}

export const guide: GuideSection[] = [
  {
    id: 'anmelden',
    titleDe: 'So melden Sie sich an',
    titleEn: 'How to log in',
    stepsDe: [
      'Öffnen Sie im Browser Ihres Handys die Adresse toshallroundservices.de/admin.',
      'Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein und tippen Sie auf „Anmelden“.',
      'Sie bleiben auf diesem Handy angemeldet. Erst wenn Sie auf „Abmelden“ tippen (unter „Mehr“ oder „Einstellungen“), müssen Sie sich wieder anmelden.',
      'Passwort vergessen? Tippen Sie auf der Anmeldeseite auf „Passwort vergessen?“. Sie bekommen eine E-Mail mit einem Link, über den Sie ein neues Passwort wählen.',
    ],
    stepsEn: [
      'Open toshallroundservices.de/admin in your phone’s browser.',
      'Enter your email address and password and tap “Log in”.',
      'You stay logged in on this phone. Only when you tap “Log out” (under “More” or “Settings”) do you have to log in again.',
      'Forgot your password? Tap “Forgot password?” on the login page. You get an email with a link to choose a new one.',
    ],
  },
  {
    id: 'fotos',
    titleDe: 'Fotos hinzufügen',
    titleEn: 'Add photos',
    to: '/admin/galerie',
    stepsDe: [
      'Tippen Sie unten auf „Galerie“ und dann auf „Fotos hinzufügen“. (Auf der Übersicht geht es auch mit dem Knopf „Foto hinzufügen“.)',
      'Wählen Sie „Aus der Galerie wählen“ (mehrere Fotos gleichzeitig möglich) oder „Foto aufnehmen“ für die Kamera.',
      'Wählen Sie für jedes Foto die Kategorie und schreiben Sie, wenn Sie möchten, eine kurze Beschreibung.',
      'Tippen Sie auf „Hochladen“. Die Fotos werden automatisch verkleinert und sind sofort auf der Website.',
      'Reihenfolge ändern: Halten Sie den Griff oben links am Foto fest und ziehen Sie es an eine andere Stelle.',
      'Ein Foto verstecken: Tippen Sie auf das Auge. Löschen: Foto antippen, „Löschen“ – es liegt dann 30 Tage im Papierkorb und kann zurückgeholt werden.',
    ],
    stepsEn: [
      'Tap “Gallery” at the bottom, then “Add photos”. (On the overview you can also use the “Add photo” button.)',
      'Choose “Choose from gallery” (several photos at once) or “Take a photo” for the camera.',
      'Pick a category for each photo and, if you like, write a short description.',
      'Tap “Upload”. The photos are resized automatically and appear on the website straight away.',
      'Change the order: hold the handle at the top left of a photo and drag it to another place.',
      'Hide a photo: tap the eye. Delete: tap the photo, then “Delete” – it stays in the trash for 30 days and can be restored.',
    ],
  },
  {
    id: 'zeiten',
    titleDe: 'Öffnungszeiten ändern',
    titleEn: 'Change opening hours',
    to: '/admin/kontakt',
    stepsDe: [
      'Tippen Sie unten auf „Mehr“ und dann auf „Kontaktdaten & Öffnungszeiten“.',
      'Bei jedem Wochentag: Schalter an = geöffnet, Schalter aus = geschlossen. Dann „von“ und „bis“ einstellen.',
      'Mit „Montag für Di–Fr übernehmen“ geht es schneller, wenn die Zeiten gleich sind.',
      'Tippen Sie unten auf „Speichern“. Die neuen Zeiten sind sofort auf der Website.',
    ],
    stepsEn: [
      'Tap “More” at the bottom, then “Contact & opening hours”.',
      'For each weekday: switch on = open, switch off = closed. Then set “from” and “to”.',
      '“Copy Monday to Tue–Fri” is quicker when the hours are the same.',
      'Tap “Save” at the bottom. The new hours are on the website immediately.',
    ],
  },
  {
    id: 'ankuendigung',
    titleDe: 'Ankündigung einschalten',
    titleEn: 'Switch on the announcement',
    to: '/admin/kontakt#ankuendigung',
    introDe: 'Für Hinweise wie „Vom 24. bis 31. Dezember geschlossen“. Der Hinweis erscheint oben auf jeder Seite.',
    introEn: 'For notices such as “Closed 24–31 December”. The notice appears at the top of every page.',
    stepsDe: [
      'Auf der Übersicht auf „Ankündigung“ tippen (oder: Mehr → Kontaktdaten & Öffnungszeiten, nach unten scrollen).',
      'Schalten Sie „Ankündigung anzeigen“ ein.',
      'Schreiben Sie den Text auf Deutsch (Englisch ist freiwillig). Darunter sehen Sie die Vorschau.',
      'Tippen Sie auf „Speichern“.',
      'Zum Ausschalten: Schalter aus und wieder „Speichern“. Der Text bleibt für das nächste Mal erhalten.',
    ],
    stepsEn: [
      'On the overview tap “Announcement” (or: More → Contact & opening hours, scroll down).',
      'Switch on “Show announcement”.',
      'Write the text in German (English is optional). Below it you see the preview.',
      'Tap “Save”.',
      'To switch it off: switch off and “Save” again. The text is kept for next time.',
    ],
  },
  {
    id: 'aktivitaet',
    titleDe: 'Aktivität ansehen',
    titleEn: 'See website activity',
    to: '/admin/aktivitaet',
    stepsDe: [
      'Tippen Sie unten auf „Mehr“ und dann auf „Aktivität“.',
      'Wählen Sie oben 7, 30 oder 90 Tage.',
      'Sie sehen Besuche, Seitenaufrufe, Kontakt-Taps (WhatsApp, Anruf, E-Mail) und Nachrichten. Der Pfeil vergleicht mit dem Zeitraum davor.',
      'Darunter finden Sie die beliebtesten Seiten, die Herkunft der Besucher sowie Gerät und Sprache. Es werden nur anonyme Tageszahlen gezählt, keine Personen.',
    ],
    stepsEn: [
      'Tap “More” at the bottom, then “Activity”.',
      'Choose 7, 30 or 90 days at the top.',
      'You see visits, page views, contact taps (WhatsApp, phone, email) and messages. The arrow compares with the period before.',
      'Below are the most viewed pages, where visitors come from, plus device and language. Only anonymous daily totals are counted, never people.',
    ],
  },
  {
    id: 'nachrichten',
    titleDe: 'Nachrichten lesen und beantworten',
    titleEn: 'Read and answer messages',
    to: '/admin/nachrichten',
    stepsDe: [
      'Tippen Sie unten auf „Post“. Eine rote Zahl zeigt, wie viele Nachrichten neu sind. Neue Nachrichten sind blau markiert.',
      'Tippen Sie auf eine Nachricht, um sie ganz zu lesen. Sie gilt dann als gelesen.',
      'Antworten Sie mit einem Tipp: „WhatsApp“, „Anrufen“ oder „E-Mail“. (WhatsApp und Anrufen gibt es nur, wenn die Person eine Telefonnummer angegeben hat.)',
      'Mit „Als ungelesen markieren“ erinnern Sie sich später daran. Mit „Löschen“ entfernen Sie die Nachricht (Sie werden vorher gefragt).',
    ],
    stepsEn: [
      'Tap “Inbox” at the bottom. A red number shows how many messages are new. New messages are marked in blue.',
      'Tap a message to read all of it. It then counts as read.',
      'Reply with one tap: “WhatsApp”, “Call” or “Email”. (WhatsApp and Call are only available if the person gave a phone number.)',
      '“Mark as unread” reminds you later. “Delete” removes the message (you are asked first).',
    ],
  },
  {
    id: 'texte',
    titleDe: 'Texte der Website ändern',
    titleEn: 'Change website texts',
    to: '/admin/texte',
    stepsDe: [
      'Mehr → Texte. Deutsch steht links/oben, Englisch rechts/unten.',
      'Ändern Sie den Text. Unter dem Feld sehen Sie, wie viele Zeichen noch erlaubt sind.',
      'Tippen Sie auf „Speichern“. Mit „Original“ holen Sie den ursprünglichen Text zurück.',
    ],
    stepsEn: [
      'More → Texts. German is on the left/top, English on the right/bottom.',
      'Change the text. Below the field you see how many characters are still allowed.',
      'Tap “Save”. “Original” brings back the original text.',
    ],
  },
]

export const guideFooter = {
  de: 'Wichtig: Alles, was Sie speichern, ist sofort auf der Website. Wenn Sie etwas ausprobieren möchten, verstecken Sie es mit dem Auge-Symbol. Gelöscht wird nur nach einer Rückfrage.',
  en: 'Important: everything you save is on the website immediately. If you want to try something out, hide it with the eye symbol. Things are only deleted after a confirmation.',
}
