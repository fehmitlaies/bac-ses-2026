# Bac SES 2026 — App de révision

PWA single-page (HTML/CSS/JS pur, 0 dépendance, 0 build) pour la spécialité SES Terminale, session 2026.

## Installation

Ouvre `index.html` dans n'importe quel navigateur, ou héberge sur un serveur statique :

```bash
python3 -m http.server 8721
# puis http://localhost:8721
```

Sur GitHub Pages, accessible via l'URL de déploiement.

## Fonctionnalités

- **12 chapitres** du programme officiel (BO 2019, note 2024) avec flags écrit/oral 2026
- **3 niveaux** de synthèse par chapitre (10/20 → 14/20 → 18/20)
- **362 flashcards** seed (algorithme SM-2, intervalle plafonné selon J-bac)
- **17 annales** 2022-2025 avec plans-types
- **4 modes méthodo chronométrés** : EC1 (40 min), EC2 (60 min), EC3 (90 min), Dissertation (4 h)
- **Examen blanc 4 h** avec alarmes
- **Drill calcul mental EC2** (taux de variation, indice, TCAM, élasticité)
- **Préparation Grand Oral** (coef 10) avec timers 5 + 10 min
- **Fiche verbes de consigne** (montrez vs expliquez vs distinguez…)
- **Quiz QCM**, **stats heatmap**, **planning adaptatif**
- **PWA installable**, **fonctionne hors-ligne**

## Raccourcis clavier (flashcards)

- **Espace** ou **Entrée** — retourner la carte
- **1** — Oublié (qualité 0)
- **2** — Difficile (qualité 2)
- **3** — Bien (qualité 4)
- **4** — Parfait (qualité 5)

## Choix techniques

- **SM-2** (Wozniak 1990) plutôt que Leitner (moins efficace) ou FSRS (~700 lignes, surdimensionné).
- Intervalle plafonné à `J-bac/3` pour garantir qu'aucune carte n'est oubliée avant l'examen.
- **localStorage** : préférences, brouillons, streak. **IndexedDB** : flashcards, scores, examens, historique.
- Une SPA en HTML/CSS/JS pur (3 fichiers) — pas de framework, pas de bundler, pas de CDN.

## Données pédagogiques

- Programme : BO spécial n°8 du 25 juillet 2019 ; note de service BO n°35 du 28 août 2024.
- Pour 2026 : **9 chapitres** évaluables à l'écrit (E1, E3, E4, E5, S1, S3, S4, S5, R2). Les 3 autres (E2, S2, R1) sont au programme et au Grand Oral.
- **Coefficients** : écrit 16, Grand Oral 10.
- **Dates** : écrits 16-17 juin 2026, Grand Oral 22 juin → 1ᵉʳ juillet 2026.

⚠️ Tout chiffre marqué `[À vérifier]` doit être confirmé sur les sources officielles (Insee, Eurostat, CITEPA, BCE).

## Sauvegarde

Tes données sont stockées localement par appareil. **Exporte régulièrement** depuis Paramètres → « Exporter JSON » — surtout sur iPhone (iOS efface IndexedDB après 7 j d'inactivité).
