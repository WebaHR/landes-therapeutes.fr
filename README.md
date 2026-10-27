# landes-therapeutes.fr — Annuaire des praticiens bien-être

Annuaire praticien moderne en **Next.js 15** avec géolocalisation, validation SIREN, avis Google et dashboards pro + admin.

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm** ou **yarn**

### Installation

```bash
# 1. Ouvrir le dossier dans VS Code
code annuaire-pro

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditez .env selon vos besoins (les valeurs par défaut fonctionnent en dev)

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push

# 5. Créer les données de démo (admin + 1 praticien exemple)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
# OU avec tsx:
npx tsx prisma/seed.ts

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 🔑 Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@landes-therapeutes.fr | Admin1234! |
| **Pro démo** | demo@landes-therapeutes.fr | Demo1234! |

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── annuaire/page.tsx     # Annuaire avec recherche + carte
│   ├── profil/[id]/page.tsx  # Fiche praticien
│   ├── inscription/page.tsx  # Formulaire d'inscription
│   ├── connexion/page.tsx    # Page de connexion
│   ├── dashboard/page.tsx    # Dashboard praticien
│   ├── admin/page.tsx        # Dashboard administrateur
│   └── api/
│       ├── siren/[siren]/    # Vérification SIREN
│       ├── inscription/      # Création de compte
│       ├── auth/             # Login / Logout
│       ├── dashboard/        # Mise à jour fiche & horaires
│       └── admin/            # Gestion admin
├── components/
│   ├── ui/                   # Navbar, Footer, Cards, Stars
│   ├── forms/                # InscriptionForm (multi-étapes)
│   ├── map/                  # MapView (Leaflet)
│   └── dashboard/            # DashboardContent, AdminDashboard, EditProForm
├── lib/
│   ├── auth.ts               # Session, bcrypt
│   ├── prisma.ts             # Client Prisma
│   ├── siren.ts              # Vérification SIREN (INSEE + fallback)
│   └── utils.ts              # Utilitaires
└── types/index.ts            # Types TypeScript
```

---

## ✨ Fonctionnalités

### Landing page
- Hero avec barre de recherche (métier + ville)
- Navigation par catégories avec icônes
- Praticiens en vedette
- Statistiques dynamiques
- CTA inscription praticiens

### Annuaire
- Recherche full-text par nom, ville, catégorie
- Filtres par statut, tri (pertinence, note, nouveauté)
- Vue liste et **vue carte** (OpenStreetMap/Leaflet)
- Pagination

### Fiche praticien
- Bannière + logo avec overlay
- Badge SIREN vérifié
- Coordonnées cliquables (tel, email, web)
- Horaires d'ouverture
- Avis Google avec notation par étoiles

### Inscription praticienle (4 étapes)
1. **Identité** : SIREN (vérification automatique INSEE), nom, catégorie, compte
2. **Localisation** : adresse, ville, téléphone, email public
3. **Médias** : import logo (drag & drop) + bannière
4. **Confirmation** : récapitulatif + CGU

### Dashboard praticien
- Vue d'ensemble : infos, derniers avis, stats
- Modifier sa fiche (tous les champs + upload médias)
- Gérer ses horaires (par jour, ouvert/fermé, plages)
- Consulter ses avis

### Dashboard admin
- Statistiques globales (users, pros, actifs, avis)
- File des inscriptions **en attente** → Approuver / Rejeter
- Tableau de tous les praticiens avec filtre/recherche
- Actions : activer, suspendre, mettre en vedette ⭐, supprimer

---

## 🔧 Configuration

### Variables d'environnement (`.env`)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"

# Optionnel — API SIREN INSEE (fallback automatique sans clé)
SIRENE_API_KEY=""

# Optionnel — Google Places (avis Google)
GOOGLE_PLACES_API_KEY=""
```

### Vérification SIREN
Fonctionne **sans clé API** grâce au fallback sur `recherche-entreprises.api.gouv.fr` (open data).
Pour une utilisation en production, obtenez une clé INSEE SIRENE.

### Upload d'images
En développement : les images sont stockées dans `public/uploads/`.
En production : configurez un service de stockage (Cloudinary, AWS S3, etc.) et modifiez `src/app/api/inscription/route.ts`.

### Base de données
SQLite en développement (zero-config). Pour la production, modifiez `DATABASE_URL` vers PostgreSQL ou MySQL dans `prisma/schema.prisma`.

---

## 🛠️ Scripts disponibles

```bash
npm run dev          # Serveur de développement (http://localhost:3000)
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint

npx prisma studio    # Interface visuelle base de données
npx prisma db push   # Appliquer le schéma (dev)
npx prisma migrate dev --name init  # Migration (prod)
```

---

## 🎨 Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Styles | Tailwind CSS 3 |
| Base de données | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Auth | Sessions custom (bcryptjs + cookies httpOnly) |
| Cartes | Leaflet + OpenStreetMap |
| Upload | react-dropzone |
| Formulaires | react-hook-form + Zod |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| SIREN | API data.gouv.fr (sans clé requise) |

---

## 📱 Responsive
Entièrement responsive — mobile first.

## 🔒 Sécurité
- Mots de passe hashés avec bcrypt (12 rounds)
- Sessions httpOnly (non accessible JavaScript)
- Routes admin protégées côté serveur
- Validation des données avec Zod

---

Fait avec ❤️ en France 🇫🇷
