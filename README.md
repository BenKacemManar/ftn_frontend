# Athletix Governance — Frontend

Interface web de la plateforme numérique fédérale **Athletix Governance**, développée pour la **Fédération Tunisienne de Natation (FTN)** dans le cadre du module **Pi-DEV — Mission Entreprise** (Classes 1ALINFO / 3ALSLEAM, année universitaire 2025-2026).

Habillage visuel « Espérance · 1919 · Section Natation » (thème Sang & Or). Le backend associé se trouve dans le dépôt **ftn-backend**.

## Stack technique

| Composant | Technologie |
|---|---|
| Framework | Angular 17 (modules NgModule, signaux réactifs, control flow `@if` / `@for`) |
| Style | Tailwind CSS 3.4 |
| Icônes | lucide-angular |
| HTTP / réactivité | RxJS |
| Internationalisation | Service i18n interne (FR / EN / AR, support RTL complet) |

## Fonctionnalités principales

- **Espace public** : accueil, calendrier des compétitions, résultats, classements, actualités, fiches athlètes/clubs, forum
- **Espace authentifié** : profil, mes résultats, demande de licence, inscription aux compétitions
- **Espace administration** : back-office complet (athlètes, clubs, compétitions, résultats, piscines, programmes, actualités, forum, staff)
- **Module Piscines** *(valeur ajoutée)* : carte des infrastructures affiliées, réservation de créneaux
- **Module Forum** *(valeur ajoutée)* : sujets, réponses, réactions emoji, pièces jointes image
- **Multilingue FR / EN / AR** : écran de sélection de langue à l'arrivée sur le site, bascule RTL automatique en arabe, traduction de l'intégralité de l'interface

## Prérequis

- Node.js 18+
- npm
- Le backend `ftn-backend` lancé sur `http://localhost:8080` (voir son README)

## Installation

```bash
npm install
```

## Configuration

L'URL de l'API backend est définie dans `src/environments/environment.ts` (développement) et `environment.prod.ts` (production) :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

Adapter `apiUrl` si le backend tourne sur une autre adresse/port.

## Lancement

```bash
npm start
```

L'application est servie sur `http://localhost:4200`.

## Build de production

```bash
npm run build
```

Le résultat est généré dans `dist/est-natation/`.

## Structure du projet

```
src/app/
├── core/                ← services transverses (API, auth, i18n)
│   └── i18n/             ← TranslationService, TranslatePipe, dictionnaires FR/EN/AR
├── shared/              ← composants réutilisables (nav, footer, pagination, modal, filtre…)
├── pages/home/          ← page d'accueil publique (hero, histoire, programmes, champions…)
└── modules/
    ├── auth/             ← connexion / inscription
    ├── athletes-clubs/   ← fiches athlètes et clubs
    ├── competitions/     ← calendrier et détail des compétitions
    ├── results/           ← résultats, classements, mes résultats
    ├── content/           ← actualités fédérales
    ├── pools/              ← piscines affiliées (valeur ajoutée)
    ├── forum/              ← forum communautaire (valeur ajoutée)
    └── admin/              ← back-office (tableau de bord + CRUD de tous les modules)
```

## Internationalisation (FR / EN / AR)

- Premier affichage : un écran plein écran propose de choisir Français / English / العربية.
- Le choix est mémorisé (`localStorage`) et applique automatiquement `dir="rtl"` sur tout le site lorsque l'arabe est sélectionné.
- La bascule de langue est accessible en permanence depuis la barre de navigation (`<app-language-switcher>`).
- Les textes sont stockés sous forme de clés (`{{ 'nav.home' | translate }}`) dans `src/app/core/i18n/locales/`, organisées par module (`nav.*`, `home.*`, `forum.*`, `admin.*`, etc.).

## Identifiants de démonstration

Voir le README du backend (`ftn-backend`) pour le compte administrateur de test (`admin@ftn.tn`).

## Auteurs

Projet académique — ESPRIT School of Engineering — Pi-DEV Mission Entreprise — Classes 1ALINFO / 3ALSLEAM — Année universitaire 2025-2026.
Contexte métier fourni par la Fédération Tunisienne de Natation (FTN).
