# Modifications — Déploiement Vercel API (3 mars 2026)

## Résumé

Migration du système de déploiement Docker/VPS vers **Vercel API**. Chaque projet client BookWise est maintenant déployé comme un projet Vercel indépendant. La configuration (couleurs, services, horaires) est lue depuis Supabase en temps réel — pas besoin de redéployer pour modifier la config.

---

## Fichiers modifiés

### `server/orchestrator.js` — Réécriture complète

**Avant** : lançait des conteneurs Docker, gérait Nginx, portait les configs dans des dossiers locaux.

**Après** : déploie sur Vercel via l'API REST.

Logique du endpoint `POST /deploy-client` :
1. Lit récursivement tous les fichiers du dossier `template/`
2. Injecte `src/config/config.json` avec la config du client
3. Injecte un fichier `.env` avec `VITE_CLIENT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (nécessaire pour que Vite embarque les vars au build time)
4. Upload les fichiers en base64 vers `POST https://api.vercel.com/v13/deployments`
5. Poll `GET /v13/deployments/{id}` jusqu'à l'état `READY`
6. Stocke le statut en mémoire (`Map`) exposé via `GET /deployment-status/:clientId`

> **Note architecture** : l'orchestrateur utilise la clé anon Supabase (bloquée par RLS pour les writes). C'est le **frontend** qui met à jour Supabase quand le polling détecte `deployed`.

Nouveaux endpoints :
- `GET /deployment-status/:clientId` — statut en mémoire (pour polling frontend)
- `GET /client/:clientId/status` — lecture Supabase

---

### `src/hooks/useConfig.ts` — Fetch Supabase par `VITE_CLIENT_ID`

Ajout d'une source de config prioritaire :

```
Priorité 1 : VITE_CLIENT_ID (env var) → fetch clients.config_url dans Supabase
Priorité 2 : localStorage.preview_config → mode aperçu BookWise admin
Priorité 3 : config.json statique → fallback
```

Permet au site déployé sur Vercel de lire sa config depuis Supabase au chargement — sans redéploiement pour les modifications.

---

### `src/components/DeploymentManager.tsx` — Refonte UI + logique

**Retiré** : références Docker, `container_port`, Edge Function Supabase.

**Ajouté** :
- Prop `existingClientId` : si le projet est déjà sauvegardé, réutilise l'ID sans créer un doublon
- `useEffect` au montage : charge le statut existant depuis Supabase (`status`, `deployment_url`)
- Appel direct à `http://localhost:4001/deploy-client` (orchestrateur local)
- **Polling actif** toutes les 5s sur `GET /deployment-status/:clientId`
- **Mise à jour Supabase depuis le frontend** quand deployed (contourne la RLS)
- Gestion des états bloqués : bouton "Redéployer" si `status=deploying` sans activité
- URL stable du projet (`bookwise-{slug}-{clientId8}.vercel.app`) stockée, pas l'URL de déploiement spécifique

---

### `src/pages/SiteCreator.tsx` — Onglets Créateur / Déploiement

Ajout de deux onglets :

| Onglet | Contenu |
|--------|---------|
| **Créateur** | Chat IA + panneau config (inchangé) |
| **Déploiement** | `DeploymentManager` en pleine largeur, avec statut, logs, URL publique |

Le point bleu sur l'onglet Déploiement s'allume dès qu'un `currentProjectId` existe.
Avertissement affiché si le projet n'est pas encore sauvegardé avant de déployer.

---

### `template/` — Nouveau dossier (site client standalone)

Projet Vite + React autonome uploadé sur Vercel à chaque déploiement client.

```
template/
├── vercel.json              ← Rewrites SPA (/* → /index.html)
├── package.json             ← Dépendances sans server/lovable-tagger
├── vite.config.ts           ← Sans componentTagger
├── src/
│   ├── App.tsx              ← Routes booking : /, /auth, /bookings, /admin
│   ├── hooks/useConfig.ts   ← Version avec fetch VITE_CLIENT_ID → Supabase
│   └── pages/               ← Index, Auth, ClientBookings, AdminDashboard
```

**Exclu du template** : SiteCreator, ProjectsDashboard, CreatorLanding, DeploymentManager, AICodeModifier, server/, scripts/

---

### `.env` — Nouvelles variables

```env
VERCEL_TOKEN=              # Token API Vercel (vercel.com/account/settings/tokens)
VERCEL_TEAM_ID=            # ID de la team Vercel
ORCHESTRATOR_PORT=4001     # Port de l'orchestrateur Express
VITE_ORCHESTRATOR_URL=http://localhost:4001
```

---

## Flux de déploiement complet

```
1. Utilisateur clique "Déployer sur Vercel" (onglet Déploiement)
2. Frontend insère/met à jour le client dans Supabase (status='pending')
3. Frontend appelle POST localhost:4001/deploy-client
4. Orchestrateur lit template/ (~50 fichiers)
5. Orchestrateur injecte .env + config.json personnalisés
6. Orchestrateur upload vers api.vercel.com/v13/deployments
7. Vercel build npm install + vite build (~1-2 min)
8. Orchestrateur poll Vercel → stocke 'deployed' en mémoire
9. Frontend poll /deployment-status/:clientId toutes les 5s
10. Frontend détecte 'deployed' → met à jour Supabase + affiche URL
```

## Lancer en développement

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Orchestrateur (avec les env vars)
node --env-file=.env server/orchestrator.js
```

Ou en une commande (sans env file pour l'orchestrateur) :
```bash
npm run dev:all
```

> Pour que l'orchestrateur charge les variables `.env`, utiliser `node --env-file=.env server/orchestrator.js` directement.
