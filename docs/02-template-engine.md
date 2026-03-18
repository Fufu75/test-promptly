# Moteur de Templates — Système de Blocs

## Concept

Le moteur de templates est le cœur technique le plus original du projet. Chaque page générée est composée d'une liste de **blocs** (Header, Hero, Features…), chacun disponible en plusieurs **variants** visuels. L'IA sélectionne les variants selon le contexte métier et l'ambiance souhaitée. Le rendu est assuré par `PageRenderer`, qui hydrate dynamiquement les bons composants React.

## Architecture

```
config/libraries/        ← Contrats JSON lus par l'IA
    homepage.json        → 8 types × 3 variants = 24 combinaisons homepage
    auth.json            → 1 type × 3 variants
    booking.json         → 3 types × 2-3 variants = 8 combinaisons booking

config/pages/            ← Configurations par défaut
    homepage-config.json → 8 blocs pré-configurés (exemple "Studio Zen")
    auth-config.json     → 1 bloc auth par défaut
    booking-config.json  → 3 blocs booking par défaut

components/blocks/       ← 37 composants React
    homepage/            → 26 fichiers (Header, Hero, Features…)
    auth/                → 3 fichiers
    booking/             → 8 fichiers

components/PageRenderer.tsx  ← Moteur de rendu dynamique
```

## Les bibliothèques JSON

Chaque bibliothèque décrit les blocs disponibles avec leurs props, leur layout et leurs **`mood[]`** — des mots-clés d'ambiance qui guident l'IA dans sa sélection.

### homepage.json — 8 blocs, 3 variants chacun

| Bloc | Variants disponibles | Props principales |
|------|---------------------|-------------------|
| **Header** | `centered-icon`, `left-accent`, `centered-bordered` | brandName, accentColor, logoUrl? |
| **Hero** | `centered-badge`, `split-image`, `centered-decorated` | title, description, accentColor, backgroundImage?, sideImage? |
| **Features** | `cards-grid`, `list-vertical`, `circles-centered` | features[], accentColor, sectionTitle? |
| **Services** | `cards-hover`, `list-compact`, `cards-bordered` | services[], accentColor, sectionTitle? |
| **OpeningHours** | `grid-cards`, `list-simple`, `list-dotted` | openingHours, accentColor |
| **Contact** | `cards-icons`, `list-inline`, `circles-row` | contact, accentColor |
| **FooterCTA** | `banner-gradient`, `inline-bordered`, `box-decorated` | title, ctaText, accentColor |
| **Footer** | `split-brand`, `centered-simple`, `centered-decorated` | brandName, accentColor |

Chaque variant inclut dans le JSON :
- `layout` : description de la structure
- `visualTraits` : caractéristiques visuelles (ombres, bordures, icônes…)
- `spacing` : alignement et espacement
- `mood[]` : 3 à 5 mots décrivant l'atmosphère (ex: `["moderne", "épuré", "professionnel"]`)

### auth.json — 1 type, 3 variants

| Variant | Description |
|---------|-------------|
| `centered-card` | Formulaire centré dans une card avec gradient |
| `split-image` | 2 colonnes : formulaire gauche, image décorative droite |
| `minimal` | Formulaire simple centré, très épuré |

Props : brandName, accentColor, tagline?, logoUrl?, backgroundImage?

### booking.json — 3 types, 2 à 3 variants

| Type | Variants | Props runtime |
|------|----------|---------------|
| **ServiceSelector** | `cards-grid`, `list-compact`, `pills-horizontal` | services[], onSelect() |
| **TimePicker** | `week-grid`, `calendar-sidebar` | selectedService, onSlotSelect() |
| **BookingList** | `cards-stack`, `timeline-vertical`, `table-compact` | bookings[], onCancel() |

Les props runtime sont **injectées automatiquement** par `PageRenderer` — l'IA ne les gère pas.

## PageRenderer (`src/components/PageRenderer.tsx`)

### Registre central

`BLOCK_REGISTRY` mappe chaque `type` de bloc vers ses variants React :

```typescript
const BLOCK_REGISTRY: Record<string, Record<string, React.ComponentType<any>>> = {
  Header: {
    'centered-icon': HeaderCenteredIcon,
    'left-accent': HeaderLeftAccent,
    'centered-bordered': HeaderCenteredBordered,
  },
  Hero: {
    'centered-badge': HeroCenteredBadge,
    'split-image': HeroSplitImage,
    'centered-decorated': HeroCenteredDecorated,
  },
  // ... 10 autres types
};
```

### Interface PageBlock

```typescript
interface PageBlock {
  type: string;       // "Header", "Hero", "Services"…
  variant: string;    // "centered-icon", "cards-grid"…
  props: Record<string, any>;   // Props statiques passées par l'IA
  _comment?: string;  // Annotation optionnelle
}
```

### Mécanisme de rendu

Pour chaque bloc de la liste :

1. **Résolution du composant** : `BLOCK_REGISTRY[block.type][block.variant]`
2. **Fallback automatique** : si le variant est invalide (ex: IA hallucine `"cards-hover"` au lieu de `"cards-grid"`), le premier variant disponible est utilisé avec un `console.warn`
3. **Injection props runtime** : `getRuntimeProps(block.type)` ajoute les données dynamiques (services réels, horaires, callbacks) selon le type de bloc
4. **Override global** : `getConfigOverrides(block.type, config)` pousse les valeurs globales (accentColor, brandName, services) dans les props du composant

```typescript
// Rendu d'un bloc
let Component = variants[block.variant];
if (!Component) {
  const firstKey = Object.keys(variants)[0];
  console.warn(`[PageRenderer] Variant "${block.variant}" introuvable, fallback sur "${firstKey}"`);
  Component = variants[firstKey];
}

const runtimeProps = getRuntimeProps(block.type);
const configOverrides = getConfigOverrides(block.type, config);
const finalProps = { ...block.props, ...configOverrides, ...runtimeProps };

return <Component key={index} {...finalProps} />;
```

### GlobalConfigOverride

Props globales poussées dans les composants qui les acceptent :

```typescript
interface GlobalConfigOverride {
  brandName?: string;
  businessSector?: string;
  accentColor?: string;
  services?: Service[];
  openingHours?: Record<string, string>;
  contact?: { email?: string; phone?: string; address?: string };
}
```

### Props runtime pour le booking

Les blocs booking reçoivent des données simulées en preview (mock data) et des données réelles en production :

```typescript
// Mock data pour preview
const MOCK_SERVICES = [
  { id: '1', name: 'Prestation A', duration: 60, price: 50, enabled: true },
  { id: '2', name: 'Prestation B', duration: 30, price: 30, enabled: true },
];
```

## Composants React — Structure des blocs

Chaque bloc suit la même convention :

```
components/blocks/homepage/Services/
    CardsHover.tsx      → export ServicesCardsHover
    ListCompact.tsx     → export ServicesListCompact
    CardsBordered.tsx   → export ServicesCardsBordered
    index.ts            → { 'cards-hover': ServicesCardsHover, ... }
```

Chaque composant reçoit ses props typées et utilise `accentColor` (la couleur primaire du site) pour les éléments de mise en valeur — jamais de couleur hardcodée.

## Validation des variants par l'IA

Avant d'utiliser les blocs générés par l'IA, `openaiService.ts` construit un registre de validation :

```typescript
// Map construite depuis les 3 library JSON au chargement du module
const VALID_VARIANTS: Record<string, Set<string>> = buildValidVariantsMap();

const fixVariant = (blockType: string, variant: string): string => {
  const valid = VALID_VARIANTS[blockType];
  if (!valid || valid.has(variant)) return variant;
  const first = Array.from(valid)[0];
  console.warn(`[AI] Variant "${variant}" invalide pour "${blockType}", corrigé en "${first}"`);
  return first;
};
```

Cette double sécurité (validation en amont + fallback dans PageRenderer) garantit qu'un variant invalide ne bloque jamais le rendu.

## Configurations par défaut

### homepage-config.json

8 blocs pré-configurés avec des valeurs d'exemple ("Studio Zen") utilisées comme point de départ avant la première génération IA :

```json
[
  { "type": "Header",       "variant": "centered-icon",    "props": { "brandName": "Studio Zen", ... } },
  { "type": "Hero",         "variant": "centered-badge",   "props": { "title": "Votre bien-être...", ... } },
  { "type": "Features",     "variant": "cards-grid",       "props": { "features": [...] } },
  { "type": "Services",     "variant": "cards-hover",      "props": { ... } },
  { "type": "OpeningHours", "variant": "grid-cards",       "props": { ... } },
  { "type": "Contact",      "variant": "cards-icons",      "props": { ... } },
  { "type": "FooterCTA",    "variant": "banner-gradient",  "props": { ... } },
  { "type": "Footer",       "variant": "split-brand",      "props": { ... } }
]
```

### booking-config.json

3 blocs dans un ordre **immuable** (règle du system prompt) :
1. `ServiceSelector` — sélection du service
2. `TimePicker` — choix du créneau
3. `BookingList` — liste des réservations existantes
