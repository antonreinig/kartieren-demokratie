Unten ist eine User Story Map für kartieren.demokratie.dev – fokussiert auf den praktischen Prozess der Aushandlung (Perspektiven sichtbar machen, deliberatives Interview, erst nach Ende Auswertung). Ich orientiere mich dabei an eurem Grundkonzept „Werkstatt der Verbundenen Demokratie“ (Maximen: Anonymität, Menschlichkeit, Bedürfnisse vor Meinungen, transparente Verdichtung).  ￼

⸻

1) Rollen (Personas)

A. Themen-Ersteller (Initiator)
	•	Setzt Thema, Laufzeit, Rahmen/Scope, Kontext.
	•	Teilt Link, behält per „Secret Admin URL“ Bearbeitungsrechte.

B. Teilnehmer (Beitragende)
	•	Kommt über Slug-URL rein, gibt einen (auch pseudonymen) Namen an.
	•	Trägt Artefakte (Links) und Takeaways bei und/oder führt deliberatives Interview.
	•	Markiert Relevanz / Zustimmung / Einordnung von Informationshäppchen.

C. Admin (Systempflege)
	•	Sieht aktive Themen, kann löschen, Admin-URLs einsehen (Low-friction, intern).

⸻

2) Story-Map Backbone (Aktivitäten → Schritte)

Ich schreibe es als „Walking Skeleton“ entlang der Journey. Unter jedem Schritt: zentrale User Stories + Akzeptanzkriterien.

⸻

A) Thema erstellen (Wizard)

A1. Einstieg / Slug anlegen

User Stories
	•	Als Ersteller möchte ich unter der Hauptdomain einen Slug wählen (z. B. /mindestlohn), damit ich eine teilbare URL habe.
	•	Als Ersteller möchte ich sofort sehen, ob der Slug verfügbar ist (live validation), damit ich schnell iterieren kann.

Akzeptanzkriterien
	•	Slug-Feld validiert in Echtzeit: verfügbar / belegt / ungültige Zeichen.
	•	„Weiter“-Button nur aktiv, wenn Slug gültig & frei.

⸻

A2. Laufzeit festlegen

User Stories
	•	Als Ersteller möchte ich eine Laufzeit als Enddatum oder Dauer (Presets + Custom) setzen, damit der Prozess zeitlich begrenzt ist.

Akzeptanzkriterien
	•	Auswahl: Presets (3 Tage, 1 Woche, 2 Wochen, 1 Monat) + eigenes Enddatum.
	•	Laufzeit kann später via Secret Admin URL geändert werden.

⸻

A3. Inhaltlicher Rahmen (Kernfrage, Scope, Kontext, Name)

User Stories
	•	Als Ersteller möchte ich eine Kernfrage (gleichzeitig Titel) definieren, damit alle wissen, worauf sich Beiträge beziehen.
	•	Als Ersteller möchte ich den Umfang/Scope beschreiben (betroffen / nicht betroffen, kurzfristig vs. langfristig), damit die Aushandlung gerahmt ist.
	•	Als Ersteller möchte ich Kontext ergänzen, damit Teilnehmende denselben Ausgangspunkt haben.
	•	Als Ersteller möchte ich optional meinen Namen/Pseudonym angeben, damit es einen menschlichen Anker gibt.

Akzeptanzkriterien
	•	Pflicht: Kernfrage/Titel.
	•	Optional: Erstellername (Pseudonym erlaubt).
	•	Scope & Kontext sind klar getrennte Felder; Scope hat „gehört dazu / gehört nicht dazu“-Struktur oder mindestens Leitfragen.

⸻

A4. Starten / Success Page

User Stories
	•	Als Ersteller möchte ich die Umfrage starten, damit die URL live ist.
	•	Als Ersteller möchte ich eine Success Page mit Link, Vorschau, Copy/Share und Secret Admin Link bekommen, damit ich sofort verteilen und später bearbeiten kann.
	•	Als Ersteller möchte ich verstehen, dass der Admin-Link „ein Geheimnis“ ist, damit ich ihn sicher speichere.

Akzeptanzkriterien
	•	Success Page zeigt:
	•	öffentliche URL (Slug)
	•	Kurzvorschau (Kernfrage + Scope + Laufzeit)
	•	„Link kopieren“ / „Teilen“
	•	Secret Admin URL (klar gekennzeichnet, inkl. Hinweis „bei Verlust keine Bearbeitung möglich“)
	•	Thema ist sofort öffentlich erreichbar (read-only bis Name eingegeben).

⸻

B) Teilnahme: Mit Account oder als Gast

B1. Option A: Registrierung & Login (Empfohlen)

User Stories
	•	Als Teilnehmer möchte ich mich *ausschließlich* per "Magic Link" (E-Mail) einloggen, damit ich kein Passwort merken muss und es sicherer ist.
	•	Als Teilnehmer möchte ich ein Pseudonym wählen, damit ich in Diskussionen nicht mit meinem Klarnamen erscheine.
	•	Als Teilnehmer möchte ich ein Profilbild hochladen oder ein automatisch generiertes Avatar-Bild erhalten, damit ich wiedererkennbar bin.
	•	Als Teilnehmer möchte ich meinen Account löschen können und dabei sicher sein, dass *alle* meine Daten (auch Beiträge) restlos entfernt werden.

Akzeptanzkriterien
	•	Login/Register-Flow: Nur Magic Link (keine Passwörter).
	•	Profil-Setup: Pseudonym (Pflicht), Avatar (Upload oder Auto-Generated Identicon).
	•	"Account löschen": Löscht User-Daten UND alle verknüpften Beiträge/Artefakte/Einordnungen (Hard Delete, keine Anonymisierung der Inhalte).

B2. Option B: Gast-Zugang (Lokaler Token)

User Stories
	•	Als Teilnehmer möchte ich ohne Registrierung nur mit einem Pseudonym teilnehmen, um sofort starten zu können.
	•	Als Teilnehmer möchte ich darauf hingewiesen werden, dass meine Beiträge nur auf diesem Gerät gespeichert sind, damit ich weiß, dass bei Gerätewechsel meine Historie weg ist.
	•	Als System möchte ich den Gast über einen lokalen Token wiedererkennen, solange er das gleiche Gerät/Browser nutzt.

Akzeptanzkriterien
	•	Auswahl beim Start: "Mit Account fortfahren" vs. "Als Gast fortfahren".
	•	Gast-Mode: Pseudonym-Abfrage ist Pflicht.
	•	Warnhinweis im UI: "Deine Teilnahme ist lokal gespeichert. Bei Gerätewechsel zählst du als neuer Besucher."

⸻

B3. Überblick: Worum geht’s / worum nicht?

User Stories
	•	Als Teilnehmer möchte ich sofort den Rahmen sehen (Kernfrage, Scope, Kontext, Laufzeit), damit ich mich sinnvoll beteiligen kann.

Akzeptanzkriterien
	•	„Overview“-Screen oder Top-Bereich der Seite zeigt diese Inhalte kompakt.
	•	Klarer Call-to-Action: „Beitrag hinzufügen“ / „Interview starten“.

⸻

C) Beiträge hinzufügen (Wissensbasis aufbauen)

Es gibt einen zentralen Weg, Artefakte einzubringen, aus denen dann Erkenntnisse (Takeaways) abgeleitet werden.

C1. Artefakte & Informationen hinzufügen (Unified)

User Stories
	•	Als Teilnehmer möchte ich einen Link zu einem PDF, Video oder Artikel einfügen, um Wissen beizusteuern.
	•	Als Teilnehmer möchte ich die zentralen Erkenntnisse ("Key Takeaways") extrahieren (z. B. 3-4 Punkte bei einem langen Video, eine einzelne Zahl bei einer Studie).
	•	Als Teilnehmer möchte ich Tags vergeben, um den Beitrag einzuordnen (z. B. "Einstiegswissen", "Erfahrungsbericht", "Betroffenen-Perspektive", "Beispiellösung", "Vorschlag").

Akzeptanzkriterien
	•	Formularfeld für Link (URL) zu PDF/Video/Artikel.
	•	Eingabemöglichkeit für mehrere "Takeaways" pro Artefakt (Listenform).
	•	Tagging-System mit Mehrfachauswahl für die Kategorisierung (Einstieg, Erfahrung, Perspektive, Lösung, Vorschlag).

⸻

C2. Deliberatives Interview (KI-gestützt & Meinungsbild)

User Stories
	•	Als Teilnehmer möchte ich ein Interview führen, um meine Perspektive zu den Artefakten/Takeaways zu klären.
	•	Als Teilnehmer möchte ich während des Interviews jederzeit einen Button "Meinung im System updaten" drücken können, um meinen Standpunkt aktuell zu halten.
	•	Als Teilnehmer möchte ich, dass das System automatisch aus meinem Transkript ableitet, wie ich zu den einzelnen Key Takeaways stehe.

Akzeptanzkriterien
	•	Button "Meinung updaten" im Interview-Interface sichtbar.
	•	Automatische Extraktion aus dem Transkript:
	•	Generierung eines kurzen Satzes zur Haltung.
	•	Visuelle Kodierung: Zustimmung (Grün) / Ablehnung (Rot).
	•	Bewertung (Thumbs-up / Thumbs-down / Neutral) zu den einzelnen Takeaways.

⸻

D) Einordnen statt nur posten (Meta-Daten pro Informationshäppchen)

D1. Relevanz/Zustimmung/Einordnung sichtbar machen

User Stories
	•	Als Teilnehmer möchte ich bei jedem Fakt/Lösung/Vorschlag markieren können, ob er für mich relevant ist / überzeugt / problematisch ist, damit meine Haltung strukturiert erfasst wird.
    - Wenn KI aus meinem Interview eine Einordnung und Zustimmung oder Relevanz beigestellt hat, würde ich diese auch manuell noch anpassen können. 
	•	Als Teilnehmer möchte ich sehen, dass meine Einordnung später anderen angezeigt wird, damit Transparenz entsteht.

Akzeptanzkriterien
	•	Pro Item: einfache, schnelle Interaktion (z. B. „relevant / nicht relevant“ + optional „stimme zu / unsicher / stimme nicht zu“ + Freitextnotiz).
	•	Diese Einordnung ist öffentlich sichtbar, sobald die Ergebnisse angezeigt werden (nach Ablauf).
	•	KI kann diese Signale auswerten (Polarisation/Konsens).

⸻

E) Sichtbarkeit & Abschlusslogik (vorher „blind“, nachher „Auswertung“)

E1. Während der Laufzeit: Wissensbasis offen, Meinungsbild verdeckt

User Stories
	•	Als Teilnehmer möchte ich jederzeit alle gesammelten Artefakte (Links, Takeaways) sehen, um mich zu informieren.
	•	Als Teilnehmer möchte ich aber *nicht* sehen, wie viele Leute welchem Takeaway zugestimmt haben, damit ich unbeeinflusst bleibe.
	•	Als KI-System möchte ich jederzeit Zugriff auf alle Beiträge und Einordnungen haben, um das deliberative Interview zu führen.

Akzeptanzkriterien
	•	Wissensbasis (Liste der Artefakte & Takeaways) ist für alle eingeloggten Nutzer sichtbar.
	•	Social Proof (Likes, Zustimmung, Verteilung rot/grün) ist *ausgeblendet* bis zum Enddatum.
	•	Lediglich ein globaler "Teilnehmer-Zähler" ist sichtbar.
	•	Eigene Einordnungen sind natürlich für mich selbst sichtbar.

⸻

E2. Nach Ablauf: Ergebnis-/Summary-Seite

User Stories
	•	Als Besucher möchte ich nach Ablauf eine KI-gestützte Zusammenfassung sehen, damit ich schnell verstehe, was die zentralen Linien sind.
	•	Als Besucher möchte ich die Quelldaten einsehen (Fakten, Lösungen, Vorschläge + Einordnungen), damit Transparenz gegeben ist.
	•	Als Ersteller möchte ich eine „Auswertung“ haben, die qualitative Muster quantifiziert (z. B. Häufigkeiten), damit es belastbar wirkt.

Akzeptanzkriterien
	•	Nach Enddatum wechselt die Slug-URL automatisch in „Results Mode“:
	•	Zusammenfassung (Cluster/Kategorien)
	•	Übersicht: wichtigste Fragen/Probleme/Ideen/Insights
	•	einfache Quantifizierung (Anzahl Personen pro Kategorie/Einordnung)
	•	Drilldown in Quelldaten + Notizen/Einordnungen der Einzelnen
	•	Kategorien werden aus Daten abgeleitet (kein starres Taxonomie-Zwang).

⸻

F) Bearbeiten (Secret Admin URL)

F1. Thema live anpassen

User Stories
	•	Als Ersteller möchte ich Titel/Scope/Kontext/Laufzeit anpassen können, auch wenn live, damit ich iterieren kann.

Akzeptanzkriterien
	•	Secret Admin URL erlaubt Editieren der Setup-Daten.

⸻

G) Admin-Konsole (Systempflege)

G1. Themenübersicht, löschen, Admin-URLs

User Stories
	• Um mich als Admin anzumelden, muss ich mich einloggen auf der Website. Nur anton.reinig@gmail.com ist admin. Alle anderen angemeldeten Users sind normale Beitragende.	
    - Als Admin möchte ich alle aktuellen Themen sehen (Slug, Status, Enddatum), damit ich moderieren kann.
	•	Als Admin möchte ich Themen löschen können, damit Missbrauch entfernt werden kann.
	•	Als Admin möchte ich Admin-URLs einsehen, damit Support möglich ist (bewusst riskant, aber gewollt als Minimal-Admin).

Akzeptanzkriterien
	•	Liste: Slug, Titel, erstellt am, Enddatum, Status (laufend/abgeschlossen), Teilnahmezahl (optional).