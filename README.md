# CGI ENIT — Plateforme du Club Génie Industriel

Plateforme officielle du **Club Génie Industriel de l'ENIT** (École Nationale d'Ingénieurs de Tunis). 
Le projet comprend le site vitrine du club, un espace membre sécurisé et un terminal d'administration dédié (*Kinetic Forge*).

🔗 **Production** : [gi-enit.vercel.app](https://gi-enit.vercel.app)

---

## 🛠️ Stack Technique

- **Framework Frontend** : Next.js (App Router)
- **Langage** : TypeScript
- **Backend-as-a-Service (BaaS)** : Supabase (PostgreSQL, Row Level Security, Auth, SSR Cookies)
- **Design System Admin** : "Kinetic Forge" (Industrial Tech Edge — Fond sombre `#121414`, `#14213d`, accents ambre `#fca311`, polices monospacées)
- **Styling** : Vanilla CSS & Tailwind CSS
- **Iconographie** : Lucide React
- **Déploiement** : Vercel

---

## 📱 Cartographie des Pages et Espaces

| Route | Rôle & Description |
|---|---|
| `/` | **Page d'accueil publique** : Vitrine du club, présentation du bureau, événements, témoignages et footer. |
| `/login` | **Page de connexion** : Authentification sécurisée (l'inscription publique `/signup` a été supprimée). |
| `/invite/[token]` | **Page d'intégration sur invitation** : Formulaire sécurisé permettant à un membre invité de choisir son mot de passe et finaliser son profil. |
| `/admin` | **Terminal d'administration** : Interface complète réservée aux Admins (Invitations, Membres, KPIs et paramétrages). |
| `/dashboard` | **Espace Membre Actif** : Tableau de bord pour les membres du club. |
| `/bureau` | **Espace Membre du Bureau** : Interface dédiée aux membres de la direction du club. |

---

## ⚡ Fonctionnalités Clés Implémentées

### 🔐 1. Système d'Invitation Exclusive (Accès Sécurisé)
- **Flux sur invitation tokenisée** : Les comptes ne peuvent être créés que via des jetons d'invitation uniques (`UUID`).
- **Protection par RLS** : Sécurisation stricte au niveau de la base de données via les politiques Row Level Security de Supabase.

### 🛡️ 2. Terminal Admin (*Kinetic Forge Design*)
- **Gestion des Invitations** :
  - Envoi d'invitations avec attribution du rôle (*Active Member* ou *Board Member*) et durée de validité (3, 7 ou 14 jours).
  - Bouton **`LINK`** : Copie instantanée du lien d'invitation unique dans le presse-papier pour envoi direct.
  - Suivi des statuts (*Accepted*, *Pending*, *Expired*, *Cancelled*).
  - Réexpédition, annulation et suppression définitive des invitations inactives des archives.
- **Gestion des Membres** :
  - Recherche dynamique en temps réel par nom, email ou rôle.
  - Modification instantanée du rôle d'un membre (*Membre Actif*, *Membre Bureau*, *Admin*).
  - Suppression de membre avec modale de confirmation.
- **UI / UX** :
  - Cartes KPI avec jauges de progression mécaniques.
  - Système de notifications Toast et modales de confirmation réutilisables.

---

## 🗄️ Structure de la Base de Données (Supabase)

La base de données repose sur 2 tables principales avec Row Level Security (RLS) :

1. **`public.profiles`** :
   - `id` (UUID, clé primaire liée à `auth.users`)
   - `email` (TEXT)
   - `first_name` & `last_name` (TEXT)
   - `role` (`'admin'`, `'membre_bureau'`, `'membre_actif'`)
   - `created_at` (TIMESTAMPTZ)

2. **`public.invitations`** :
   - `id` (UUID, clé primaire)
   - `email` (TEXT)
   - `role` (`'membre_bureau'`, `'membre_actif'`)
   - `token` (UUID unique)
   - `status` (`'pending'`, `'accepted'`, `'expired'`, `'cancelled'`)
   - `expires_at` & `created_at` (TIMESTAMPTZ)
   - `created_by` (UUID)

---

## 📁 Architecture des Fichiers

```
├── app/
│   ├── (auth)/login/       → Connexion
│   ├── admin/              → Terminal Administrateur (Kinetic Forge)
│   ├── api/admin/invite/   → Route API serveur pour la création d'invitations
│   ├── bureau/             → Espace Membre du Bureau
│   ├── dashboard/          → Espace Membre Actif
│   ├── invite/[token]/     → Inscription sécurisée par jeton
│   └── page.tsx            → Page d'accueil officielle
├── components/
│   ├── Navbar.tsx          → Barre de navigation principale
│   ├── Footer.tsx          → Pied de page
│   └── ui/                 → Composants UI (Toast, ConfirmModal, BottomNav, RoleBadge, Sidebar, DataTable)
├── lib/
│   └── supabase/           → Client navigateur (client.ts) et serveur SSR (server.ts)
├── supabase_setup.sql      → Script SQL d'initialisation et politiques RLS
└── README.md               → Documentation du projet
```

---

## 🔑 Configuration de l'Environnement (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique

# Optionnel (pour envoi automatique via Supabase Auth Admin)
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_secrete
```

---

## 🧑‍💻 Déploiement et Démarrage Local

1. **Cloner et installer les dépendances**
   ```bash
   git clone https://github.com/khalilvrx45-arch/GI-ENIT.git
   cd GI-ENIT
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Accès local : [http://localhost:3000](http://localhost:3000)

3. **Mettre à jour le schéma Supabase**
   ```bash
   npx supabase@latest db push
   ```

---

## 🌳 Workflow Git

- **`main`** : Branche de **production** (déploiement automatique sur Vercel).
- **`dev`** : Branche principale de **développement**.

---

## 📬 Contact

Projet développé pour le **Club Génie Industriel — ENIT**.
