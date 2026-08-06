# CAHIER DES CHARGES — Boutika (SaaS Boutique, niveau entreprise)
### Partie 3/3 — Architecture Technique, Exécution & Roadmap
### Généré par The Architect Prime — Stack Stitch → Antigravity → Supabase → GitHub → Vercel

---

## SECTION 10 — ARCHITECTURE TECHNIQUE

**Stack confirmée (reprise intégrale de la bibliothèque de défauts) :**

| Composant | Choix |
|---|---|
| Design | Google Stitch |
| Développement | Google Antigravity |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes + Supabase Edge Functions |
| Base de données | Supabase (PostgreSQL), schéma multi-tenant + multi-boutiques |
| Authentification | Supabase Auth — OTP téléphone, 2FA optionnel niveau Enterprise |
| Storage | Supabase Storage |
| Paiement | Stripe (Checkout + Billing + Customer Portal, mensuel/annuel) + agrégateur mobile money (CinetPay ou PayDunya) |
| Versioning | GitHub |
| CI/CD | GitHub Actions + Vercel (preview + production) |
| Hébergement | Vercel |
| Emails | Resend |
| Monitoring | Vercel Analytics + Sentry |
| Testing | Vitest (unitaires) + Playwright (E2E) — non négociable |
| Audit & Logs | Table Supabase `audit_logs` dès le MVP |

**Stratégie de branches GitHub :**
- `main` : Production
- `dev` : Intégration
- `feature/lot-a-foundations`, `feature/lot-b-core`, `feature/lot-c-billing`, `feature/lot-d-retention`, `feature/lot-e-admin`

**Pipeline de qualité (obligatoire avant merge vers `dev`) :**
- Tests Vitest passent (logique métier)
- Tests Playwright passent (parcours critiques du Lot F, y compris l'isolation entre boutiques)
- Aucune table sans RLS
- Build Vercel preview réussi

**Variables d'environnement :**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MOBILE_MONEY_API_KEY`, `RESEND_API_KEY`, `SENTRY_DSN`

**Contraintes non-fonctionnelles :**
- **Performance** : < 2s chargement, < 200ms réponse API moyenne ; sauvegarde locale des ventes en cas de coupure réseau (synchronisation différée)
- **Sécurité** : RLS 100% (y compris règle scopée boutique), rate limiting, chiffrement des données de paiement, audit trail
- **Scalabilité** : 10K utilisateurs / 1K organisations / boutiques multiples par organisation sans refonte — palier suivant documenté : read replicas Supabase si >X requêtes/sec
- **Conformité** : export/suppression de données, CGU/politique de confidentialité, bandeau cookies
- **Accessibilité** : WCAG 2.1 AA minimum
- **Disponibilité** : SLA cible 99,5% documenté (non contractuel au MVP)

---

## SECTION 11 — DESIGN SYSTEM & PARCOURS CRITIQUES

*(Direction visuelle : voir Partie 2/3, Section 5 — bleu ardoise/gris, sobre)*

- **Parcours 1 — Onboarding + activation** : Créer compte (téléphone/OTP) → Créer l'organisation et la première boutique → Ajouter le catalogue de base → Inviter le staff assigné → Première vente enregistrée
- **Parcours 2 — Action cœur métier** : Sélectionner produits → Ajouter au panier → Valider la vente → Stock mis à jour → Facture générée
- **Parcours 3 — Ajout d'une boutique** : Paramètres → Ajouter une boutique → Vérification de la limite du tier → Boutique créée → Assignation du staff
- **Parcours 4 — Invitation équipe** : Owner/Admin ouvre Admin → Saisit contact + rôle + boutique(s) assignée(s) → Invitation envoyée → Membre accepte → Accès scopé à ses boutiques
- **Parcours 5 — Upgrade/Paiement** : Fin d'essai ou limite de boutiques atteinte → Choix du tier → Choix moyen de paiement → Paiement → Webhook confirme → Accès débloqué
- **Parcours 6 — Export/Suppression (conformité)** : Owner ouvre Paramètres → Demande export (toutes boutiques) → Fichier généré → Demande de suppression → Délai de grâce 30 jours → Purge définitive

---

## SECTION 12 — PLAN D'EXÉCUTION STITCH → ANTIGRAVITY → SUPABASE → GITHUB → VERCEL

**PHASE 1 — DESIGN (Stitch)**
Générer les 5 groupes (Partie 2/3, Section 5), valider chaque flux, exporter vers Antigravity.

**PHASE 2 — FONDATIONS (Antigravity, Lot A, agent unique)**
```
Using the multi-tenant, multi-shop Supabase schema below, set up
phone-based OTP authentication (Supabase Auth), organization and
shop management with role-based access (owner/admin/member, with
member scoped to specific shops via shop_staff), enable RLS on all
tables — including the shop-scoped policy for shop-level data —
implement audit logging on sensitive actions, and build the
navigation/layout from the imported Stitch design (Groups 1-2).
This is a premium B2B SaaS — security and data isolation, including
isolation between shops of the same organization for staff roles,
are non-negotiable. Repository: boutika, branch: feature/lot-a-foundations.

[Coller le schéma SQL complet — Partie 2/3, Section 9]
```

**PHASE 3 — DÉVELOPPEMENT PARALLÈLE (Manager View, Lots B/C/D/E)**

```
Agent — Lot B (Core business, branch: feature/lot-b-core):
Build a flexible product catalog (custom fields via jsonb, no schema
migration needed per sector), sale creation/closure with automatic
stock decrement and PDF invoice generation, per-shop inventory
tracking with low-stock alerts, and a sales report dashboard
(per-shop and consolidated across the organization). Depends on
the authentication, organization and shop schema from Lot A —
retrieve that context from the Knowledge Base. Use the imported
Stitch Group 2 (core business) design. Every query must respect
both the organization_id and shop-scoped RLS already in place.
```

```
Agent — Lot C (Billing, branch: feature/lot-c-billing):
Build the subscription module: monthly/annual fixed-price tiers
(Starter: 1 shop, Pro: up to 3 shops, Enterprise: unlimited),
Stripe Checkout + Customer Portal for card payments, a mobile
money aggregator integration, payment webhooks, server-side
enforcement of the shop-count limit per tier (not just UI-side),
and a pricing page from Stitch Group 3. Depends only on the
organization schema from Lot A.
```

```
Agent — Lot D (Retention, branch: feature/lot-d-retention):
Build the onboarding flow with activation event tracking
(organization_created, shop_created, first sale_created), low-stock
notifications, and a weekly sales report notification (email/SMS).
Use the imported Stitch Group 1 (onboarding) design. Depends on
Lot B's sales/inventory logic being partially in place.
```

```
Agent — Lot E (Admin & Governance, branch: feature/lot-e-admin):
Build shop management (add/edit shops), team member management
with role assignment and per-shop staff assignment (shop_staff
table), the invitation flow with shop selection, an audit log
viewer, and a data export + account deletion flow covering all
shops of the organization. Use the imported Stitch Group 5 design.
Depends only on the organization/shop schema from Lot A.
```

**PHASE 4 — QUALITÉ (Lot F, transverse)**
```
Write Vitest unit tests for the business logic in the catalog,
sales, inventory, and subscription modules — including the
server-side shop-count limit enforcement per tier. Write Playwright
E2E tests covering: signup → organization + shop creation → catalog
setup → sale → invoice → subscription upgrade → team invitation with
shop assignment. Include a dedicated test suite that creates two
shops within the same organization, assigns a staff member to only
one of them, and verifies they cannot see or act on the other shop's
sales or inventory.
```

**PHASE 5 — VÉRIFICATION (Artifacts)**
- Après Lot A : Auth + RLS + isolation multi-tenant ET multi-boutique vérifiés (test manuel : 2 organisations, 2 boutiques dans une même organisation, un staff assigné à une seule)
- Après Lot B+C : parcours complet inscription → vente → facture → paiement, et blocage correct au-delà de la limite de boutiques du tier
- Après Lot F : suite de tests complète passe en CI

**PHASE 6 — MERGE & DÉPLOIEMENT**
- Merge `feature/*` → `dev` après validation Artifacts + tests
- Deploy preview Vercel sur `dev`
- Merge `dev` → `main` → production

---

## SECTION 13 — HYPOTHÈSES RETENUES PAR DÉFAUT

- **Marché géographique non précisé** → Afrique de l'Ouest francophone (cohérent avec le projet TchopFlow) — détermine mobile money et authentification par téléphone.
- **Agrégateur mobile money non précisé** → CinetPay ou PayDunya — à valider selon les opérateurs réellement utilisés.
- **Fourchette de prix des tiers** → Non fixée précisément, estimée à ~8 000 / ~18 000 FCFA (Starter/Pro), avec réduction annuelle — à valider par étude de marché.
- **Limite exacte de boutiques par tier** → Proposée à 1 (Starter) / 3 (Pro) / illimité (Enterprise) — ajustable selon retours terrain.
- **Douleur chiffrée non précisée** → Estimée qualitativement (ruptures de stock, absence de traçabilité) plutôt que quantifiée.

*Ces hypothèses sont à valider ou corriger avant de lancer l'exécution dans Antigravity.*

---

## SECTION 14 — ROADMAP & TRAJECTOIRE DE VALORISATION

**V1.1 (post-MVP immédiat) :**
- Mode hors-ligne complet (PWA)
- Transferts de stock entre boutiques d'une même organisation
- Impression sur imprimante thermique de caisse

**V2 (moyen terme) :**
- Boutiques illimitées natives sur tous les tiers avec tarification par boutique additionnelle
- Intégration comptable export avancé
- SSO/SAML si un segment Enterprise se confirme

**Signaux de traction à documenter pour valorisation future :**
- MRR/ARR et croissance
- Nombre d'organisations actives et nombre moyen de boutiques par organisation (preuve du positionnement multi-boutiques)
- Taux de rétention à 30/60/90 jours
- Répartition Starter/Pro/Enterprise

**Hors scope volontaire :**
- Comptabilité fiscale complète / déclarations
- Gestion RH et paie du personnel
- Boutique en ligne cliente (e-commerce côté acheteur final)
- Marketplace multi-boutiques visible par les clients finaux
- Gestion de fournisseurs/achats (au-delà du simple suivi de stock)

---

**Cahier des charges complet livré (3/3).** Les 14 sections couvrent le business case, l'architecture multi-tenant/multi-boutiques, le schéma SQL, les prompts Stitch/Antigravity et la roadmap. Dis-moi si tu veux ajuster un lot, détailler une fiche supplémentaire, ou reformuler un prompt spécifique.
