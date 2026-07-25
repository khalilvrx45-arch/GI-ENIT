# CGI ENIT — Site Web du Club Génie Industriel

Plateforme officielle et site web du Club Génie Industriel de l'ENIT.

🔗 **Production** : [gi-enit.vercel.app](https://gi-enit.vercel.app)

## 🚀 Stack technique

- **Framework** : Next.js (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Déploiement** : Vercel

## 🧑‍💻 Installation en local

1. **Cloner le repo**
   ```bash
   git clone https://github.com/khalilvrx45-arch/GI-ENIT.git
   cd GI-ENIT
   ```

2. **Se placer sur la branche `dev`** (c'est ici que tout le monde travaille)
   ```bash
   git checkout dev
   git pull origin dev
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Le site est accessible sur [http://localhost:3000](http://localhost:3000)

## 🌳 Workflow Git — IMPORTANT, à lire avant de contribuer

On travaille avec deux branches principales :

| Branche | Rôle |
|---|---|
| `main` | Branche de **production**. Toujours stable, déployée automatiquement sur [gi-enit.vercel.app](https://gi-enit.vercel.app). **Ne jamais push directement dessus.** |
| `dev` | Branche de **développement**. Tout le monde travaille ici (ou sur des sous-branches créées à partir de `dev`). |

### Processus pour contribuer

1. **Toujours partir de `dev` à jour**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. *(Optionnel mais recommandé)* Créer une sous-branche pour ta fonctionnalité
   ```bash
   git checkout -b feature/nom-de-ta-feature
   ```

3. **Coder, commit, push**
   ```bash
   git add .
   git commit -m "feat: description claire de ce que tu as fait"
   git push origin dev
   ```
   *(ou `git push origin feature/nom-de-ta-feature` si tu as créé une sous-branche)*

4. **Tester sur le lien de preview**
   Chaque push déclenche un déploiement automatique sur Vercel (preview). Le lien est visible :
   - Dans l'onglet **Deployments** du repo GitHub
   - Ou en commentaire automatique de Vercel si tu as ouvert une Pull Request

5. **Ouvrir une Pull Request vers `main`** quand `dev` est stable et prêt à être mis en ligne
   - Va sur GitHub → Pull Requests → New Pull Request → base: `main` ← compare: `dev`
   - Attends que le check Vercel passe au vert
   - Fais relire/approuver par un autre membre si possible
   - Merge → `main` est automatiquement redéployé en production

### Règles à respecter

- ❌ Ne jamais push directement sur `main`
- ✅ Toujours passer par une Pull Request pour merger dans `main`
- ✅ Tester sur le lien de preview avant de merger
- ✅ Des messages de commit clairs (`feat:`, `fix:`, `refactor:`, `docs:`...)

## 📁 Structure du projet

```
app/           → Pages et routes (App Router Next.js)
components/    → Composants réutilisables
public/        → Assets statiques (images, logos...)
```

## 🤝 Contribuer

1. Récupère la branche `dev`
2. Suis le workflow décrit ci-dessus
3. En cas de doute, demande avant de push sur `dev` directement — préfère une sous-branche + PR vers `dev` si le changement est gros

## 📬 Contact

Pour toute question, contacte l'équipe technique du Club Génie Industriel — ENIT.
