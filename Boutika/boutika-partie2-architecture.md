# CAHIER DES CHARGES — Boutika (SaaS Boutique, niveau entreprise)
### Partie 2/3 — Design, Architecture Multi-Tenant & Données
### Généré par The Architect Prime — Stack Stitch → Antigravity → Supabase → GitHub → Vercel

---

## SECTION 5 — MAQUETTES STITCH

**Direction visuelle globale** *(minimale, professionnelle, sobre)* :
- **Ton** : épuré, sérieux, orienté données — transmet la fiabilité d'un outil de gestion sans effet startup générique
- **Palette** : bleu ardoise profond en primaire (confiance, neutralité, s'adapte à n'importe quel secteur commercial), gris chaud en secondaire, fond blanc pur
- **Typographie** : sans-serif neutre et lisible (ex. Inter ou IBM Plex Sans), hiérarchie stricte à 3 niveaux
- **Mode** : light mode uniquement au MVP

**🎨 GROUPE 1 — Onboarding**
```
Generate a clean, minimal, professional UI flow for Boutika with 5
connected screens: (1) Welcome screen with value proposition, (2)
Phone number entry, (3) OTP verification, (4) Create organization +
first shop (name, address, sector — optional/free text since catalog
is sector-agnostic), (5) Add first products and invite staff. Style:
slate blue primary color, warm gray accents, pure white background,
neutral sans-serif typography (Inter or IBM Plex Sans), light mode
only. Target users: independent shop owners across any retail sector,
little to no technical experience, primarily on smartphones. This is
a premium B2B SaaS — design should convey trust, polish and enterprise-
readiness, not a hobby project. Keep consistent spacing, typography
and color palette across all screens.
```

**🎨 GROUPE 2 — Cœur métier**
```
Generate a clean, minimal, professional UI flow for Boutika with 5
connected screens: (1) Home dashboard with today's sales summary
per shop, (2) Product catalog with flexible custom fields per item
(size, color, unit, etc.), (3) New sale screen (product grid, cart,
quantity), (4) Stock/inventory view per shop with low-stock alerts,
(5) Sale detail with invoice generation. Style: slate blue primary
color, warm gray accents, pure white background, neutral sans-serif
typography, light mode only. Target users: shop staff processing
sales and managing stock across one or more shop locations. This
is a premium B2B SaaS — design should convey trust, polish and
enterprise-readiness, not a hobby project. Keep consistent spacing,
typography and color palette across all screens.
```

**🎨 GROUPE 3 — Facturation/Pricing**
```
Generate a clean, minimal, professional UI flow for Boutika with 5
connected screens: (1) Sales report dashboard (day/week/month,
per shop and consolidated), (2) Pricing page with 3 tiers (Starter/
Pro/Enterprise) and monthly/annual toggle, (3) Payment method
selection (card vs mobile money), (4) Payment confirmation, (5)
Billing history with downloadable invoices. Style: slate blue
primary color, warm gray accents, pure white background, neutral
sans-serif typography, light mode only. Target users: shop owners
reviewing performance across their shop(s) and managing subscription.
This is a premium B2B SaaS — design should convey trust, polish and
enterprise-readiness, not a hobby project. Keep consistent spacing,
typography and color palette across all screens.
```

**🎨 GROUPE 4 — Paramètres boutiques/organisation**
```
Generate a clean, minimal, professional UI flow for Boutika with 4
connected screens: (1) Organization settings with list of shops,
(2) Add/edit a shop (name, address), (3) Product catalog management
(add/edit/remove items, custom fields), (4) Notification preferences.
Style: slate blue primary color, warm gray accents, pure white
background, neutral sans-serif typography, light mode only. Target
users: shop owners managing one or several shop locations. This is
a premium B2B SaaS — design should convey trust, polish and
enterprise-readiness, not a hobby project. Keep consistent spacing,
typography and color palette across all screens.
```

**🎨 GROUPE 5 — Admin & Gouvernance**
```
Generate a clean, minimal, professional UI flow for Boutika with 4
connected screens: (1) Team members list with roles and assigned
shop(s), (2) Invite member modal (with shop assignment for staff
role), (3) Audit log viewer, (4) Data export and account deletion
screen (GDPR-style compliance). Style: slate blue primary color,
warm gray accents, pure white background, neutral sans-serif
typography, light mode only. Target users: shop owners managing
staff access across shop locations and data compliance. This is a
premium B2B SaaS — design should convey trust, polish and enterprise-
readiness, not a hobby project. Keep consistent spacing, typography
and color palette across all screens.
```

---

## SECTION 6 — ARCHITECTURE MULTI-TENANT

**Modèle retenu** : Shared database, shared schema avec `organization_id` sur toutes les tables — **avec un sous-niveau `shops`** pour porter nativement le multi-boutiques dès le tier de base, ce qui est le cœur du positionnement de Boutika.

**Hiérarchie** :
```
organization (le compte/l'entreprise)
  └── shops (1 ou plusieurs boutiques physiques)
        └── inventory, sales (données scopées à la boutique)
```

**Table pivot :**
```
organizations (id, name, plan_tier, created_at, owner_id, settings jsonb)
shops (id, organization_id, name, address, created_at)
```

**Relation utilisateur-organisation :**
```
organization_members (id, organization_id, user_id,
  role enum('owner','admin','member'), invited_at, joined_at)
```

**Portée du rôle `member` (staff) :** un `member` est en plus rattaché à une ou plusieurs boutiques précises via `shop_staff` — il ne voit que les ventes/stock des boutiques auxquelles il est assigné, jamais les autres boutiques de l'organisation.
```
shop_staff (id, shop_id, user_id)
```

**Règle RLS universelle (tables au niveau organisation)** :
```sql
using (organization_id in (
  select organization_id from organization_members
  where user_id = auth.uid()
))
```

**Règle RLS spécifique (tables au niveau boutique, ex. `inventory`, `sales`)** :
```sql
using (
  shop_id in (
    select id from shops where organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid()
      and role in ('owner','admin')
    )
  )
  or
  shop_id in (
    select shop_id from shop_staff where user_id = auth.uid()
  )
)
```

**Gestion des rôles :**
- **Owner** : accès complet à toutes les boutiques de l'organisation, facturation/abonnement, suppression de l'organisation
- **Admin** : gestion du catalogue, du stock et du staff sur toutes les boutiques — pas d'accès à la facturation SaaS ni à la suppression
- **Member** (staff) : accès limité aux boutiques auxquelles il est explicitement assigné via `shop_staff` — vente et consultation du stock uniquement

**Invitation d'équipe** : flow d'invitation par email/SMS (table `invitations`, avec assignation optionnelle à une ou plusieurs boutiques pour le rôle `member`), lié au Groupe Stitch 5.

---

## SECTION 7 — ARCHITECTURE FONCTIONNELLE PAR LOTS PARALLÉLISABLES

**LOT A — FONDATIONS** *(bloquant, séquentiel)*
- Schéma Supabase multi-tenant + multi-boutiques complet (Section 9)
- Authentification (OTP téléphone) + gestion organisation/boutiques/invitations
- Structure de navigation (issue Stitch Groupes 1-2)
- RLS activée sur 100% des tables, y compris la règle spécifique boutique
- Table `audit_logs` + triggers sur actions sensibles
- Dépendance : aucune

**LOT B — CŒUR MÉTIER** *(parallélisable après Lot A)*
- Catalogue produit flexible (champs personnalisables via jsonb)
- Gestion des ventes (création, clôture, génération de facture)
- Gestion du stock/inventaire par boutique, avec alertes de seuil bas
- Ventes & rapports (par boutique et consolidés)
- Dépendance : Lot A terminé

**LOT C — MONÉTISATION** *(parallélisable avec B)*
- Stripe Checkout + Customer Portal (carte, mensuel/annuel)
- Intégration agrégateur mobile money
- Table `subscriptions` + webhooks
- Logique de paywall par tier, avec limite de nombre de boutiques par tier
- Page pricing (issue Stitch Groupe 3)
- Dépendance : Lot A terminé

**LOT D — RÉTENTION & ENGAGEMENT** *(parallélisable)*
- Onboarding avec tracking d'activation (première vente enregistrée)
- Alertes de stock bas (notification)
- Rapport de ventes hebdomadaire (email/SMS)
- Dépendance : Lot B partiellement avancé

**LOT E — ADMINISTRATION & GOUVERNANCE** *(parallélisable)*
- Gestion des boutiques (ajout/édition), gestion des membres/rôles avec assignation par boutique
- Export de données, suppression de compte (droit à l'oubli)
- Dépendance : Lot A terminé

**LOT F — QUALITÉ & CONFORMITÉ** *(transverse)*
- Tests Vitest sur la logique métier critique (calcul stock, factures, paywall par nombre de boutiques)
- Tests Playwright : inscription → création boutique → vente → facture → invitation staff assigné à une boutique → vérification qu'il ne voit pas les autres boutiques
- Structure politique de confidentialité + CGU, bandeau cookies RGPD
- Dépendance : suit chaque lot

---

## SECTION 8 — FICHES FONCTIONNELLES DÉTAILLÉES

### 📋 FONCTIONNALITÉ : Authentification & Organisation Multi-Boutiques
- **Lot parent** : A — **Groupe Stitch lié** : 1
- **Description** : Création de compte par téléphone (OTP), création de l'organisation et de sa première boutique.
- **User story** : "En tant que commerçant, je veux créer mon compte et ma première boutique avec mon numéro de téléphone, afin de démarrer sans configuration complexe."
- **Règles métier** : la première personne à créer l'organisation devient `owner` ; une organisation peut avoir 1 (Starter) à N (Pro/Enterprise) boutiques selon son `plan_tier`.
- **Table(s) Supabase** : `organizations`, `shops`, `organization_members`
- **RLS Policy** : isolation standard `organization_id`
- **Événement tracké** : `organization_created`, `shop_created`
- **États possibles** : invité / actif / désactivé
- **Critère de validation** : test Playwright — deux organisations créées séparément ne voient jamais les boutiques l'une de l'autre.
- **Priorité MVP** : Bloquant
- **Edge cases** : tentative de créer une 2e boutique sur le tier Starter (bloqué avec message d'upgrade).
- **Risque sécurité** : fuite de données inter-organisation → contre-mesure : RLS universelle testée en Lot F.

### 📋 FONCTIONNALITÉ : Catalogue Produit Flexible
- **Lot parent** : B — **Groupe Stitch lié** : 2, 4
- **Description** : Gestion d'un catalogue produit avec champs personnalisables, adaptable à n'importe quel secteur commercial.
- **User story** : "En tant que commerçant, je veux définir mes propres champs (taille, couleur, unité), afin que le catalogue s'adapte à ce que je vends réellement."
- **Règles métier** : un produit appartient à l'organisation (catalogue partagé entre boutiques) ; les champs additionnels sont stockés en `jsonb` sans migration de schéma nécessaire.
- **Table(s) Supabase** : `products (id, organization_id, name, category, price, custom_fields jsonb)`
- **RLS Policy** : isolation `organization_id`
- **Événement tracké** : `product_created`
- **États possibles** : actif / archivé
- **Critère de validation** : un produit créé avec des champs personnalisés (ex. taille+couleur pour du textile, unité pour de l'épicerie) s'affiche correctement dans le catalogue et lors d'une vente.
- **Priorité MVP** : Bloquant *(c'est le cœur de la différenciation)*
- **Edge cases** : produit archivé pendant qu'il est dans une vente en cours.
- **Risque sécurité** : aucun spécifique au-delà de l'isolation standard.

### 📋 FONCTIONNALITÉ : Gestion des Ventes & Facturation
- **Lot parent** : B — **Groupe Stitch lié** : 2
- **Description** : Enregistrement d'une vente et génération automatique de la facture.
- **User story** : "En tant que staff, je veux enregistrer une vente en quelques taps, afin que le stock et la facture soient à jour immédiatement."
- **Règles métier** : une vente est rattachée à une boutique précise ; sa clôture décrémente le stock de cette boutique et génère la facture.
- **Table(s) Supabase** : `sales (id, shop_id, organization_id, total, payment_method, created_by, created_at)`, `sale_items (id, sale_id, product_id, quantity, unit_price)`, `invoices (id, organization_id, shop_id, sale_id, pdf_url, issued_at)`
- **RLS Policy** : règle spécifique boutique (Section 6) — `owner`/`admin` voient toutes les boutiques, `member` uniquement les siennes
- **Événement tracké** : `sale_created`, `invoice_generated`
- **États possibles** : en cours / clôturée / annulée
- **Critère de validation** : un `member` assigné à la boutique A ne peut ni voir ni créer de vente sur la boutique B de la même organisation.
- **Priorité MVP** : Bloquant
- **Edge cases** : vente clôturée sans connexion (sauvegarde locale, synchronisation différée).
- **Risque sécurité** : un staff accède aux ventes d'une boutique à laquelle il n'est pas assigné → contre-mesure : RLS spécifique boutique testée par suite Playwright dédiée.

### 📋 FONCTIONNALITÉ : Stock/Inventaire par Boutique
- **Lot parent** : B — **Groupe Stitch lié** : 2
- **Description** : Suivi du stock disponible par produit et par boutique, avec alerte de seuil bas.
- **User story** : "En tant que commerçant, je veux voir mon stock par boutique en temps réel, afin de ne jamais être en rupture."
- **Règles métier** : le stock est décrémenté automatiquement à chaque vente clôturée ; un seuil d'alerte est configurable par produit.
- **Table(s) Supabase** : `inventory (id, shop_id, product_id, quantity, low_stock_threshold, updated_at)`
- **RLS Policy** : règle spécifique boutique (Section 6)
- **Événement tracké** : `low_stock_alert_triggered`
- **États possibles** : n/a (valeur numérique)
- **Critère de validation** : après une vente clôturée, la quantité en stock diminue exactement de la quantité vendue, visible uniquement pour la boutique concernée.
- **Priorité MVP** : Bloquant
- **Edge cases** : vente simultanée sur le dernier article en stock depuis deux appareils (verrouillage transactionnel nécessaire).
- **Risque sécurité** : aucun au-delà de l'isolation boutique.

### 📋 FONCTIONNALITÉ : Abonnement & Paiement (avec limite de boutiques par tier)
- **Lot parent** : C — **Groupe Stitch lié** : 3
- **Description** : Abonnement mensuel/annuel via Stripe ou mobile money, avec paywall lié au nombre de boutiques.
- **User story** : "En tant que propriétaire, je veux payer avec Mobile Money ou ma carte, mensuellement ou annuellement, afin de choisir ce qui me convient."
- **Règles métier** : Starter = 1 boutique max ; Pro = jusqu'à 3 ; Enterprise = illimité ; tentative de dépasser la limite déclenche une invite à l'upgrade.
- **Table(s) Supabase** : `subscriptions (id, organization_id, plan_tier, billing_period, status, payment_method, renewal_date, stripe_customer_id, mobile_money_ref)`
- **RLS Policy** : isolation `organization_id`, lecture réservée à `owner`
- **Événement tracké** : `subscription_started`, `subscription_upgraded`, `payment_failed`
- **États possibles** : essai / actif / en retard / annulé
- **Critère de validation** : la création d'une boutique au-delà de la limite du tier actuel est bloquée avec un message d'upgrade clair.
- **Priorité MVP** : Bloquant
- **Edge cases** : rétrogradation de tier alors que le nombre de boutiques actuel dépasse la nouvelle limite (boutiques excédentaires passées en lecture seule, jamais supprimées automatiquement).
- **Risque sécurité** : contournement de la limite de boutiques via appel API direct → contre-mesure : vérification du nombre de boutiques côté serveur à chaque création, pas seulement côté interface.

### 📋 FONCTIONNALITÉ : Invitation & Gestion des Rôles par Boutique
- **Lot parent** : E — **Groupe Stitch lié** : 5
- **Description** : Invitation de staff avec assignation à une ou plusieurs boutiques précises.
- **User story** : "En tant que propriétaire, je veux assigner chaque employé à sa boutique, afin qu'il n'accède qu'à ce qui le concerne."
- **Règles métier** : seul `owner`/`admin` peut inviter ; un `member` est obligatoirement assigné à au moins une boutique à l'acceptation de l'invitation.
- **Table(s) Supabase** : `invitations (id, organization_id, phone_or_email, role, shop_ids uuid[], invited_by, status, created_at)`, `shop_staff (id, shop_id, user_id)`
- **RLS Policy** : isolation `organization_id` sur `invitations`, écriture réservée `owner`/`admin`
- **Événement tracké** : `member_invited`, `member_joined`
- **États possibles** : en attente / acceptée / expirée
- **Critère de validation** : à l'acceptation, l'utilisateur apparaît dans `shop_staff` uniquement pour les boutiques listées dans l'invitation.
- **Priorité MVP** : Important
- **Edge cases** : invitation à plusieurs boutiques à la fois.
- **Risque sécurité** : élévation de privilège si un `member` s'auto-assigne une boutique → contre-mesure : contrainte RLS empêchant toute écriture directe sur `shop_staff` hors du flux d'invitation validé par `owner`/`admin`.

### 📋 FONCTIONNALITÉ : Export & Suppression de Données (RGPD)
- **Lot parent** : E — **Groupe Stitch lié** : 5
- *(Identique en principe à la fiche équivalente du projet TchopFlow — export/suppression transverse à toutes les boutiques de l'organisation, délai de grâce de 30 jours avant purge.)*
- **Priorité MVP** : Important

---

## SECTION 9 — SCHÉMA SUPABASE COMPLET

```sql
-- ═══════════════════════════════════════
-- SOCLE MULTI-TENANT + MULTI-BOUTIQUES
-- ═══════════════════════════════════════

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_tier text default 'starter',
  owner_id uuid references auth.users not null,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

create table shops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  name text not null,
  address text,
  created_at timestamptz default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  user_id uuid references auth.users not null,
  role text check (role in ('owner','admin','member')) default 'member',
  invited_at timestamptz default now(),
  joined_at timestamptz,
  unique(organization_id, user_id)
);

create table shop_staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops not null,
  user_id uuid references auth.users not null,
  unique(shop_id, user_id)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  user_id uuid references auth.users,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  phone_or_email text not null,
  role text check (role in ('admin','member')) default 'member',
  shop_ids uuid[] default '{}',
  invited_by uuid references auth.users not null,
  status text check (status in ('pending','accepted','expired')) default 'pending',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- TABLES MÉTIER
-- ═══════════════════════════════════════

create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  name text not null,
  category text,
  price numeric(10,2) not null,
  custom_fields jsonb default '{}',
  status text check (status in ('active','archived')) default 'active',
  created_at timestamptz default now()
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops not null,
  product_id uuid references products not null,
  quantity int not null default 0,
  low_stock_threshold int default 5,
  updated_at timestamptz default now(),
  unique(shop_id, product_id)
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops not null,
  organization_id uuid references organizations not null,
  status text check (status in ('in_progress','closed','cancelled')) default 'in_progress',
  total numeric(10,2),
  payment_method text check (payment_method in ('cash','card','mobile_money')),
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales not null,
  product_id uuid references products not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null,
  shop_id uuid references shops not null,
  sale_id uuid references sales not null,
  pdf_url text,
  status text check (status in ('issued','cancelled')) default 'issued',
  issued_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations not null unique,
  plan_tier text check (plan_tier in ('starter','pro','enterprise')) default 'starter',
  billing_period text check (billing_period in ('monthly','annual')) default 'monthly',
  status text check (status in ('trialing','active','past_due','canceled')) default 'trialing',
  payment_method text check (payment_method in ('card','mobile_money')),
  stripe_customer_id text,
  mobile_money_ref text,
  renewal_date timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════

alter table organizations enable row level security;
alter table shops enable row level security;
alter table organization_members enable row level security;
alter table shop_staff enable row level security;
alter table audit_logs enable row level security;
alter table invitations enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table invoices enable row level security;
alter table subscriptions enable row level security;

-- Tables niveau organisation
create policy "org_isolation" on shops for all using (
  organization_id in (select organization_id from organization_members where user_id = auth.uid())
);
create policy "org_isolation" on products for all using (
  organization_id in (select organization_id from organization_members where user_id = auth.uid())
);
create policy "org_isolation" on subscriptions for all using (
  organization_id in (select organization_id from organization_members where user_id = auth.uid())
);
create policy "org_isolation" on invitations for all using (
  organization_id in (select organization_id from organization_members where user_id = auth.uid())
);
create policy "org_isolation" on audit_logs for all using (
  organization_id in (select organization_id from organization_members where user_id = auth.uid())
);

-- Tables niveau boutique (owner/admin voient tout, member scopé à shop_staff)
create policy "shop_scoped" on inventory for all using (
  shop_id in (
    select s.id from shops s
    join organization_members om on om.organization_id = s.organization_id
    where om.user_id = auth.uid() and om.role in ('owner','admin')
  )
  or shop_id in (select shop_id from shop_staff where user_id = auth.uid())
);
create policy "shop_scoped" on sales for all using (
  shop_id in (
    select s.id from shops s
    join organization_members om on om.organization_id = s.organization_id
    where om.user_id = auth.uid() and om.role in ('owner','admin')
  )
  or shop_id in (select shop_id from shop_staff where user_id = auth.uid())
);
create policy "shop_scoped" on invoices for all using (
  shop_id in (
    select s.id from shops s
    join organization_members om on om.organization_id = s.organization_id
    where om.user_id = auth.uid() and om.role in ('owner','admin')
  )
  or shop_id in (select shop_id from shop_staff where user_id = auth.uid())
);
create policy "shop_scoped" on sale_items for all using (
  sale_id in (
    select id from sales where shop_id in (
      select s.id from shops s
      join organization_members om on om.organization_id = s.organization_id
      where om.user_id = auth.uid() and om.role in ('owner','admin')
      union
      select shop_id from shop_staff where user_id = auth.uid()
    )
  )
);
create policy "org_isolation" on shop_staff for all using (
  shop_id in (select id from shops where organization_id in (
    select organization_id from organization_members where user_id = auth.uid()
  ))
);
```

**Relations (schéma visuel) :**
```
organizations (1) ── (N) shops
organizations (1) ── (N) organization_members
organizations (1) ── (N) products
shops (1) ── (N) inventory (N) ── (1) products
shops (1) ── (N) sales (N) ── (N) products [via sale_items]
sales (1) ── (1) invoices
shops (1) ── (N) shop_staff (N) ── (1) auth.users
organizations (1) ── (1) subscriptions
```

**Storage buckets :**
- `invoices` : PDF de factures, isolé par `organization_id/shop_id/invoice_id.pdf`
- `product-images` *(optionnel post-MVP)* : photos produits, isolé par `organization_id/`

---

**Fin de la Partie 2/3.** L'architecture multi-boutiques (`shops` + `shop_staff` + RLS scopée) est la pièce structurante de tout le produit — dis-moi si elle te convient, et j'enchaîne sur la **Partie 3/3** : architecture technique, plan d'exécution Antigravity et roadmap de valorisation.
