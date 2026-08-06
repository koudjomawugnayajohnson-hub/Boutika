# CAHIER DES CHARGES — Boutika (SaaS Boutique, niveau entreprise)
### Partie 1/3 — Business Case & Modèle économique
### Généré par The Architect Prime — Stack Stitch → Antigravity → Supabase → GitHub → Vercel

---

## SECTION 1 — BUSINESS CASE & POSITIONNEMENT

**Pitch en une phrase :**
> Boutika aide les boutiques indépendantes de tout secteur (mode, épicerie, quincaillerie, multi-produits) à gérer leurs ventes, leur stock et leurs factures sans compétence informatique ni logiciel à reconfigurer — contrairement aux solutions de caisse sectorielles qui imposent une structure de catalogue rigide propre à un seul type de commerce.

**Proposition de valeur unique (UVP) :**
Le seul outil qui combine un **catalogue produit réellement flexible** (utilisable pour du textile, de l'épicerie ou de la quincaillerie sans reconfiguration lourde), un **paiement d'abonnement 100% mobile money** à prix local, et une **gestion multi-boutiques native dès le tier de base** — un commerçant qui diversifie son activité ou ouvre un second point de vente n'a jamais besoin de changer d'outil.

**3 concurrents/alternatives directs et leur faiblesse exploitée :**

| Alternative | Faiblesse exploitée |
|---|---|
| Logiciels de caisse sectoriels (mode, épicerie, etc.) | Catalogue rigide, inadapté dès que le commerçant vend plusieurs types d'articles ou diversifie |
| Cahier/carnet manuel (statu quo) | Zéro traçabilité, aucune vision consolidée du stock ni des ventes |
| Solutions internationales génériques (Square, Shopify POS) | Paiement carte quasi-exclusif, pas de mobile money natif, tarification en devise forte |

**Marché cible estimé :** Commerce de détail indépendant, tous secteurs confondus, en Afrique de l'Ouest francophone — un marché nettement plus large que la restauration seule, puisqu'il couvre toute boutique physique quel que soit ce qu'elle vend. Segment prioritaire : boutiques urbaines à 1-3 employés, avec un potentiel réel de diversification ou de second point de vente.

**Pourquoi maintenant :** Digitalisation croissante du commerce de détail informel, adoption du mobile money en forte hausse, et absence de solution universelle dominante sur ce marché — les acteurs existants sont soit trop chers/complexes (solutions internationales), soit rigides et sectoriels.

---

## SECTION 2 — MODÈLE ÉCONOMIQUE DÉTAILLÉ

*(Abonnement mensuel ou annuel confirmé)*

**🆓 STARTER — 14 jours d'essai puis ~8 000 FCFA/mois (ou ~80 000 FCFA/an, 2 mois offerts)**
- Limites : 1 boutique, jusqu'à 2 utilisateurs, catalogue et ventes illimités, rapports du jour uniquement
- Objectif : acquisition et qualification rapide

**💼 PRO — ~18 000 FCFA/mois (ou ~180 000 FCFA/an)**
- Prix ancré sur : le gain de temps et la réduction des ruptures/surstock, largement inférieur au coût d'une rupture de stock non anticipée
- Inclus : jusqu'à 3 boutiques, utilisateurs illimités, rapports avancés (semaine/mois, alertes stock bas), export comptable
- Cible : commerçant établi, potentiellement multi-boutiques — cœur de cible du produit

**🏢 ENTERPRISE — Sur devis**
- Inclus : boutiques illimitées, SSO, export API, support dédié, SLA documenté
- Cible : petites chaînes de boutiques en expansion

**Métriques clés à tracker dès le MVP :**
- MRR/ARR (Monthly/Annual Recurring Revenue, vu la double option mensuelle/annuelle)
- Taux de conversion Starter → Pro
- Taux de churn mensuel
- CAC estimé vs LTV projeté

*(Montants indicatifs — à valider par étude de marché locale avant lancement)*

---

## SECTION 3 — PERSONA, JTBD & PARCOURS D'ACHAT

**Persona utilisateur** : Commerçant(e) indépendant(e), tout secteur confondu, gérant souvent seul(e) ou avec 1 à 3 employés.

**Persona acheteur** : La même personne que l'utilisateur — TPE, pas de séparation acheteur/utilisateur à ce segment.

**Jobs To Be Done :**
1. *Quand* je vends un article, *je veux* l'enregistrer et générer une facture immédiatement, *pour que* je garde une trace sans tenir de cahier.
2. *Quand* mon stock varie, *je veux* voir ce qu'il me reste en temps réel, *pour que* je ne sois jamais en rupture ni en surstock.
3. *Quand* j'ouvre une deuxième boutique, *je veux* gérer les deux depuis un seul compte, *pour que* je n'aie pas à dupliquer mes outils ou ma formation.

**Objections d'achat anticipées :**
- *"Je vends des choses très différentes (vêtements ET accessoires, par exemple)"* → catalogue flexible avec champs personnalisables par article
- *"Je n'ai pas de carte bancaire"* → abonnement payable intégralement en mobile money
- *"Je risque d'ouvrir une autre boutique un jour"* → multi-boutiques inclus dès le tier de base, pas une option coûteuse à ajouter plus tard

**Anti-persona** : Grandes surfaces avec ERP déjà en place ; marketplaces en ligne pures sans point de vente physique. Non ciblées au MVP.

---

## SECTION 4 — STRATÉGIE DE RÉTENTION

**Moment "aha"** : La première vente enregistrée avec mise à jour automatique du stock — le commerçant voit immédiatement qu'il n'a plus besoin de compter à la main.

**Signaux de churn à tracker :**
- Absence de connexion à l'app pendant plus de 7 jours
- Stock jamais mis à jour après la période d'activation
- Échec de renouvellement de paiement (carte ou mobile money)

**Boucle d'engagement :**
- Alerte de stock bas (fait revenir le commerçant réapprovisionner via l'app)
- Rapport de ventes hebdomadaire par SMS/notification

*(Ces signaux seront traduits en colonnes et events concrets dans le schéma Supabase, Partie 2/3.)*

---

**Fin de la Partie 1/3.** Dis-moi si tu valides ce business case (notamment les prix et le nom provisoire "Boutika"), et j'enchaîne sur la **Partie 2/3** : maquettes Stitch, architecture multi-tenant, lots fonctionnels et schéma SQL Supabase.
