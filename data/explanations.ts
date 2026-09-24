import type { ExplanationSection, Source } from "@/domain/types";
import {
  ACTIVITY_FACTORS,
  ACTIVITY_LABELS,
  DEFAULT_MEAL_CALORIES,
  DEFAULT_MEAL_PROTEIN,
  DEFAULT_SURPLUS_CALORIES,
  FAT_CORRECTION_GRAMS,
  FAT_ENERGY_FRACTION,
  KATCH_MCARDLE,
  KCAL_PER_GRAM,
  KCAL_PER_KG,
  KCAL_TOLERANCE,
  MAX_DEFICIT_FRACTION,
  MIFFLIN_ST_JEOR,
  OVEN_FALLBACK_TIME_FACTOR,
  PROTEIN_PER_KG_BODY_WEIGHT,
  PROTEIN_PER_KG_LEAN_MASS,
} from "@/domain/constants";
import { DEFAULT_MEAL_SLOT_CALORIES } from "@/calculations/meals";
import { number, signed } from "@/services/format";

// User-facing background for every calculation. Numbers are read from the same
// constants the calculations use, so changing a rule also changes its explanation.
const SOURCES = {
  mifflin: {
    label: "Mifflin e.a. (1990), American Journal of Clinical Nutrition",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  frankenfield: {
    label: "Frankenfield e.a. (2005), systematische review",
    url: "https://pubmed.ncbi.nlm.nih.gov/15883556/",
  },
  hall: {
    label: "Hall e.a. (2011), The Lancet",
    url: "https://pubmed.ncbi.nlm.nih.gov/21872751/",
  },
  morton: {
    label: "Morton e.a. (2018), British Journal of Sports Medicine",
    url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
  },
  healthCouncil: {
    label: "Gezondheidsraad: voedingsnormen voor vetten",
    url: "https://www.gezondheidsraad.nl/adviesonderwerpen/voedingsnormen/voedingsnormen-voor-vetten-vetzuren-verteerbare-koolhydraten-en-voedingsvezels",
  },
  labelling: {
    label: "EU-verordening 1169/2011 (voedselinformatie), bijlage XIV",
    url: "https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32011R1169",
  },
  mealPrep: {
    label: "Voedingscentrum: hoe kan ik meal preppen?",
    url: "https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/koken-en-bewaren/hoe-kan-ik-meal-preppen",
  },
} satisfies Record<string, Source>;

const percent = (fraction: number) => `${number(fraction * 100)}%`;
const factors = Object.values(ACTIVITY_FACTORS);
const mealSlotTotal = DEFAULT_MEAL_SLOT_CALORIES.reduce((a, b) => a + b, 0);

export const explanationSections: ExplanationSection[] = [
  {
    id: "energy",
    title: "Je energieverbruik",
    how: [
      "Eerst schat PrepPartner hoeveel energie je lichaam in rust verbruikt: je rustverbruik (BMR). Heb je een vetpercentage ingevuld, dan gebruiken we de formule van Katch–McArdle; anders die van Mifflin–St Jeor.",
      "Daarna vermenigvuldigen we je rustverbruik met een activiteitsfactor. Dat is je geschatte verbruik per dag (TDEE). Je trainingen zitten in die factor; we tellen ze niet nog een keer op.",
    ],
    formulas: [
      `Mifflin–St Jeor = ${number(MIFFLIN_ST_JEOR.perKg)} × gewicht (kg) + ${number(MIFFLIN_ST_JEOR.perCm, 2)} × lengte (cm) − ${number(MIFFLIN_ST_JEOR.perYear)} × leeftijd, ${signed(MIFFLIN_ST_JEOR.male)} voor mannen of ${signed(MIFFLIN_ST_JEOR.female)} voor vrouwen`,
      `Katch–McArdle = ${number(KATCH_MCARDLE.base)} + ${number(KATCH_MCARDLE.perKgLeanMass, 1)} × vetvrije massa (kg)`,
      "Verbruik per dag = rustverbruik × activiteitsfactor",
      `Activiteitsfactoren: ${Object.entries(ACTIVITY_FACTORS)
        .map(
          ([key, value]) =>
            `${ACTIVITY_LABELS[key as keyof typeof ACTIVITY_LABELS].split(" •")[0]} ${number(value, 3)}`,
        )
        .join(" · ")}`,
    ],
    assumptions: [
      {
        level: "evidence",
        text: "Mifflin–St Jeor is gemaakt op basis van metingen bij bijna 500 gezonde volwassenen. Van de gangbare formules zit deze het vaakst binnen 10% van een gemeten rustverbruik.",
        sources: [SOURCES.mifflin, SOURCES.frankenfield],
      },
      {
        level: "rule-of-thumb",
        text: "Katch–McArdle rekent met je vetvrije massa. Dat past beter bij gespierde mensen, maar alleen als je vetpercentage klopt.",
      },
      {
        level: "rule-of-thumb",
        text: `De activiteitsfactoren (${number(Math.min(...factors), 3)} tot ${number(Math.max(...factors), 3)}) zijn gangbare gemiddelden, niet voor jou gemeten.`,
      },
    ],
    why: "Je verbruik bepaalt hoeveel je kunt eten om af te vallen, gelijk te blijven of aan te komen. Een formule met gewicht, lengte, leeftijd en geslacht geeft een goed startpunt zonder meting in een lab.",
    limits: [
      "Het blijft een gemiddelde: je werkelijke verbruik kan 10% of meer afwijken.",
      "Vetpercentages van een weegschaal thuis kunnen flink afwijken. Twijfel je, laat het veld dan leeg.",
      "Twijfel je tussen twee activiteitsniveaus, kies dan het laagste en stel bij als je gewicht anders verloopt dan verwacht.",
    ],
  },
  {
    id: "goal",
    title: "Je doel: tekort of overschot",
    how: [
      "Afvallen: je gewenste kilo’s per week worden omgerekend naar een tekort per dag. Dat tekort gaat van je verbruik af.",
      `Het automatische tekort is nooit groter dan ${percent(MAX_DEFICIT_FRACTION)} van je verbruik. Vraag je meer, dan zie je een waarschuwing.`,
      `Op gewicht blijven: je caloriedoel is je verbruik. Aankomen: je verbruik plus een overschot dat je zelf kiest, standaard ${number(DEFAULT_SURPLUS_CALORIES)} kcal.`,
      "Je kunt je caloriedoel altijd zelf overschrijven.",
    ],
    formulas: [`Tekort per dag = kilo per week × ${number(KCAL_PER_KG)} ÷ 7`],
    assumptions: [
      {
        level: "rule-of-thumb",
        text: `1 kilo lichaamsgewicht staat voor ongeveer ${number(KCAL_PER_KG)} kcal.`,
        sources: [SOURCES.hall],
      },
      {
        level: "choice",
        text: `Het automatische tekort is maximaal ${percent(MAX_DEFICIT_FRACTION)} van je verbruik.`,
      },
      {
        level: "choice",
        text: `Het standaardoverschot bij aankomen is ${number(DEFAULT_SURPLUS_CALORIES)} kcal per dag.`,
      },
    ],
    why: "Een vast tekort of overschot maakt je doel concreet en voorspelbaar voor de eerste weken. De grens voorkomt een tempo dat je niet volhoudt.",
    limits: [
      `Je lichaam past zich aan. Na een tijd val je trager af dan de rekensom zegt: onderzoek laat zien dat een vaste ${number(KCAL_PER_KG)}-regel het effect op lange termijn overschat.`,
      "Weeg je een paar keer per week op hetzelfde moment en kijk naar het gemiddelde. Stel na een paar weken bij.",
      "Ben je zwanger, heb je een medische aandoening of een eetstoornis? Overleg dan eerst met een arts of diëtist.",
    ],
  },
  {
    id: "macros",
    title: "Eiwit, vet en koolhydraten",
    how: [
      `Eiwit: ${number(PROTEIN_PER_KG_BODY_WEIGHT, 1)} g per kilo lichaamsgewicht. Met een vetpercentage: ${number(PROTEIN_PER_KG_LEAN_MASS, 1)} g per kilo vetvrije massa.`,
      `Vet: ${percent(FAT_ENERGY_FRACTION)} van je calorieën. Koolhydraten vullen de calorieën die daarna overblijven.`,
      `We rekenen met ${KCAL_PER_GRAM.protein} kcal per gram eiwit en koolhydraten en ${KCAL_PER_GRAM.fat} kcal per gram vet.`,
    ],
    formulas: [
      `Vet (g) = caloriedoel × ${percent(FAT_ENERGY_FRACTION)} ÷ ${KCAL_PER_GRAM.fat}`,
      `Koolhydraten (g) = (caloriedoel − eiwit × ${KCAL_PER_GRAM.protein} − vet × ${KCAL_PER_GRAM.fat}) ÷ ${KCAL_PER_GRAM.carbs}`,
    ],
    assumptions: [
      {
        level: "evidence",
        text: "Bij krachttraining levert meer dan ongeveer 1,6 g eiwit per kilo per dag gemiddeld geen extra spiergroei op.",
        sources: [SOURCES.morton],
      },
      {
        level: "choice",
        text: `Met een vetpercentage rekenen we ${number(PROTEIN_PER_KG_LEAN_MASS, 1)} g per kilo vetvrije massa. Je spieren bepalen je eiwitbehoefte, je vetmassa niet; voor de meeste sporters komt dit op een vergelijkbare of iets hogere hoeveelheid uit.`,
      },
      {
        level: "choice",
        text: `Vet op ${percent(FAT_ENERGY_FRACTION)} van je calorieën, binnen de Nederlandse aanbeveling van 20 tot 40%.`,
        sources: [SOURCES.healthCouncil],
      },
      {
        level: "evidence",
        text: "4 kcal per gram eiwit en koolhydraten en 9 kcal per gram vet zijn de omrekenfactoren die ook voor etiketten gelden.",
        sources: [SOURCES.labelling],
      },
    ],
    why: "Eiwit helpt spieren te behouden en op te bouwen, zeker als je minder eet dan je verbruikt. Met eiwit vast en vet binnen de aanbevolen marge blijven koolhydraten over als brandstof voor je training.",
    limits: [
      `Pas je zelf macro’s aan, controleer dan of ze samen bij je caloriedoel passen. De app waarschuwt bij meer dan ${number(KCAL_TOLERANCE)} kcal verschil.`,
      "Heb je nierproblemen? Overleg met een arts voordat je veel eiwit eet.",
    ],
  },
  {
    id: "meals",
    title: "Je dagindeling",
    how: [
      "Je caloriedoel wordt verdeeld over zes eetmomenten, waarvan twee mealprep-maaltijden.",
      `Bij ${number(mealSlotTotal)} kcal is de startverdeling ${DEFAULT_MEAL_SLOT_CALORIES.map((value) => number(value)).join(" / ")} kcal. Bij een ander doel schaalt die naar verhouding mee.`,
      "Zet je een moment vast, dan blijft dat gelijk en wordt de rest naar verhouding verdeeld. Afronden gebeurt zo dat het totaal precies klopt.",
      "Nieuwe recepten krijgen als caloriedoel het gemiddelde van je twee mealprep-momenten.",
    ],
    assumptions: [
      {
        level: "choice",
        text: "De startverdeling met twee grote mealprep-maaltijden en kleinere momenten ertussen.",
      },
      {
        level: "choice",
        text: "Recepten starten op het gemiddelde van je mealprep-momenten, tussen 100 en 2.000 kcal.",
      },
    ],
    why: "Met vaste eetmomenten weet je per bakje hoeveel calorieën erin moeten. Zo sluit je batch aan op je hele dag.",
    limits: [
      "De verdeling is een voorstel. Past het niet bij je ritme, verander dan de momenten of zet ze vast.",
    ],
  },
  {
    id: "scaling",
    title: "Recepten op maat",
    how: [
      "Elk recept heeft per ingrediënt een voorkeurshoeveelheid met een minimum en maximum.",
      "Groente, saus en smaakmakers blijven op hun voorkeurshoeveelheid. PrepPartner zoekt de hoeveelheid van de eiwitbron in stappen van 1 gram en rekent daarbij de rijst of pasta uit.",
      `Olie mag als kleine correctie maximaal ${number(FAT_CORRECTION_GRAMS)} gram afwijken. Het doel: binnen ${number(KCAL_TOLERANCE)} kcal van je caloriedoel, met minstens je eiwitdoel. Eiwit gaat voor.`,
    ],
    assumptions: [
      {
        level: "choice",
        text: "Groente, saus en smaakmakers schalen niet mee.",
      },
      {
        level: "choice",
        text: `Olie verandert hooguit ${number(FAT_CORRECTION_GRAMS)} gram, en een portie is goed genoeg binnen ${number(KCAL_TOLERANCE)} kcal van je doel.`,
      },
      {
        level: "choice",
        text: "Eiwit halen weegt zwaarder dan precies op je calorieën uitkomen.",
      },
    ],
    why: "Door alleen eiwit, rijst of pasta en een beetje olie te veranderen, smaakt het gerecht zoals bedoeld. Een grote portie krijgt niet ineens veel meer saus, en een kleine portie houdt genoeg groente.",
    limits: [
      "Soms past je doel niet binnen de grenzen van een recept. Dan zie je een waarschuwing en de dichtstbijzijnde combinatie.",
      `De recepten zijn eenmalig afgesteld op ongeveer ${number(DEFAULT_MEAL_CALORIES)} kcal en ${number(DEFAULT_MEAL_PROTEIN)} g eiwit per portie. Bij een heel ander doel past een ander recept misschien beter.`,
    ],
  },
  {
    id: "nutrition",
    title: "Voedingswaarden: rauw, droog, uitgelekt",
    how: [
      "De voedingswaarden van een portie zijn de som van alle ingrediënten: gewicht × waarde per 100 gram.",
      "Rijst en pasta rekenen we droog, vlees rauw, bonen en tonijn uitgelekt. Je weegt dus vóór het koken.",
      "Tussenstappen rekenen we nauwkeurig; alleen op het scherm ronden we af.",
    ],
    assumptions: [
      {
        level: "rule-of-thumb",
        text: "De standaardwaarden per 100 gram zijn representatieve supermarktwaarden. Je kunt ze vervangen door die van je eigen etiket.",
      },
      {
        level: "choice",
        text: "We rekenen nooit met het gewicht van gekookte rijst of pasta.",
      },
    ],
    why: "Gekookte rijst en pasta nemen wisselend water op, afhankelijk van pan, kooktijd en merk. Het droge gewicht staat vast en past bij de waarden op de verpakking. Zo blijft je telling kloppen, hoe je ook kookt.",
    limits: [
      "Merken verschillen. Wijkt jouw product af, pas de waarden dan aan bij Ingrediënten.",
      "Olie die in de pan achterblijft, tellen we gewoon mee. De echte waarde van je portie kan dus iets lager zijn.",
    ],
  },
  {
    id: "shopping",
    title: "Boodschappen",
    how: [
      "De lijst telt per ingrediënt de hoeveelheden van alle recepten in je batch bij elkaar op.",
      "Heeft een ingrediënt een verpakkingsgrootte, dan rondt de app het aantal verpakkingen naar boven af.",
      "Een vinkje hoort bij een hoeveelheid. Verandert die hoeveelheid, dan vervalt het vinkje.",
    ],
    assumptions: [
      {
        level: "choice",
        text: "Altijd naar boven afronden op hele verpakkingen.",
      },
      {
        level: "rule-of-thumb",
        text: "Verpakkingsgroottes zijn gangbare maten; jouw winkel kan andere hebben.",
      },
    ],
    why: "Eén lijst voor de hele batch voorkomt dubbel kopen. Door het vervallende vinkje denk je niet dat je genoeg hebt als je batch intussen is gegroeid.",
    limits: [
      "Ook wat je al in huis hebt, zoals olie en kruiden, staat op de lijst. Vink af wat je al hebt.",
    ],
  },
  {
    id: "cooking",
    title: "Kookplan en opbrengst",
    how: [
      "Het kookplan begint met gedeeld snijwerk en sausbases. Daarna volgen eiwit- en graanrondes, eigen afwerking, verdelen en koelen. Pitten, ovens, porties per pan en gewichtscapaciteit begrenzen iedere ronde.",
      "Rijst en eiwit worden binnen productierondes gedeeld. Maximaal twee rondes zijn tegelijk in bewerking. Apparaten kunnen parallel werken; start, laatste afwerking en portioneren reserveren aandacht voor één kok. Koel gare onderdelen direct.",
      "Bij ‘Opbrengst invoeren’ weeg je per kookronde het bereide eiwit, de rijst/pasta of een gemengde bereiding. Verdeling gebeurt naar de oorspronkelijke rauwe, droge of uitgelekte verhouding. Een hele-componentmeting geldt alleen als je alle deelrondes fysiek samenvoegt.",
    ],
    formulas: [
      "Bereid per bakje = gemeten rondeopbrengst × (grondstofgewicht voor het recept ÷ grondstofgewicht van de ronde) ÷ aantal porties",
    ],
    assumptions: [
      {
        level: "rule-of-thumb",
        text: "De tijden per stap zijn schattingen, geen metingen.",
      },
      {
        level: "choice",
        text: `Eigen geïntegreerde ovenbereidingen krijgen zonder oven ${percent(OVEN_FALLBACK_TIME_FACTOR - 1)} extra tijd. Neutrale eiwitcomponenten gebruiken afzonderlijke pan- en oventijden.`,
      },
      {
        level: "rule-of-thumb",
        text: "Koel bereid eten snel af in ondiepe bakjes en zet het binnen 2 uur in de koelkast of vriezer.",
      },
      {
        level: "evidence",
        text: "Bewaar bereid eten maximaal 2 dagen in de koelkast; in de vriezer blijft het zeker 3 maanden goed.",
        sources: [SOURCES.mealPrep],
      },
    ],
    why: "Gedeelde bereidingen beperken herhaald werk. Begrensde rondes voorkomen dat alle rijst of kip uren op afwerking wacht. Wegen per ronde maakt de eerste bakjes verdeelbaar voordat de laatste ronde klaar is.",
    limits: [
      "Tijden zijn niet in een echte keuken gekalibreerd. Roeren, gaarheid en temperatuur controleren blijven jouw verantwoordelijkheid. Koel- en vriescapaciteit worden niet doorgerekend; een grote batch kan twee kookdagen vragen.",
      "De opbrengst verandert de voedingswaarden niet: die blijven gebaseerd op rauwe, droge en uitgelekte grondstoffen. Verander je hoeveelheden of receptverdeling, dan vervalt de oude meting.",
    ],
  },
  {
    id: "optimizer",
    title: "Slim combineren en variatie",
    how: [
      "Selecteer kandidaat-recepten en stel maaltijden, recepten, porties en voedingsdoelen in. De optimizer controleert eerst uitgesloten ingrediënten, verplichte recepten en voedingshaalbaarheid.",
      "Het voorstel beoordeelt gedeelde sausbases, aromaten, eiwitbereiding, koolhydraten en snijwerk. Efficiëntie en variatie blijven twee aparte scores. De gekozen modus bepaalt hun gewicht; Aziatisch, peulvruchten en favorieten geven een voorkeur.",
      "Slim combineren toont hoeveel je gezamenlijk voorbereidt en naar welke recepten het gaat. Het voorstel vervangt je batch pas wanneer je het toepast.",
    ],
    assumptions: [
      {
        level: "choice",
        text: "Scores en voorkeurgewichten zijn ontwerpkeuzes, geen gemeten minuten tijdwinst. Standaard liggen de gewichten voor efficiëntie en variatie op 60/40.",
      },
      {
        level: "choice",
        text: "Gelijke basisverhoudingen kunnen samen; eigen kruiden en afwerkingen blijven apart. Voorraadkastkruiden tellen niet als belangrijke ingrediëntoverlap.",
      },
      {
        level: "rule-of-thumb",
        text: "Vriezer- en magnetronscores zijn redactionele inschattingen. Ze zijn nog niet door proefbatches gevalideerd.",
      },
    ],
    why: "Tien losse lekkere recepten zijn niet vanzelf een handige kookdag. Samenhang in de voorbereiding scheelt herhaling, terwijl afzonderlijke afwerkingen verschillende smaken behouden.",
    limits: [
      "De zoekmethode probeert meerdere startpunten en verbeterende wissels. Ze garandeert geen globaal optimum; een mislukte zoekactie bewijst niet dat iedere mogelijke combinatie onmogelijk is.",
      "Apparatuur bepaalt de uiteindelijke kookplanning. Receptselectie gebruikt een eenvoudige werkmaat, geen volledige simulatie van iedere mogelijke keukenplanning.",
    ],
  },
  {
    id: "kitchen",
    title: "Keukenspullen en veilig eten",
    how: [
      "De lijst met keukenspullen bevat wat je nodig hebt om een batch veilig en nauwkeurig te maken. De spullen met ‘Basis’ zijn genoeg om te beginnen.",
      "Meet vóór je iets koopt je oven, spoelbak, koelkast, aanrecht en vriezer. Die bepalen welke maten passen.",
    ],
    assumptions: [
      {
        level: "evidence",
        text: "Verhit een maaltijd uit de koelkast of vriezer tot hij stomend heet is.",
        sources: [SOURCES.mealPrep],
      },
      {
        level: "rule-of-thumb",
        text: "Met een kernthermometer: minstens 75 °C in het midden van de portie.",
      },
      {
        level: "choice",
        text: "De basisset: kernthermometer, weegschaal, snijplanken in drie kleuren, platte RVS-bakken, maaltijdbakjes, tape met marker en pannen.",
      },
    ],
    why: "Een batch staat of valt met snel afkoelen en precies wegen. Platte RVS-bakken koelen sneller af dan diepe pannen of plastic, de thermometer maakt temperatuur controleerbaar en de weegschaal laat je porties kloppen.",
    limits: [
      "De lijst gaat uit van een gewone thuiskeuken met oven en pitten. Heb je weinig ruimte, dan is extra werk- en koeloppervlak belangrijker dan meer bakken.",
    ],
  },
  {
    id: "storage",
    title: "Opslag en privacy",
    how: [
      "Alles wat je invult, blijft in deze browser op dit apparaat. Er is geen account, geen server en geen tracking.",
      "Een back-up is een bestand dat je zelf bewaart. Bij terugzetten controleert de app elk veld voordat er iets wordt vervangen.",
    ],
    assumptions: [
      {
        level: "choice",
        text: "Alleen lokale opslag, zonder cloud.",
      },
      {
        level: "choice",
        text: "Je gebruikt de app in één tabblad tegelijk.",
      },
    ],
    why: "Je gezondheidsgegevens zijn persoonlijk. Wat nergens naartoe wordt gestuurd, kan ook niet via een server uitlekken.",
    limits: [
      "Wis je je browsergegevens of wissel je van browser, dan zijn je gegevens weg. Maak regelmatig een back-up via Instellingen.",
      "Twee tabbladen tegelijk kunnen elkaars wijzigingen overschrijven.",
    ],
  },
];
