# mokengelidev-frederic

Ce dépôt contient une petite application de gestion de tâches split en deux parties :

- `front-end/` : application React + TypeScript buildée avec Vite.
- `back-end/` : API minimale Express (mock en mémoire) servant les tâches.

## Structure

- front-end/
- back-end/

## Prérequis

- Node.js (version moderne, >= 18 recommandée)
- npm (ou yarn)
- macOS (les commandes d'exemples utilisent zsh)

## Lancer le projet (développement)

Ouvrez deux terminaux : un pour le back-end, un pour le front-end.

1) Back-end (API)

```bash
cd back-end
npm install
# mode développement (nodemon recharge automatiquement)
npm run dev
```

Le serveur écoute par défaut sur : http://localhost:3000

2) Front-end (UI)

```bash
cd front-end
npm install
# démarre Vite en mode développement (port par défaut : 5173)
npm run dev
```

Accédez ensuite à l'application front-end (typiquement) : http://localhost:5173

### Commandes utiles supplémentaires

- Pour builder le front-end en production :

```bash
cd front-end
npm run build
# pour visualiser le build localement
npm run preview
```

- Pour lancer le back-end en mode production :

```bash
cd back-end
npm start
```

## API (rapide)

Endpoints principaux exposés par le back-end :

- GET /api/tasks  -> liste des tâches
- POST /api/tasks -> créer une tâche (body JSON)
- PATCH /api/tasks/:id -> toggle `done`
- PUT /api/tasks/:id -> mettre à jour une tâche
- DELETE /api/tasks/:id -> supprimer

Format d'une tâche (exemple) :

```json
{
	"id": 1,
	"nom": "Task 1",
	"description": "Desc 1",
	"done": false
}
```

Le back-end utilise pour l'instant un stockage en mémoire (tableau `tasks` dans `back-end/index.js`) — c'est un mock pour le développement.

Note importante : Le CORS du serveur est configuré pour autoriser l'origine `http://localhost:5173` (port Vite). Si vous changez le port du front, mettez à jour `back-end/index.js` ou passez l'origine via une variable d'environnement.

## Choix techniques (raisonnement)

- Front-end
	- React 19 + TypeScript : productivité + typage pour composants et data models (`src/types`).
	- Vite : serveur de développement ultra-rapide et build moderne.
	- Axios : requêtes HTTP vers l'API.
	- React-Toastify : notifications utilisateur simples.
	- ESLint : linting du code.

- Back-end
	- Node.js + Express 5 : API légère, simple à étendre.
	- CORS : configuré pour permettre les requêtes depuis le front local.
	- nodemon en dev : redémarrage automatique.

- Pourquoi ces choix ?
	- Simplicité et rapidité de développement : Vite + React + Express permettent de prototyper vite.
	- TypeScript côté front pour réduire les bugs et améliorer l'auto-complétion.

## Améliorations possibles

- Externaliser la configuration (ports, origine CORS) via des variables d'environnement.
- Remplacer le stockage en mémoire par une vraie base (SQLite/Postgres) et ajouter des migrations.
- Ajouter des tests unitaires et d'intégration pour l'API et les composants.
- Ajouter CI (lint, tests, build) et des scripts de déploiement.

## Ports utilisés

- Front-end (Vite) : 5173
- Back-end (Express) : 3000

