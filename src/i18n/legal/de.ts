/**
 * ⚠️  RECHTSTEXTE – VOR DEM LIVEGANG PRÜFEN LASSEN  ⚠️
 *
 * Diese Texte sind ein sorgfältig erstellter ENTWURF, aber keine Rechtsberatung.
 * Vor dem Livegang müssen sie
 *   (a) vom Kunden bzw. einer Rechtsberatung geprüft oder
 *   (b) mit einem deutschen Rechtstext-Generator (z. B. e-recht24.de, Datenschutz-Generator
 *       der Anwaltskanzlei Weiß & Partner, IT-Recht Kanzlei) erzeugt/abgeglichen werden.
 * Alle Angaben in [eckigen Klammern] müssen mit dem Kunden geklärt und ersetzt werden.
 * Solange Klammern vorhanden sind, zeigt die Seite einen sichtbaren Entwurfs-Hinweis.
 *
 * ⚠️  LEGAL TEXTS – HAVE THEM REVIEWED BEFORE LAUNCH  ⚠️
 * These are a carefully prepared DRAFT, not legal advice. Review with the client / a lawyer or
 * generate with a German legal generator such as e-recht24 before going live.
 */
import type { LegalTexts } from './types'

const de: LegalTexts = {
  impressum: {
    sections: [
      {
        id: 'angaben',
        heading: 'Angaben gemäß § 5 DDG',
        blocks: [
          '{name}\n[Vollständiger Name der Inhaberin / des Inhabers]\n[Rechtsform, z. B. Einzelunternehmen]\n{street}\n{zip} {city}',
        ],
      },
      {
        id: 'kontakt',
        heading: 'Kontakt',
        blocks: ['Telefon: {phone}\nE-Mail: {email}\nWebsite: {domain}'],
      },
      {
        id: 'ust',
        heading: 'Umsatzsteuer-ID',
        blocks: [
          'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:\n[USt-IdNr., falls vorhanden – andernfalls diesen Abschnitt entfernen]',
        ],
      },
      {
        id: 'register',
        heading: 'Registereintrag und Aufsicht',
        blocks: [
          'Registereintrag: [Handelsregister und Registernummer, falls eingetragen – andernfalls entfernen]',
          'Zuständige Kammer bzw. Aufsichtsbehörde: [z. B. Handwerkskammer Berlin, falls zutreffend – andernfalls entfernen]',
        ],
      },
      {
        id: 'verantwortlich',
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        blocks: ['[Name der verantwortlichen Person]\n{street}\n{zip} {city}'],
      },
      {
        id: 'streitbeilegung',
        heading: 'Verbraucherstreitbeilegung',
        blocks: [
          '[Bitte bestätigen:] Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
        ],
      },
      {
        id: 'haftung-inhalte',
        heading: 'Haftung für Inhalte',
        blocks: [
          'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
          'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.',
        ],
      },
      {
        id: 'haftung-links',
        heading: 'Haftung für Links',
        blocks: [
          'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte können wir daher keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.',
        ],
      },
      {
        id: 'urheberrecht',
        heading: 'Urheberrecht',
        blocks: [
          'Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.',
          'Soweit Inhalte auf dieser Seite nicht von uns erstellt wurden, werden die Urheberrechte Dritter beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Inhalte umgehend.',
        ],
      },
    ],
  },

  datenschutz: {
    intro:
      'Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie darüber, welche Daten beim Besuch dieser Website und bei der Kontaktaufnahme verarbeitet werden und welche Rechte Sie haben.',
    sections: [
      {
        id: 'verantwortlicher',
        heading: '1. Verantwortlicher',
        blocks: [
          'Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:',
          '{name}\n[Vollständiger Name der Inhaberin / des Inhabers], [Rechtsform]\n{street}\n{zip} {city}\nTelefon: {phone}\nE-Mail: {email}',
        ],
      },
      {
        id: 'ueberblick',
        heading: '2. Überblick: Keine Cookies, kein Tracking',
        blocks: [
          'Diese Website verwendet keine Cookies und setzt keine Analyse-, Tracking- oder Werbedienste ein. Wir binden keine Inhalte von Drittanbietern (z. B. Karten, Videos, Schriftarten-Server, Social-Media-Plugins) automatisch ein. Aus diesem Grund ist kein Cookie-Banner erforderlich.',
          'Personenbezogene Daten verarbeiten wir nur, soweit dies in den folgenden Abschnitten beschrieben ist.',
        ],
      },
      {
        id: 'hosting',
        heading: '3. Hosting (Vercel)',
        blocks: [
          'Diese Website wird bei Vercel Inc. gehostet [Anschrift laut Vercel-Datenschutzerklärung prüfen, z. B. 440 N Barranca Ave #4133, Covina, CA 91723, USA]. Beim Aufruf der Website verarbeitet der Hosting-Anbieter technisch notwendige Verbindungsdaten in Server-Logfiles. Dazu gehören insbesondere:',
          [
            'IP-Adresse des anfragenden Geräts',
            'Datum und Uhrzeit des Zugriffs',
            'angeforderte Seite bzw. Datei und übertragene Datenmenge',
            'Browsertyp und -version, Betriebssystem sowie die zuvor besuchte Seite (Referrer)',
          ],
          'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren, stabilen und effizienten Bereitstellung unserer Website. Die Logfiles werden nach [bitte prüfen: Speicherdauer laut Vercel] gelöscht.',
          'Da Vercel seinen Sitz in den USA hat, kann eine Übermittlung personenbezogener Daten in ein Drittland stattfinden. Die Übermittlung stützt sich auf [bitte prüfen: Zertifizierung unter dem EU-US Data Privacy Framework bzw. EU-Standardvertragsklauseln]. Mit dem Anbieter besteht [bitte prüfen: Auftragsverarbeitungsvertrag (AVV/DPA) gemäß Art. 28 DSGVO].',
        ],
      },
      {
        id: 'kontaktformular',
        heading: '4. Kontaktformular (Web3Forms)',
        blocks: [
          'Wenn Sie uns über das Kontaktformular eine Anfrage senden, verarbeiten wir die von Ihnen eingegebenen Daten: Name, E-Mail-Adresse, optional Telefonnummer, gewählte Leistung und Ihre Nachricht sowie Ihre Zustimmung zur Datenschutzerklärung. Die Angaben verwenden wir ausschließlich, um Ihre Anfrage zu bearbeiten und mit Ihnen in Kontakt zu treten.',
          'Für die Übermittlung des Formulars nutzen wir den Dienst Web3Forms (web3forms.com) [Anbieterangaben und Anschrift laut Datenschutzerklärung von Web3Forms ergänzen]. Beim Absenden werden Ihre Eingaben an Web3Forms übertragen und von dort per E-Mail an unser Postfach weitergeleitet. Dabei kann Web3Forms technische Daten wie Ihre IP-Adresse verarbeiten. Eine Übermittlung in Drittländer, insbesondere die USA, ist möglich [bitte prüfen: Garantien/Standardvertragsklauseln]. Es besteht [bitte prüfen: Auftragsverarbeitungsvertrag mit Web3Forms].',
          'Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch das Setzen des Häkchens im Formular erteilen, sowie – wenn Ihre Anfrage auf einen Vertrag abzielt – Art. 6 Abs. 1 lit. b DSGVO. Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen (siehe Abschnitt 9).',
          'Wir speichern Ihre Anfrage, solange es zur Bearbeitung erforderlich ist, und löschen sie danach [Speicherdauer festlegen, z. B. 6 Monate nach Abschluss der Anfrage], sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
        ],
      },
      {
        id: 'kontakt-direkt',
        heading: '5. Kontakt per Telefon, E-Mail und WhatsApp',
        blocks: [
          'Wenn Sie uns anrufen oder eine E-Mail schreiben, verarbeiten wir Ihre Telefonnummer bzw. E-Mail-Adresse und den Inhalt Ihrer Nachricht, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).',
          'Auf dieser Website finden Sie Links, die WhatsApp öffnen (wa.me). Es handelt sich dabei nur um Verweise: Allein durch den Besuch unserer Seite werden keine Daten an WhatsApp übertragen. Erst wenn Sie einen solchen Link anklicken, werden Sie zu WhatsApp weitergeleitet. Wenn Sie uns dort eine Nachricht senden, verarbeitet WhatsApp Ihre Daten (u. a. Telefonnummer, Metadaten, Nachrichteninhalt) nach eigenen Datenschutzbestimmungen. Anbieter ist WhatsApp Ireland Limited bzw. Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland. Eine Datenübermittlung in die USA ist möglich. Informationen finden Sie unter whatsapp.com/legal/privacy-policy-eea. [Bitte bestätigen: Nutzung von WhatsApp bzw. WhatsApp Business durch das Unternehmen.]',
          'Rechtsgrundlage für die Kommunikation mit uns über WhatsApp ist Ihre Einwilligung bzw. Ihre freiwillige Kontaktaufnahme (Art. 6 Abs. 1 lit. a und b DSGVO). Wenn Sie keine Nachrichten über WhatsApp senden möchten, können Sie uns telefonisch, per E-Mail oder über das Kontaktformular erreichen.',
        ],
      },
      {
        id: 'schriftarten',
        heading: '6. Schriftarten (lokal eingebunden)',
        blocks: [
          'Diese Website verwendet die Schriftart „JetBrains Mono“. Die Schriftdateien werden von unserem eigenen Server (Hosting siehe Abschnitt 3) ausgeliefert und nicht von externen Servern wie Google Fonts geladen. Es findet daher keine Verbindung zu Servern Dritter statt, und es werden dafür keine Daten an Dritte übermittelt.',
        ],
      },
      {
        id: 'speicher',
        heading: '7. Lokaler Speicher (Spracheinstellung)',
        blocks: [
          'Wenn Sie die Sprache der Website umschalten (Deutsch/Englisch), speichern wir Ihre Auswahl im lokalen Speicher (localStorage) Ihres Browsers, damit sie beim nächsten Besuch erhalten bleibt. Dabei werden keine personenbezogenen Daten gespeichert, und die Information verlässt Ihr Gerät nicht. Sie ist technisch erforderlich, um die von Ihnen gewünschte Funktion bereitzustellen (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können den Eintrag jederzeit über die Einstellungen Ihres Browsers löschen.',
        ],
      },
      {
        id: 'externe-links',
        heading: '8. Externe Links (z. B. Google Maps)',
        blocks: [
          'Unsere Adresse verlinken wir mit einem einfachen Link zu Google Maps. Es wird keine Karte eingebettet. Erst wenn Sie den Link anklicken, öffnet sich Google Maps in einem neuen Tab, und Google verarbeitet Daten nach eigener Datenschutzerklärung (policies.google.com/privacy). Vor dem Klick werden keine Daten an Google übermittelt.',
        ],
      },
      {
        id: 'rechte',
        heading: '9. Ihre Rechte',
        blocks: [
          'Sie haben nach der DSGVO folgende Rechte gegenüber uns als Verantwortlichem:',
          [
            'Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)',
            'Berichtigung unrichtiger Daten (Art. 16 DSGVO)',
            'Löschung Ihrer Daten (Art. 17 DSGVO)',
            'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
            'Datenübertragbarkeit (Art. 20 DSGVO)',
            'Widerspruch gegen die Verarbeitung auf Grundlage berechtigter Interessen (Art. 21 DSGVO)',
            'Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)',
          ],
          'Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an {email}.',
          'Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig für uns ist: Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin, www.datenschutz-berlin.de.',
        ],
      },
      {
        id: 'sicherheit',
        heading: '10. Datensicherheit',
        blocks: [
          'Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.',
        ],
      },
      {
        id: 'aktualitaet',
        heading: '11. Aktualität und Änderungen',
        blocks: [
          'Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die rechtlichen Vorgaben ändern. Es gilt die jeweils hier veröffentlichte Fassung.',
          'Stand: [Datum eintragen]',
        ],
      },
    ],
  },
}

export default de
