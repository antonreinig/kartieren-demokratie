import { PrismaClient, ArtifactType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TOPIC 1: WEHRDIENST
// ============================================================================
const WEHRDIENST_TOPIC = {
    slug: 'wehrdienst',
    title: 'Wiedereinführung des Wehrdienstes in Deutschland',
    description: 'Soll der Wehrdienst in Deutschland wieder eingeführt werden? Diese Debatte beleuchtet verschiedene Perspektiven zu Wehrpflicht, Freiwilligendienst und gesellschaftlicher Verantwortung.',
    scope: 'Diese Diskussion behandelt die mögliche Wiedereinführung einer Wehrpflicht oder verpflichtenden Dienstzeit in Deutschland. Im Fokus stehen historische Erfahrungen, europäische Modelle, persönliche Erfahrungsberichte und konkrete Reformvorschläge.',
};

const WEHRDIENST_DATA = [
    // Grundlagen
    {
        kategorie: 'Grundlagen',
        titel: 'Wie funktioniert die Wehrpflicht? (bpb)',
        medientyp: 'Webseite',
        link: 'https://www.bpb.de/kurz-knapp/hintergrund-aktuell/550475/wie-funktioniert-die-wehrpflicht/',
        keyTakeaways: [
            'Wehrpflicht im Grundgesetz verankert, aber ausgesetzt',
            'Aussetzung 2011 ≠ Abschaffung',
            'Reaktivierung im Verteidigungsfall möglich',
            'Historisch zentrales Instrument der Landesverteidigung',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Neuer Wehrdienst für Deutschland (BMVg)',
        medientyp: 'Webseite',
        link: 'https://www.bmvg.de/de/neuer-wehrdienst',
        keyTakeaways: [
            'Pflichtfragebogen für junge Männer geplant',
            'Ziel: Überblick über Bereitschaft und Fähigkeiten',
            'Kein sofortiger Zwangsdienst',
            'Schrittweise Reform statt klassischer Wehrpflicht',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Wehrpflicht – historischer Rückblick (DBwV)',
        medientyp: 'Artikel',
        link: 'https://www.dbwv.de/aktuelle-themen/blickpunkt/beitrag/wehrpflicht-ein-historischer-rueckblick',
        keyTakeaways: [
            'Wehrpflicht seit dem 19. Jahrhundert prägend',
            'Wandel von Massenarmee zu Freiwilligenmodell',
            'Gesellschaftliche Akzeptanz schwankt',
            'Sicherheitspolitik treibt Debatte neu an',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Comparative Study of European Conscription Models',
        medientyp: 'Studie',
        link: 'https://sjms.nu/articles/10.31374/sjms.166',
        keyTakeaways: [
            'Europäische Wehrdienstmodelle stark unterschiedlich',
            'Motivation wichtiger als reine Pflicht',
            'Gender- und Wahlmodelle nehmen zu',
            'Rückkehr der Wehrpflicht in einigen Ländern',
        ],
    },
    // Erfahrung
    {
        kategorie: 'Erfahrung',
        titel: 'Freiwilliger Wehrdienst – Mein Bericht',
        medientyp: 'YouTube',
        link: 'https://www.youtube.com/watch?v=YP2jwiAoBHA',
        keyTakeaways: [
            'Freiwilligkeit als Motivationsfaktor',
            'Alltag und Struktur prägen stark',
            'Persönliche Entwicklung im Fokus',
            'Ambivalente Bewertung des Dienstes',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: '11 Monate FWDL – Erfahrungsbericht',
        medientyp: 'YouTube',
        link: 'https://www.youtube.com/watch?v=J8RQGSAq5cY',
        keyTakeaways: [
            'Musterung als Einstiegshürde',
            'Kameradschaft zentral',
            'Physische und mentale Belastung',
            'Realität unterscheidet sich von Erwartungen',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: 'AskEurope: Compulsory Military Service',
        medientyp: 'Online-Diskussion',
        link: 'https://www.reddit.com/r/AskEurope/comments/1p72tkv/what_do_you_think_about_compulsory_military/',
        keyTakeaways: [
            'Sehr unterschiedliche nationale Erfahrungen',
            'Sinn hängt von Dienstgestaltung ab',
            'Für manche identitätsstiftend',
            'Für andere Zeitverlust und Zwang',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: '5 Dinge, die ich als Soldat gelernt habe',
        medientyp: 'YouTube',
        link: 'https://www.youtube.com/watch?v=WHxnoLruToc',
        keyTakeaways: [
            'Teamfähigkeit und Disziplin',
            'Umgang mit Hierarchien',
            'Belastbarkeit als Lernerfahrung',
            'Übertragbarkeit ins zivile Leben',
        ],
    },
    // Vorschlag
    {
        kategorie: 'Vorschlag',
        titel: 'Debatte um neues Wehrdienstgesetz (Deutschlandfunk)',
        medientyp: 'Artikel',
        link: 'https://www.deutschlandfunk.de/wehrpflicht-bundeswehr-wehrdienst-modernisierungsgesetz-kriegsdienstverweigerung-100.html',
        keyTakeaways: [
            'Grundrecht auf Verweigerung bleibt zentral',
            'Gesellschaftliche Skepsis wächst',
            'Beteiligung junger Menschen gefordert',
            'Legitimität wichtiger als Zwang',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Soziales Pflichtjahr',
        medientyp: 'Webseite',
        link: 'https://de.wikipedia.org/wiki/Soziales_Pflichtjahr',
        keyTakeaways: [
            'Alternative zur militärischen Pflicht',
            'Gleichstellung der Geschlechter möglich',
            'Gesellschaftlicher Nutzen breit',
            'Verfassungsrechtlich umstritten',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Europe\'s Conscription Challenge (Carnegie)',
        medientyp: 'Analyse',
        link: 'https://carnegieendowment.org/research/2024/07/europes-conscription-challenge-lessons-from-nordic-and-baltic-states',
        keyTakeaways: [
            'Kombination aus Pflicht und Freiwilligkeit',
            'Akzeptanz entscheidend',
            'Skandinavische Modelle als Vorbild',
            'Sicherheitspolitischer Kontext zentral',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Mandatory National Service – Pros & Cons',
        medientyp: 'Übersicht',
        link: 'https://www.britannica.com/procon/mandatory-national-service-debate',
        keyTakeaways: [
            'Pro: sozialer Zusammenhalt',
            'Contra: Freiheitsrechte und Effizienz',
            'Hybride Modelle verbreitet',
            'Stark politisch kontextabhängig',
        ],
    },
    // Grundlagenforschung
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Did you serve? Wage Effects of Conscription',
        medientyp: 'Studie (PDF)',
        link: 'https://www.bib.bund.de/Publikation/2025/pdf/Did-you-serve-New-evidence-on-the-causal-effect-of-conscription-on-wage-in-Germany.pdf',
        keyTakeaways: [
            'Quasi-experimentelles Design',
            'Analyse von Lohneffekten',
            'Kaum langfristige Einkommensnachteile',
            'Empirische Grundlage für Policy-Debatte',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Compulsory Military Service & Personality (DIW)',
        medientyp: 'Studie (PDF)',
        link: 'https://www.diw.de/documents/publikationen/73/diw_01.c.504510.de/diw_sp0751.pdf',
        keyTakeaways: [
            'Wehrdienst als prägendes Lebensereignis',
            'Einfluss auf Persönlichkeit möglich',
            'Langfristige Effekte moderat',
            'Relevant für Arbeitsmarkt- und Bildungspolitik',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Pflicht- vs. Freiwilligendienst (Uni Hamburg)',
        medientyp: 'Studie',
        link: 'https://www.uni-hamburg.de/en/newsroom/presse/2025/pm47.html',
        keyTakeaways: [
            'Mehrheit offen für Pflichtmodelle',
            'Hohe Zustimmung für Wahlfreiheit',
            'Militär oder sozialer Dienst bevorzugt',
            'Freiwilligkeit erhöht Akzeptanz',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Conscription in Germany (Paloyo)',
        medientyp: 'Studie (PDF)',
        link: 'https://www.econstor.eu/bitstream/10419/45304/1/635643855.pdf',
        keyTakeaways: [
            'Historische Arbeitsmarkteffekte untersucht',
            'Keine starken negativen Effekte',
            'Ökonomisch weniger relevant als erwartet',
            'Wichtig für Langzeitbewertung',
        ],
    },
];

// ============================================================================
// TOPIC 2: MEDIENNUTZUNG
// ============================================================================
const MEDIENNUTZUNG_TOPIC = {
    slug: 'mediennutzung',
    title: 'Mediennutzung in der Familie',
    description: 'Wie finden wir als Familie einen guten Umgang mit Medien? Dieser Austausch richtet sich an Eltern und Jugendliche (12–14 Jahre) und behandelt Smartphone-Nutzung, Filme, Spiele und gemeinsame Regeln.',
    scope: 'Diese Diskussion fokussiert auf den innerfamiliären Austausch über Mediennutzung. Im Mittelpunkt stehen das gemeinsame Aushandeln von Regeln, altersgerechte Freiheiten, Vertrauen vs. Kontrolle sowie konkrete Werkzeuge für den Familienalltag.',
};

const MEDIENNUTZUNG_DATA = [
    // Grundlagen
    {
        kategorie: 'Grundlagen',
        titel: 'Mediennutzung von Kindern und Jugendlichen (bpb)',
        medientyp: 'Webseite',
        link: 'https://www.bpb.de/themen/medien-journalismus/medienkompetenz/',
        keyTakeaways: [
            'Medien sind Teil jugendlicher Lebenswelt',
            'Verbote allein wirken selten',
            'Dialog und Begleitung sind zentral',
            'Medienkompetenz ist lernbar',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Was Kinder im Netz wirklich brauchen (klicksafe)',
        medientyp: 'Webseite',
        link: 'https://www.klicksafe.de/eltern',
        keyTakeaways: [
            'Schutz und Vertrauen gehören zusammen',
            'Altersangaben sind Orientierung, keine Garantie',
            'Eltern bleiben wichtige Ansprechpartner',
            'Gemeinsames Aushandeln stärkt Verantwortung',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Medienerziehung in der Familie (BZgA)',
        medientyp: 'Webseite',
        link: 'https://www.kindergesundheit-info.de/themen/medien/',
        keyTakeaways: [
            'Medien beeinflussen Entwicklung je nach Nutzung',
            'Qualität wichtiger als reine Zeit',
            'Regeln sollten altersgerecht wachsen',
            'Vorbildfunktion der Eltern entscheidend',
        ],
    },
    {
        kategorie: 'Grundlagen',
        titel: 'Warum Bildschirmzeit allein die falsche Frage ist',
        medientyp: 'Artikel',
        link: 'https://www.zeit.de/digital/internet/2023-01/bildschirmzeit-kinder-erziehung',
        keyTakeaways: [
            'Nicht jede Bildschirmzeit ist gleich',
            'Soziale & kreative Nutzung unterscheidet sich stark',
            'Kontext wichtiger als Minuten',
            'Gespräche wichtiger als Kontrolle',
        ],
    },
    // Erfahrung
    {
        kategorie: 'Erfahrung',
        titel: 'Wie wir Medienregeln in unserer Familie aushandeln',
        medientyp: 'Artikel',
        link: 'https://www.eltern.de/familie-und-heim/erziehung/medienregeln-in-der-familie--13886280.html',
        keyTakeaways: [
            'Regeln entstehen im Gespräch',
            'Kinder akzeptieren Regeln eher, wenn sie beteiligt sind',
            'Konflikte gehören dazu',
            'Anpassung an Alter notwendig',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: 'Jugendliche erzählen: Was nervt an Medienregeln?',
        medientyp: 'Artikel',
        link: 'https://www.spiegel.de/familie/jugendliche-ueber-handy-regeln-a-00000000-0000-0000-0000-000000000000',
        keyTakeaways: [
            'Kinder wünschen sich Vertrauen',
            'Unverständnis für pauschale Verbote',
            'Vergleich mit Peers wichtig',
            'Bedürfnis nach Autonomie',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: 'Podcast: Smarter leben – Kinder & Smartphones',
        medientyp: 'Podcast',
        link: 'https://www.deutschlandfunknova.de/podcasts/smarter-leben',
        keyTakeaways: [
            'Ambivalente Rolle von Smartphones',
            'Eltern sind oft selbst unsicher',
            'Regeln verändern sich mit Erfahrung',
            'Perfekte Lösung gibt es nicht',
        ],
    },
    {
        kategorie: 'Erfahrung',
        titel: 'YouTube: Medienregeln aus Sicht eines 13-Jährigen',
        medientyp: 'YouTube',
        link: 'https://www.youtube.com/watch?v=QKJYJ7Xq8kU',
        keyTakeaways: [
            'Kinder erleben Regeln oft als unfair',
            'Vergleich mit Freunden prägend',
            'Wunsch nach Mitbestimmung',
            'Regeln sollten erklärbar sein',
        ],
    },
    // Vorschlag
    {
        kategorie: 'Vorschlag',
        titel: 'Mediennutzungsvertrag für Familien',
        medientyp: 'Vorlage/PDF',
        link: 'https://www.mediennutzungsvertrag.de/',
        keyTakeaways: [
            'Regeln gemeinsam festlegen',
            'Klare Absprachen reduzieren Streit',
            'Vertrag ist veränderbar',
            'Verantwortung wird geteilt',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Familien-Medienzeiten gemeinsam planen',
        medientyp: 'Webseite',
        link: 'https://www.schlaukopf.de/familien-medienzeiten',
        keyTakeaways: [
            'Planung schafft Transparenz',
            'Unterschiedliche Tage unterschiedlich bewerten',
            'Schule & Freizeit berücksichtigen',
            'Flexibilität wichtig',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Vom Verbot zur Vereinbarung – Medienregeln neu denken',
        medientyp: 'Artikel',
        link: 'https://www.geo.de/geolino/eltern/medienerziehung-30453.html',
        keyTakeaways: [
            'Weg vom Machtkampf',
            'Fokus auf Verantwortung',
            'Regeln als Lernprozess',
            'Beziehung wichtiger als Durchsetzung',
        ],
    },
    {
        kategorie: 'Vorschlag',
        titel: 'Medienregeln altersabhängig gestalten',
        medientyp: 'Webseite',
        link: 'https://www.kinder.de/familie/medienregeln-nach-alter/',
        keyTakeaways: [
            'Mit zunehmendem Alter mehr Freiheit',
            'Regeln regelmäßig überprüfen',
            'Fehler gehören dazu',
            'Ziel ist Selbstregulation',
        ],
    },
    // Grundlagenforschung
    {
        kategorie: 'Grundlagenforschung',
        titel: 'JIM-Studie – Jugend, Information, Medien',
        medientyp: 'Studie',
        link: 'https://www.mpfs.de/studien/jim-studie/',
        keyTakeaways: [
            'Fast alle Jugendlichen täglich online',
            'Social Media zentral für soziale Beziehungen',
            'Eltern unterschätzen oft Bedeutung',
            'Kompetenzen sehr unterschiedlich',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Bildschirmzeit und psychische Gesundheit (Review)',
        medientyp: 'Studie',
        link: 'https://www.nature.com/articles/s41562-020-00965-5',
        keyTakeaways: [
            'Kein einfacher Zusammenhang zwischen Zeit und Schaden',
            'Inhalte und Nutzungskontext entscheidend',
            'Extreme Nutzung problematisch',
            'Pauschale Grenzwerte wissenschaftlich fraglich',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Medienkompetenz statt Medienverzicht',
        medientyp: 'Studie',
        link: 'https://www.dji.de/themen/medienkompetenz.html',
        keyTakeaways: [
            'Kompetenz schützt besser als Verbote',
            'Reflexion fördert Selbststeuerung',
            'Familie als Lernort zentral',
            'Schule und Elternhaus ergänzen sich',
        ],
    },
    {
        kategorie: 'Grundlagenforschung',
        titel: 'Elterliche Kontrolle vs. Begleitung',
        medientyp: 'Studie',
        link: 'https://journals.sagepub.com/doi/10.1177/14614448211063133',
        keyTakeaways: [
            'Restriktive Kontrolle wirkt kurzfristig',
            'Begleitende Strategien nachhaltiger',
            'Vertrauen fördert Offenheit',
            'Beziehung beeinflusst Wirkung von Regeln',
        ],
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Map media types to ArtifactType enum
function mapMediaType(medientyp: string): ArtifactType {
    const typeLower = medientyp.toLowerCase();
    if (typeLower === 'youtube' || typeLower.includes('video') || typeLower === 'podcast') {
        return 'VIDEO';
    }
    if (typeLower.includes('pdf') || typeLower.includes('vorlage')) {
        return 'PDF';
    }
    return 'LINK';
}

interface TopicConfig {
    slug: string;
    title: string;
    description: string;
    scope: string;
}

interface MediaItem {
    kategorie: string;
    titel: string;
    medientyp: string;
    link: string;
    keyTakeaways: string[];
}

async function seedTopic(
    topicConfig: TopicConfig,
    mediaData: MediaItem[],
    systemUserId: string
) {
    // Check if topic already exists
    const existingTopic = await prisma.topic.findUnique({
        where: { slug: topicConfig.slug },
    });

    if (existingTopic) {
        console.log(`⚠️  Topic "${topicConfig.slug}" already exists. Deleting and recreating...`);
        await prisma.topic.delete({
            where: { slug: topicConfig.slug },
        });
    }

    // Create the topic
    const topic = await prisma.topic.create({
        data: {
            slug: topicConfig.slug,
            title: topicConfig.title,
            description: topicConfig.description,
            scope: topicConfig.scope,
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            adminToken: `test-admin-token-${topicConfig.slug}-2024`,
            creatorId: systemUserId,
        },
    });
    console.log(`✅ Created topic: ${topic.title}`);

    // Create all artifacts with their takeaways and tags
    for (const item of mediaData) {
        const artifact = await prisma.artifact.create({
            data: {
                url: item.link,
                type: mapMediaType(item.medientyp),
                title: item.titel,
                description: `${item.medientyp} zum Thema ${topicConfig.title}`,
                topicId: topic.id,
                contributorId: systemUserId,
                takeaways: {
                    create: item.keyTakeaways.map((content) => ({
                        content,
                    })),
                },
                tags: {
                    create: [{ label: item.kategorie }],
                },
            },
        });
        console.log(`  📄 Created artifact: ${artifact.title}`);
    }

    return topic;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🌱 Starting seed...\n');

    // Create a system user for seeding if it doesn't exist
    let systemUser = await prisma.user.findFirst({
        where: { email: 'system@kartieren-demokratie.de' },
    });

    if (!systemUser) {
        systemUser = await prisma.user.create({
            data: {
                email: 'system@kartieren-demokratie.de',
                name: 'System',
                role: 'ADMIN',
            },
        });
        console.log('✅ Created system user\n');
    }

    // Seed all topics
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 TOPIC 1: WEHRDIENST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const wehrdienstTopic = await seedTopic(WEHRDIENST_TOPIC, WEHRDIENST_DATA, systemUser.id);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 TOPIC 2: MEDIENNUTZUNG');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const mediennutzungTopic = await seedTopic(MEDIENNUTZUNG_TOPIC, MEDIENNUTZUNG_DATA, systemUser.id);

    // Summary
    console.log('\n');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📝 Test topics:');
    console.log('');
    console.log(`   1. ${wehrdienstTopic.title}`);
    console.log(`      URL: /${wehrdienstTopic.slug}`);
    console.log(`      Admin Token: test-admin-token-${wehrdienstTopic.slug}-2024`);
    console.log(`      Artifacts: ${WEHRDIENST_DATA.length}`);
    console.log('');
    console.log(`   2. ${mediennutzungTopic.title}`);
    console.log(`      URL: /${mediennutzungTopic.slug}`);
    console.log(`      Admin Token: test-admin-token-${mediennutzungTopic.slug}-2024`);
    console.log(`      Artifacts: ${MEDIENNUTZUNG_DATA.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
