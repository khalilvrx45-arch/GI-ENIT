# 🎨 Spécifications Techniques & Design System : Dashboard Admin (CGI ENIT)

Document de référence destiné à l'équipe **Frontend & Design UI/UX** pour la conception et l'évolution de l'espace d'administration du **Club Génie Industriel ENIT**.

---

## 1. 📐 Design System — "Industrial Tech Edge"

La charte graphique adopte une esthétique **Industrial Tech Edge** sombre, épurée et moderne.

### Color Palette (Tokens)
* **Background Application (`bg-app`)** : `#121414` (Noir profond mat)
* **Background Containers (`bg-card`)** : `#14213d` (Bleu marine industriel)
* **Background Inputs/Rows (`bg-surface`)** : `#1e2020` / `#1a1c1c` (Gris anthracite)
* **Accent Primordial (`accent-amber`)** : `#fca311` (Ambre industriel / Gold)
* **Accent Hover (`accent-hover`)** : `#ffc887` (Ambre clair)
* **Status Colors** :
  * Success / Accepté : `#4ade80` (Vert émeraude)
  * Pending / Attente : `#fca311` (Ambre)
  * Expired / Danger : `#ef4444` (Rouge vif)
  * Cancelled / Inactif : `#e2e2e2` avec opacité `0.4`

### Typographie
* **Font Family** : Inter / Outfit / Sans-Serif system.
* **Titres principaux** : Inter 700 / Extrabold 24px à 30px (`text-white`).
* **Sous-titres & Labels** : Inter 600 Uppercase 10px à 12px avec letter-spacing étendu.

---

## 2. 🏛️ Architecture du Layout (Responsive PC / Mobile)

### Desktop View (≥ 768px)
* **Topbar Header (Fixe en haut)** : Height `65px`, Background `#1e2020`, Border-bottom `#2a2c2c`.
* **Sidebar Gauche (Fixe)** : Width `240px`, Height `calc(100vh - 65px)`, Background `#1a1c1c`, Border-right `#2a2c2c`.
* **Zone de Contenu Principale** : Responsive padding (`32px` à `48px`), max-width `1280px` centré.

### Mobile View (< 768px)
* **Header compact** en haut.
* **Bottom Navigation Bar (Fixe en bas)** : Navigation horizontale compacte avec icônes et étiquettes.
* **Sidebar cachée**.

---

## 3. 🖥️ Description du Header Topbar

* **Côté Gauche** :
  * Logo du CGI ENIT (`/logo-cgi.jpg`) dans une vignette arrondie avec bordure ambre et ombre portante (`shadow-[0_0_10px_rgba(252,163,17,0.2)]`).
  * Titre : **CGI ENIT Admin** + Sous-titre *"Console de Gestion"*.
* **Côté Droit** :
  * Badge de Rôle : Pillule pleine ambre avec texte noir **ADMIN**.
  * Informations Administrateur : Nom complet + Adresse Email.
  * Avatar : Vignette d'initiales arrondie avec fond ambre à opacité réduite.

---

## 4. 🗂️ Menu de Navigation (Sidebar & BottomNav)

| Élément | Icône (Lucide) | Statut | Description |
| :--- | :--- | :--- | :--- |
| **Invitations** | `Mail` | **Actif par défaut** | Gestion des invitations et des liens d'accès envoyés |
| **Membres** | `Users` | **Actif** | Listing, modification des rôles et suppression de membres |
| **Contenu** | `FileText` | *Coming Soon* | Espace d'édition des actualités & projets du club |
| **Témoignages** | `MessageSquare` | *Coming Soon* | Modération des retours d'expérience |
| **Paramètres** | `Settings` | *Coming Soon* | Configuration globale de la plateforme |
| **Déconnexion** | `LogOut` | **Action** | Invalidation de la session Supabase → `/login` |

---

## 5. 📄 Spécifications des Sections / Vues

### SECTION 1 : Invitations (`/admin` → Tab 1)

#### 1. Formulaire "Nouvelle invitation"
* **Carte conteneur** : Fond bleu marine `#14213d`, bordure `#333535`, effet glow ambre au survol.
* **Input Email** : Champ texte pour saisir l'email de l'invité (`prenom.nom@enit.utm.tn`).
* **Dropdown Rôle** : Sélection entre `Membre Actif` et `Membre du Bureau`.
* **Dropdown Durée** : Choix de validité du lien (`3 jours`, `7 jours` [défaut], `14 jours`, `30 jours`).
* **Bouton d'envoi** : Bouton ambre massif `#fca311` avec feedback de chargement spinner (`Loader2`).

#### 2. Cartes d'Indicateurs (KPIs)
Trois vignettes résumant les statistiques en temps réel :
1. **Invitations acceptées** (Icône Check vert + Compteur).
2. **Invitations en attente** (Icône Horloge ambre + Compteur).
3. **Invitations expirées** (Icône Alerte rouge + Compteur).

#### 3. Tableau "Invitations envoyées"
* **Colonnes** : `Email` | `Rôle` | `Statut` | `Envoyée le` | `Expire le` | `Actions`
* **Badges de Statut** :
  * 🟡 **Pending** : Horloge ambre
  * 🟢 **Accepted** : Check vert
  * 🔴 **Expired** : Alerte rouge
  * ⚪ **Cancelled** : Icône Ban gris
* **Actions par ligne** :
  * Pour *Pending* / *Expired* : Bouton **"Renvoyer"** (génère un nouveau token et réinitialise la date d'expiration) + Bouton **"Annuler"** (désactive le lien immédiatement).

---

### SECTION 2 : Membres (`/admin` → Tab 2)

#### 1. Statistiques Globale
* Badges compteurs : *Total Membres*, *Membres Actifs*, *Membres du Bureau*, *Administrateurs*.

#### 2. Barre de Recherche
* Champ de recherche en temps réel filtrant la liste par prénom, nom ou adresse email.

#### 3. Tableau des Membres
* **Colonnes** : `Membre (Nom + Email)` | `Rôle actuel` | `Changer le rôle` | `Membre depuis` | `Actions`
* **Changement de Rôle inline** : Dropdown réactif permettant de passer un membre en *Membre Actif*, *Membre du Bureau*, ou *Administrateur*. Un modal de confirmation s'affiche avant d'appliquer le changement.
* **Suppression de Membre** : Bouton corbeille rouge déclenchant un modal de confirmation critique.

---

### SECTION 3 : Sections "Coming Soon" (Contenu, Témoignages, Paramètres)
* Carte centrale translucide en verre dépoli (`backdrop-blur-xl`).
* Icône ambre géante (64px) animée avec un effet de respiration/pulse (`framer-motion`).
* Message explicatif *"Cette fonctionnalité arrive bientôt"*.

---

### SECTION 4 : Vue Publique d'Invitation (`/invite/[token]`)
* Page publique autonome sur laquelle atterrit l'utilisateur invité via son lien unique.
* **Trois états visuels** :
  1. **Token Valide** : Formulaire de création de compte avec affichage du rôle qui lui est attribué, nom complet et mot de passe.
  2. **Token Expiré** : Message d'avertissement avec icône d'horloge ambre et invitation à contacter le bureau.
  3. **Token Invalide / Annulé** : Message d'erreur rouge.

---

## 6. 🧩 Composants UI Réutilisables

* `<RoleBadge role="..." size="sm|md" />` : Badge pillule stylisé selon le niveau d'accès.
* `<DataTable columns={...} data={...} />` : Tableau sombre réactif avec défilement horizontal mobile et bordures interactives au survol.
* `<ConfirmModal isOpen={...} title="..." message="..." variant="danger|warning" />` : Fenêtre modale avec arrière-plan sombre et flou artistique.
* `<Toast toasts={...} onDismiss={...} />` : Système de notifications flottantes en bas à droite de l'écran avec animations d'apparition/disparition.
