# 🎓 BookWise Generator v2.0 - Argumentaire Soutenance

**Date** : Lundi matin (10h45)  
**Équipe** : Gabin Fulcrand & Thomas Sena  
**Projet** : Générateur de sites de réservation automatisé par IA

---

## 📊 Structure de la Présentation (15 slides max)

### Slide 1 : Page de Titre
- **Titre** : BookWise Generator - Générateur de Sites de Réservation par IA
- **Sous-titre** : Architecture SaaS Multi-tenant avec Déploiement Automatisé
- **Équipe** : Gabin Fulcrand & Thomas Sena
- **Date** : Janvier 2026

---

### Slide 2 : Le Problème
**Contexte** : Créer un site de réservation professionnel prend 2-3 jours de développement manuel

**Points de douleur** :
- ⏱️ Temps de développement important
- 💰 Coût élevé pour les petites entreprises
- 🔧 Maintenance technique complexe
- 📱 Personnalisation limitée sans compétences techniques

**Chiffres** :
- Coût moyen d'un site custom : 2000-5000€
- Temps de développement : 3-7 jours
- Maintenance annuelle : 500-1000€

---

### Slide 3 : Notre Solution
**BookWise Generator** : Générateur automatisé de sites de réservation en < 2 minutes

**Proposition de valeur** :
- 🤖 **IA conversationnelle** : dialogue naturel pour configurer le site
- 🚀 **Déploiement automatique** : site en ligne en 30-60 secondes
- 🎨 **Modification de code** : l'IA peut modifier TSX/CSS directement
- 🔄 **Hot Reload** : changements instantanés sans downtime
- 💰 **0€/requête** : IA locale (Ollama) + VPS unique

**Temps total** : Questionnaire (2 min) + Chat IA (3 min) + Déploiement (1 min) = **< 6 minutes**

---

### Slide 4 : Architecture Globale

```
┌─────────────────┐
│  Frontend React │ ──┐
│  + Chat IA      │   │
└─────────────────┘   │
                      ▼
┌──────────────────────────────────┐
│  SUPABASE (Source of Truth)      │
│  - Tables (clients, admins, logs)│
│  - Storage (configs JSON)        │
│  - Edge Functions (triggers)     │
└──────────────────────────────────┘
                      │
                      ▼ Webhook
┌──────────────────────────────────┐
│  Backend Orchestrator (Express)  │
│  - Génération docker-compose     │
│  - Modification code par IA      │
│  - Lint → Build → Self-Correction│
└──────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────┐
│  VPS (Ubuntu + Docker)           │
│  🐳 Client 1 (port 3001)         │
│  🐳 Client 2 (port 3002)         │
│  🐳 Client N...                  │
│  🌐 Nginx Reverse Proxy          │
└──────────────────────────────────┘
```

---

### Slide 5 : Flow Utilisateur

1. **Questionnaire initial** : 7 questions (nom, secteur, services, horaires, couleur, contact)
2. **Chat avec l'IA** : affinage des détails (textes, services, règles de réservation)
3. **Modification avancée** (optionnel) : demander à l'IA de modifier le design (TSX/CSS)
4. **Déploiement** : un clic → conteneur Docker + sous-domaine unique
5. **Site live** : accessible en < 60 secondes

---

### Slide 6 : Agent IA - Capacités

#### Configuration (config.json)
- ✅ Services (nom, durée, prix, couleur)
- ✅ Horaires d'ouverture par jour
- ✅ Thème (couleurs primaire/secondaire/accent)
- ✅ Textes (hero, CTA, SEO, politique d'annulation)
- ✅ Contact (email, téléphone, adresse)
- ✅ Règles de réservation (durée, délai, max bookings)

#### Modification de Code Source (NEW)
- ✅ Fichiers TSX (composants React)
- ✅ Fichiers CSS (styles Tailwind)
- ✅ Self-correction via **lint → build → logs → re-génération**
- ✅ Max 3 itérations avant échec

---

### Slide 7 : Agent IA - Pipeline Self-Correction

```
User Prompt
    ↓
IA génère code TSX/CSS
    ↓
Write fichiers
    ↓
Lint (eslint)
    ↓
 ✅ OK ?  ────────→ Build (vite)
    ↓ ❌ Erreur            ↓
    │                  ✅ OK ?
    │                     ↓ ❌ Erreur
    │                     │
    └──────←──────────────┘
           │
    IA reçoit logs
           │
    Correction (iteration++)
           │
    Max 3 iterations ?
           ↓
        SUCCESS
```

---

### Slide 8 : LLM vs NLP Classique - Pourquoi un LLM ?

| Critère | NLP Classique (BERT, spaCy) | LLM (Llama3.2, GPT) |
|---------|------------------------------|---------------------|
| **Génération de code** | ❌ Impossible | ✅ JSON + TSX + CSS |
| **Multi-domaines** | ❌ 1 modèle/secteur | ✅ Cross-domain |
| **Adaptabilité** | ❌ Règles rigides if/else | ✅ Few-shot learning |
| **Self-correction** | ❌ Pas de génération | ✅ Lint → Build → Re-gen |
| **Maintenance** | 🔴 Explosive (N modèles) | 🟢 1 seul modèle |
| **Temps de dev** | 🔴 Semaines de règles | 🟢 Prompts en heures |

**Conclusion** : Le LLM est le seul choix viable pour générer du code structuré avec self-correction.

---

### Slide 9 : Ollama vs GPT - Approche Hybride

#### Ollama (Llama3.2) - Prioritaire
- ✅ **0€/requête** (hébergé localement)
- ✅ **Données privées** (RGPD compliant)
- ✅ **Personnalisable** (fine-tuning possible)
- ❌ Moins puissant que GPT-4

#### GPT-4 Turbo - Fallback
- ✅ **Très performant** (meilleure compréhension)
- ✅ **API stable** (uptime 99.9%)
- ❌ **0.03€/génération** (coût récurrent)
- ❌ Données envoyées à OpenAI

**Stratégie** : Ollama par défaut, GPT si échec après 3 itérations

---

### Slide 10 : Déploiement Multi-tenant

#### Chaque client = 1 conteneur Docker
- **Port unique** : 3001, 3002, 3003...
- **Sous-domaine** : `client-{uuid}.vps-ip.nip.io`
- **Config isolée** : volume Docker bind `/volumes/config`
- **Hot Reload** : modification config → rechargement instantané (HMR Vite)

#### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name client-abc123.vps-ip.nip.io;
    location / {
        proxy_pass http://localhost:3001;
    }
}
```

---

### Slide 11 : Supabase - Source of Truth

#### Tables principales
- **`clients`** : métadonnées sites (status, url, port, config)
- **`client_admins`** : gestion rôles (owner, admin, viewer)
- **`deployment_logs`** : logs déploiement pour debugging
- **`ai_modifications`** : historique modifications IA

#### Realtime
- ✅ Supabase Realtime pour status déploiement (pending → deploying → deployed)
- ✅ Notification instantanée à l'utilisateur

#### RLS (Row Level Security)
- ✅ Users voient uniquement leurs propres clients
- ✅ Super_admin voit tous les clients
- ✅ Isolation complète entre clients

---

### Slide 12 : Stack Technique

#### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** + **shadcn/ui**
- **React Router v6** + **React Query**

#### Backend
- **Express.js** (orchestrator)
- **Docker API** (dockerode)
- **Nginx** (reverse proxy)

#### Base de données
- **Supabase PostgreSQL**
- **Supabase Storage** (configs JSON)
- **Supabase Edge Functions** (triggers)

#### IA
- **Ollama** (Llama3.2 local)
- **OpenAI GPT-4 Turbo** (fallback)

---

### Slide 13 : Métriques & Performances

#### Temps de Génération
- ⏱️ **< 2 min** : questionnaire → site déployé
- ⏱️ **30-60s** : déploiement conteneur Docker
- ⏱️ **< 5s** : hot reload après modification config

#### Précision IA
- 🎯 **85-90%** : configs correctes au 1er coup
- 🔁 **95%** : succès après self-correction (3 itérations)

#### Coût
- 💰 **0€/site** : avec Ollama (vs 0.50€ avec GPT-4)
- 💰 **5€/mois** : VPS pour 50 clients

#### Scalabilité
- 🐳 **50 conteneurs/VPS** (8GB RAM)
- 🌐 **Auto-scaling** : détection charge → spawn nouveau VPS

---

### Slide 14 : Sécurité & Limitations

#### Sécurité
- ✅ **RLS Supabase** : isolation complète entre clients
- ✅ **Whitelist fichiers** : IA ne peut modifier que TSX/CSS (pas .env, package.json)
- ✅ **Token auth** : communication backend ↔ edge functions
- ✅ **Sandbox** : conteneurs Docker isolés

#### Limitations actuelles
- ⚠️ **1 template** : uniquement "Barber" (extensible)
- ⚠️ **Pas de paiement** : intégration Stripe/PayPal future
- ⚠️ **DNS manuel** : sous-domaines via nip.io (Let's Encrypt à venir)
- ⚠️ **IA limitée** : Ollama moins puissant que GPT-4

---

### Slide 15 : Roadmap Future

#### Court terme (1-3 mois)
- 🔐 **SSL automatique** (Let's Encrypt)
- 💳 **Paiement intégré** (Stripe)
- 📧 **Emails transactionnels** (SendGrid)
- 🎨 **Templates multiples** (médical, sport, beauté)

#### Moyen terme (3-6 mois)
- 🧩 **Marketplace plugins** (calendriers, paiements, SMS)
- 📊 **Analytics intégré** (Google Analytics, Plausible)
- 🌍 **Multi-langues** (i18n)
- 🤖 **Agent IA autonome** : proposition proactive

#### Long terme (6-12 mois)
- 🏷️ **White-label** : vendre aux agences web
- 📡 **API publique** : devs tiers
- 🤝 **Intégrations tierces** (Zapier, Make)
- 🎓 **Formation** : cours en ligne

---

## 🎤 Argumentaire Oral - Points Clés

### 1. Introduction (1 minute)
*"Bonjour, nous sommes Gabin et Thomas. Nous avons développé BookWise Generator, un générateur automatisé de sites de réservation piloté par IA. Aujourd'hui, créer un site de réservation prend 2-3 jours et coûte 2000-5000€. Avec notre solution, c'est fait en moins de 2 minutes pour 0€ de coût récurrent."*

### 2. Démo Live (5 minutes)
- Remplir questionnaire (30s)
- Chat avec l'IA (2 min)
- Modification code avancée (1 min)
- Déploiement + site live (1.5 min)

### 3. Architecture Technique (2 minutes)
*"Notre architecture repose sur 4 piliers :*
1. *Frontend React avec chat IA conversationnel*
2. *Supabase comme source de vérité unique (tables, storage, triggers)*
3. *Backend Orchestrator qui génère et déploie les conteneurs Docker*
4. *VPS avec Nginx pour le reverse proxy et isolation multi-tenant"*

### 4. Innovation IA (3 minutes)
**Question attendue** : *"Pourquoi un LLM et pas du NLP classique ?"*

**Réponse** :
*"Excellente question. Nous avons comparé 3 approches :*

1. ***NLP Classique (BERT, spaCy)** : extraction d'entités + règles if/else rigides. Impossible de générer du code structuré (JSON, TSX). Maintenance explosive : 1 modèle par secteur.*

2. ***Template statique** : pas de personnalisation, utilisateur limité à quelques champs pré-définis. Pas d'IA.*

3. ***LLM (notre choix)** : génération de code structuré (JSON + TSX + CSS), adaptabilité cross-domain, self-correction automatique via lint/build. Un seul modèle pour tous les secteurs.*

*L'innovation clé est notre pipeline de self-correction : l'IA génère du code → lint → build → si erreur, l'IA reçoit les logs et corrige → jusqu'à 3 itérations. Taux de succès : 95%.*

*Nous utilisons Ollama (Llama3.2) en local pour 0€/requête, avec GPT-4 en fallback. Approche hybride : performance + coût maîtrisé."*

### 5. Scalabilité & Business Model (1 minute)
*"Actuellement, un VPS 8GB RAM héberge jusqu'à 50 clients simultanés. Coût : 5€/mois. Avec auto-scaling, on peut détecter la charge CPU et spawn un nouveau VPS automatiquement.*

*Business model envisagé :*
- *Freemium : 1 site gratuit par utilisateur*
- *Pro : 9.90€/mois (5 sites + support prioritaire)*
- *White-label : licences pour agences web*
- *Marketplace : commission sur plugins tiers"*

### 6. Conclusion & Questions (1 minute)
*"En conclusion, BookWise Generator démocratise la création de sites de réservation professionnels grâce à l'IA. Temps réduit de 3 jours à 2 minutes, coût de 2000€ à 0€. Notre architecture SaaS multi-tenant est prête pour la production.*

*Nous sommes ouverts à vos questions."*

---

## ❓ Questions Fréquentes (Anticipation)

### Q1 : "Quelle est la vraie innovation IA ici ? Vous utilisez juste un LLM existant."
**Réponse** :
*"L'innovation réside dans 3 aspects :*
1. *Le pipeline de self-correction automatique (lint → build → logs → re-génération) qui n'existe pas dans les solutions existantes.*
2. *L'architecture conversationnelle multi-tours qui maintient le contexte et permet un affinage progressif.*
3. *La capacité de l'IA à modifier du code source (TSX/CSS) de manière autonome, pas seulement du JSON."*

### Q2 : "Pourquoi pas GPT-4 directement ?"
**Réponse** :
*"GPT-4 coûte 0.03€/génération. Pour 1000 sites générés/mois, c'est 30€. Avec Ollama, c'est 0€. Notre approche hybride : Ollama par défaut (gratuit), GPT-4 en fallback si échec. Cela réduit les coûts de 90% tout en gardant une qualité élevée."*

### Q3 : "Comment gérez-vous la sécurité entre clients ?"
**Réponse** :
*"Isolation multi-niveau :*
1. *Supabase RLS : chaque utilisateur voit uniquement ses propres clients.*
2. *Conteneurs Docker : isolation réseau et filesystem complète.*
3. *Whitelist fichiers : l'IA ne peut modifier que TSX/CSS, pas les .env ou package.json.*
4. *Token auth : communications backend ↔ edge functions sécurisées."*

### Q4 : "Quelle est la scalabilité réelle ?"
**Réponse** :
*"Tests actuels : 50 conteneurs simultanés sur un VPS 8GB RAM. Chaque conteneur consomme ~150MB. Avec monitoring CPU/RAM, on peut auto-scale : spawn un nouveau VPS quand charge > 80%. Coût linéaire : 5€/mois pour 50 clients = 0.10€/client/mois."*

### Q5 : "Pourquoi pas Kubernetes ?"
**Réponse** :
*"Kubernetes est overkill pour notre use-case actuel (< 500 clients). Docker Compose + Nginx suffit et coûte moins cher. Kubernetes sera envisagé à partir de 1000+ clients pour orchestration avancée."*

### Q6 : "Comment gérez-vous les mises à jour du template ?"
**Réponse** :
*"Chaque client a un template_version dans la config. Lors d'une mise à jour majeure, on propose une migration assistée par IA : analyse des différences → suggestions de modifications → apply automatique avec rollback possible."*

---

## 🎯 Objectifs Soutenance

### Notes Attendues
- **Technique** : 17-18/20 (architecture solide, code propre, innovations IA)
- **Innovation** : 16-17/20 (self-correction, multi-tenant automatisé)
- **Présentation** : 16-17/20 (démo fluide, argumentaire structuré)
- **Questions** : 16-18/20 (préparation anticipée)

### Points à Maximiser
- ✅ **Démo live fluide** : répéter 3 fois avant la soutenance
- ✅ **Argumentaire LLM vs NLP** : maîtrisé parfaitement
- ✅ **Métriques concrètes** : temps, coût, précision
- ✅ **Vision long terme** : roadmap claire et réaliste

### Points d'Attention
- ⚠️ Ne pas minimiser la complexité technique (architecture non triviale)
- ⚠️ Anticiper les critiques "tech pour la tech" (justifier chaque choix)
- ⚠️ Avoir des backups (vidéo, screenshots) si problème technique

---

**Dernière préparation** : Dimanche soir (répétition générale)  
**Soutenance** : Lundi matin (10h45)  
**Durée** : 15 min présentation + 10 min questions

---

**Bonne chance ! 🚀**
