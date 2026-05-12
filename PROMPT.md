# CONTEXTE DU PROJET

Tu travailles sur une application web existante, partiellement developpee, qui necessite
d'etre completee, corrigee et etendue selon les specifications de ce document.
Avant de toucher quoi que ce soit, tu dois :

1. Lire PROJECT_PROGRESS.txt s'il existe pour connaitre l'etat exact du projet.
2. Parcourir l'arborescence du projet existant pour evaluer ce qui est deja en place.
3. Evaluer chaque fichier existant par rapport aux conventions definies dans ce document.
4. Ne jamais regenerer ce qui est deja correct et marque [DONE] dans PROJECT_PROGRESS.txt.
5. Signaler ce qui doit etre corrige avant de le corriger.

Si PROJECT_PROGRESS.txt n'existe pas, le creer immediatement avec la structure
decrite dans la section "Trace de progression" avant de faire quoi que ce soit d'autre.

---

# VUE D'ENSEMBLE

Application web de gestion des projets de fin d'etude (PFE) dans les universites algeriennes.
Le systeme remplace un processus entierement manuel : affectations dans des fichiers Excel,
validations par email ou courrier papier, plannings de soutenance par affichage physique.
Le but est de centraliser et structurer l'ensemble du processus PFE sur une plateforme web.

---

# STACK TECHNIQUE

- Framework : SvelteKit (frontend + backend dans le meme projet)
- Base de donnees : SQLite via Drizzle ORM en developpement, PostgreSQL via Supabase en production
- Authentification : Auth.js, Google OAuth pour etudiants et enseignants, email/mot de passe pour entreprises
- Validation : Zod v4 (import depuis zod/v4), schemas partages serveur et client, types inferres avec z.infer
- CSS : brut, zero Tailwind, zero librairie UI externe
- Langage du code : anglais. Langage de l'UI : francais

---

# ARCHITECTURE

## Principes Généraux

- Zero redondance. Toute logique partagee va dans $lib. Tout composant reutilisable va dans
  $lib/components/ui. Aucune fonction ni composant ne se repete entre deux fichiers.
- Separation stricte frontend/backend. Les use-cases et repositories ne sont jamais importes
  cote client. Le client passe uniquement par +page.server.ts ou /api.
- Chaque page a un +page.server.ts sans exception.
- Les use-cases sont appeles uniquement depuis +page.server.ts ou +server.ts,
  jamais depuis un composant Svelte.

## Arborescence cible

```
src/
  app.d.ts
  app.html
  hooks.server.ts
  lib/
    assets/
    client/
      api/                        <- fonctions fetch cote client si necessaire
    components/
      ui/                         <- composants reutilisables (Button, Input, Modal, Table...)
      admin/                      <- composants specifiques admin (non reutilisables)
      teacher/                    <- composants specifiques enseignant
      student/                    <- composants specifiques etudiant
      company/                    <- composants specifiques entreprise
    constants/
    server/
      auth/                       <- Auth.js, sessions, guards, roles
      db/                         <- client Drizzle, schema, migrations
      repositories/
        port.ts                   <- interfaces (ports)
        factory.ts                <- swap Drizzle/Supabase selon l'env
        [entity].repo.ts          <- type du repo
        impl/
          drizzle/                <- implementation Drizzle (dev)
          supabase/               <- implementation Supabase (prod)
      use-cases/
        admin/
        teacher/
        student/
        company/
        shared/                   <- notifications, audit (utilises par tous les roles)
      validators/                 <- schemas Zod partages serveur/client
    styles/
      app.css
      reset.css
      typography.css
      fonts/
      tokens/
        primitives.css            <- valeurs brutes (couleurs, espacements, tailles)
        semantic.css              <- variables semantiques (--color-primary, --spacing-md...)
        settings.css              <- configuration globale
    types/
      domain.ts                   <- types metier
      database.ts                 <- types base de donnees
    utils/
  routes/
    (admin)/                      <- groupe de routes admin
    (teacher)/                    <- groupe de routes enseignant
    (student)/                    <- groupe de routes etudiant
    (company)/                    <- groupe de routes entreprise
    (app)/                        <- routes publiques
    api/                          <- endpoints REST purs (+server.ts uniquement)
    auth/                         <- callbacks Auth.js
    dev/                          <- mode developpement (selecteur de compte)
```

## Pattern repository

Chaque entite a une interface (port) definie dans port.ts. Deux implementations coexistent :
Drizzle pour le developpement local (SQLite), Supabase pour la production (PostgreSQL).
La factory.ts instancie la bonne implementation selon la variable d'environnement.
Swapper de Drizzle a Supabase ne necessite aucune modification en dehors du DB layer.

## Authentification

- Etudiants et enseignants : Google OAuth via Auth.js. A la connexion, l'email Google est matche
  avec la base de donnees. Si l'email n'existe pas, acces refuse.
- Les comptes enseignants et etudiants sont importes par l'admin via fichier CSV.
- Entreprises : email + mot de passe. Une entreprise peut avoir N employes independants.
  Le premier employe cree l'entreprise (soumise a validation admin), puis cree son compte.
  Les employes suivants se rattachent a l'entreprise existante via autocomplete.
- Mode developpement : un selecteur de compte fictif permet de se connecter sans Google OAuth,
  accessible uniquement quand NODE_ENV=development.

---

# CONVENTIONS DE CODE

## Architecture et separation des responsabilites

- Les use-cases sont appeles uniquement depuis +page.server.ts ou +server.ts,
  jamais depuis un composant Svelte.
- Les +page.server.ts sont presents sur toutes les pages sans exception.
- Toute fonction utilitaire partagee va dans $lib/utils.
- Aucune fonction n'est declaree deux fois dans deux fichiers differents.

## Composants

- Tout composant utilise dans plus d'un endroit va dans $lib/components/ui.
- Si un composant similaire existe deja, on l'etend avec des props plutot que d'en creer un nouveau.
- Zero redondance entre les fichiers .svelte : aucun style, aucune fonction, aucun bloc HTML
  ne se repete entre deux fichiers.
- Les composants existants sont evalues au cas par cas : gardes si propres, refaits si non conformes
  aux conventions definies ici.

## Validation

- Zod v4 (import depuis zod/v4).
- Les schemas sont definis dans $lib/server/validators/ et peuvent etre importes cote client.
- Chaque schema exporte son type infere avec z.infer.
- Les messages d'erreur sont en francais dans l'UI, en anglais dans le code.

## Types

- Les types metier sont dans $lib/types/domain.ts.
- Les types base de donnees sont dans $lib/types/database.ts.

## CSS

- Zero Tailwind, zero librairie CSS externe.
- Toutes les valeurs (couleurs, espacements, tailles, transitions) passent par les CSS custom
  properties definies dans les fichiers tokens : primitives.css (valeurs brutes),
  semantic.css (variables semantiques), settings.css (configuration globale).
- CSS nesting natif dans les balises <style> Svelte, sans lang="scss".
- Les elements HTML sont selectionnes directement sans classnames inutiles.
  Les classnames ne sont utilises que pour les variantes et etats (ex. .is-active, .variant-danger).
- Les media queries sont ecrites directement dans le bloc CSS concerne.

  Correct :
  table {
    width: 100%;

    tr {
      border-bottom: 1px solid var(--color-border);

      td {
        padding: var(--spacing-sm);
      }
    }
  }

  .actions {
    display: flex;

    @media screen and (max-width: 665px) {
      & {
        display: none;
      }
    }
  }

  Incorrect :
  .my-table { width: 100%; }
  .my-table .table-row { border-bottom: ... }
  .my-table .table-row .table-cell { padding: ... }

## Conventions Générales

- Anglais pour tout le code : noms de fichiers, fonctions, variables, commentaires.
- Français uniquement pour l'UI : labels, messages, placeholders, notifications.
- Zero caractere non standard dans le code : pas de tirets longs, pas d'emojis,
  pas de caracteres speciaux dans les noms de variables ou commentaires.

---

# ROLES

Quatre roles : Admin, Enseignant, Etudiant, Entreprise.
L'Admin herite de toutes les fonctionnalites de l'Enseignant.
Il est unique et peut transferer son role a un compte enseignant.

---

# PROFILS

## Enseignant
- Nom, prenom, email (matching Google OAuth)
- Specialite (ex. ISIL, Chimie...)
- Grade : Assistant < MAB < MAA < MCB < MCA < Professeur
- Statut de disponibilite : disponible | indisponible | indisponible_jusqu_au (date)
  Le statut repasse automatiquement a disponible une fois la date atteinte.

## Etudiant
- Nom, prenom, email (matching Google OAuth)
- Specialite (filtre le catalogue de sujets)
- Promotion (entite a part, ex. "Promotion ISIL 2024-2025")

## Entreprise
- Raison sociale
- Statut : en_attente | validee
- N employes rattaches, chacun avec email et mot de passe

---

# ENTITES METIER

## Annee universitaire
- Dates d'ouverture et de cloture des dépôts
- Delais de validation
- Les sujets PFE expirent a la cloture de l'annee

## Promotion
- Rattachee a une specialite et une annee universitaire
- Permet de regrouper et filtrer les etudiants et leurs PFE

## Sujet PFE
- Titre, description, specialite(s), type de groupe (monome | binome | trinome)
- Propose par un enseignant ou une entreprise
- Lie a une annee universitaire (expire a sa cloture)
- Statut : en_attente | valide | refuse | expire
- Un sujet refuse peut etre corrige et resoumis

## PFE (affectation)
- Lie a un sujet valide, une annee universitaire, un groupe d'etudiants (1 a 3)
- Un etudiant peut avoir plusieurs PFE sur plusieurs annees (redoublement)
- Statut : en_cours | soutenance_planifiee | valide | refuse

## Journal de suivi
- entrées de reunion : date, notes, avancement
- Ajoutees par l'etudiant ou l'encadreur
- Lie a un PFE

## Soutenance
- Date, heure, salle
- Jury : president + membre (deux enseignants)
- Chacun saisit sa note independamment (4 criteres fixes sur 5, total sur 20)
- Si ecart <= 1 point : note finale validee automatiquement
- Si ecart > 1 point : le president tranche (sa note | note du membre | moyenne)

---

# FONCTIONNALITES PAR ROLE

## Admin (herite de Enseignant)

Gestion des utilisateurs
- Creer, modifier, desactiver les comptes (enseignants, etudiants, entreprises)
- Importer les comptes via CSV
- Confirmer les demandes d'inscription des entreprises
- Transferer le role admin a un enseignant

Configuration
- Paramètrer les annees universitaires (dates, delais)
- Gérer les promotions, departements, spécialités
- Configurer le nombre maximum de voeux par etudiant

Gestion des sujets
- Recevoir les notifications de refus d'un sujet
- Debloquer manuellement un sujet bloque en validation
- Choisir les deux enseignants validateurs d'un sujet soumis

Gestion des soutenances
- Selectionner deux enseignants parmi une liste recommandee filtre selon 4 criteres :
  statut disponible, specialite compatible, pas de chevauchement horaire, pas l'encadreur du PFE
- Designer lequel est president du jury
- Planifier les soutenances (date, heure, salle)
- Archiver les PFE admis, Gérer les corrections

Exports et statistiques
- Exporter en Excel ou PDF (affectations, plannings, statistiques)
- Tableau de bord : volume PFE, taux de validation, delais, repartition par specialite/encadrement
- Charge d'encadrement : etudiants par enseignant, enseignants sans etudiant, entreprises non pourvues
- Soutenance : prevues vs realisees, repartition des notes, PFE dans les delais vs en retard
- Tendances annuelles : volume, partenariats entreprises, charge par promotion

Audit
- Journal d'activité : type d'action (enum), description lisible, horodatage, acteur
- Acces a toutes les donnees tous departements confondus

Calendrier
- Vue calendrier de toutes les soutenances planifiees (affichage uniquement)

## Enseignant

Sujets
- Proposer un sujet (titre, description, specialite(s), type de groupe)
- Valider les sujets soumis par d'autres enseignants ou entreprises de meme specialite
  Decision : accepte | accepte_sous_reserve | refuse
  En cas de refus : notification automatique a l'admin
- Etre notifie quand un sujet en attente lui est assigne pour validation

Encadrement
- Consulter la liste des etudiants ayant mis son sujet en voeu
- Choisir manuellement le ou les etudiants a affecter (dans la limite du type de groupe)
- Assurer le role de co-promoteur pour les PFE externes (entreprise encadreur)
- Renseigner le journal de suivi lors des reunions
- Consulter sa charge d'encadrement

Disponibilite
- Indiquer son statut : disponible | indisponible | indisponible_jusqu_au (date)

Soutenance et notation
- Participer comme membre ou president de jury
- Saisir sa note (4 criteres fixes sur 5, total sur 20)
- En tant que president : trancher en cas de desaccord (sa note | note membre | moyenne)
- Consulter l'historique des PFE encadres

Calendrier
- Vue calendrier de toutes ses soutenances et reunions (affichage uniquement)

## Etudiant

Catalogue et voeux
- Consulter le catalogue des sujets valides filtres par sa specialite
- Soumettre une liste de voeux sans ordre de priorite (limite configuree par l'admin)
- Etre notifie quand un encadreur l'accepte ou le refuse

Suivi
- Suivre l'etat de son PFE (en_cours | soutenance_planifiee | valide | refuse)
- Ajouter des entrées de reunion dans le journal de suivi (date, notes, avancement)

Soutenance
- Consulter sa note finale et la decision du jury
- Soumettre une reclamation (message texte a l'admin) en cas de contestation

Calendrier
- Vue calendrier de son rendez-vous de soutenance (affichage uniquement)

## Entreprise

Inscription
- Creer un compte entreprise (soumis a validation admin)
- Les employes suivants se rattachent via autocomplete

Sujets
- Proposer des sujets (titre, description, specialite(s), type de groupe)
- Suivre l'etat de ses propositions : en_attente | valide | affecte | non_pourvu

Encadrement
- Consulter la liste des etudiants ayant mis son sujet en voeu
- Choisir manuellement le ou les etudiants a affecter
- Renseigner le journal de suivi conjointement avec l'enseignant co-promoteur

Notifications
- Etre notifiee de l'avancement du PFE et du calendrier de soutenance

---

# WORKFLOWS

## Validation d'un sujet

1. Enseignant ou entreprise soumet un sujet
2. L'admin choisit deux enseignants validateurs de la meme specialite que le sujet
3. Chaque validateur rend sa decision : accepte | accepte_sous_reserve | refuse
4. Si refus : notification a l'admin
5. Si les deux validations sont obtenues : sujet publie dans le catalogue
6. Si refuse : l'auteur peut corriger et resoumettre

## Affectation d'un etudiant

1. Etudiant consulte le catalogue filtre par sa specialite
2. Il soumet une liste de voeux (sans ordre de priorite, dans la limite configuree)
3. L'encadreur consulte tous les etudiants ayant mis son sujet en voeu
4. Il choisit manuellement le ou les etudiants (monome / binome / trinome)
5. L'etudiant est notifie de l'acceptation ou du refus

## Constitution du jury

1. L'admin planifie une soutenance
2. Le systeme affiche une liste recommandee d'enseignants eligibles filtree selon 4 criteres :
   statut disponible, specialite compatible, pas de chevauchement horaire, pas l'encadreur du PFE
3. L'admin selectionne deux enseignants et designe lequel est president

## Notation

1. Le president et le membre saisissent leurs notes independamment
2. Chaque note = 4 criteres fixes, chacun sur 5, total sur 20
3. Si ecart <= 1 point : note finale validee automatiquement
4. Si ecart > 1 point : le president tranche (sa note | note du membre | moyenne)
5. La note finale est rendue visible a l'etudiant

---

# NOTIFICATIONS

Declencheur                          | Emetteur | Destinataire
-------------------------------------|----------|---------------------
Sujet assigne pour validation        | Systeme  | Enseignant validateur
Sujet refuse par un validateur       | Systeme  | Admin
Etudiant accepte sur un voeu         | Systeme  | Etudiant
Etudiant refuse sur un voeu          | Systeme  | Etudiant
Designation comme membre/president   | Systeme  | Enseignant
Soutenance planifiee                 | Systeme  | Etudiant
Soutenance planifiee                 | Systeme  | Entreprise
Note finale disponible               | Systeme  | Etudiant
Nouvelle inscription entreprise      | Systeme  | Admin
Inscription entreprise acceptee      | Systeme  | Entreprise
Inscription entreprise refusee       | Systeme  | Entreprise

---

# JOURNAUX d'activité (AUDIT LOGS)

Chaque action significative est enregistree avec :
- type : enum (SUBJECT_SUBMITTED, SUBJECT_VALIDATED, SUBJECT_REFUSED, STUDENT_ASSIGNED,
         JURY_ASSIGNED, DEFENSE_SCHEDULED, GRADE_SUBMITTED, GRADE_VALIDATED,
         COMPANY_REGISTERED, WISH_SUBMITTED, NOTIFICATION_SENT, CSV_IMPORTED, ROLE_TRANSFERRED)
- description : texte lisible (ex. "Prof. X a affecte l'etudiant Y au PFE Z")
- horodatage
- acteur (utilisateur qui a declenche l'action)

---

# PAGES DE L'APPLICATION

## Authentification

/accounts/login/+page.svelte
- Bouton "Se connecter avec Google" (pour etudiants et enseignants)
- Lien vers /accounts/company/login

/accounts/company/login/+page.svelte
- Formulaire email + mot de passe (entreprise)
- Lien vers /accounts/company/create

/accounts/company/create/+page.svelte
- Formulaire de creation de compte entreprise :
  nom de l'entreprise (autocomplete sur les entreprises existantes),
  email, mot de passe, confirmation mot de passe
- Si l'entreprise n'existe pas dans l'autocomplete : champ creation d'une nouvelle entreprise
- Message d'information : compte soumis a validation admin

/dev/login/+page.svelte (NODE_ENV=development uniquement)
- Selecteur de compte fictif : liste de comptes par role (admin, enseignant, etudiant, entreprise)
- Bouton "Se connecter en tant que [nom]"
- Aucune authentification reelle, session injectee directement

## Etudiant

/(student)/student/dashboard/+page.svelte
- Carte de statut du PFE actuel (en cours | soutenance planifiee | valide | pas encore affecte)
- Nombre de voeux soumis / maximum autorise
- Prochaine soutenance si planifiee (date, heure, salle)
- Liste des dernieres notifications (3 max, lien vers toutes)
- Raccourcis : "Consulter le catalogue", "Mes voeux", "Mon PFE"

/(student)/student/catalogue/+page.svelte
- Liste des sujets valides filtres automatiquement par la specialite de l'etudiant
- Filtres : type de groupe (monome, binome, trinome), encadreur (enseignant | entreprise)
- Barre de recherche par titre ou mot-cle
- Chaque sujet affiche : titre, encadreur, type de groupe, nombre de places restantes
- Bouton "Voir le detail" sur chaque sujet
- Indication visuelle si le sujet est deja dans les voeux de l'etudiant

/(student)/student/catalogue/[id]/+page.svelte
- Detail complet du sujet : titre, description, encadreur, specialite, type de groupe
- Statut des places (ex. "1 place restante sur 2")
- Bouton "Ajouter a mes voeux" (desactive si quota atteint ou sujet deja dans les voeux)
- Message si l'etudiant est deja affecte a un PFE (plus possible de soumettre des voeux)

/(student)/student/voeux/+page.svelte
- Liste des sujets dans les voeux de l'etudiant
- Statut de chaque voeu : en_attente | accepte | refuse
- Bouton "Retirer" sur chaque voeu (si pas encore de decision)
- Indicateur du quota : "X voeux sur Y maximum"
- Message si l'etudiant a ete accepte sur un sujet : lien vers "Mon PFE"

/(student)/student/my-pfe/+page.svelte
- Informations du sujet affecte : titre, description, encadreur, co-promoteur si applicable
- Statut du PFE : en_cours | soutenance_planifiee | valide | refuse
- Section journal de suivi :
  liste des entrées de reunion (date, notes, avancement)
  formulaire d'ajout d'une nouvelle entrée (date, notes, avancement)
- Bouton "Soumettre une reclamation" (ouvre une modale avec un champ texte)

/(student)/student/soutenance/+page.svelte
- Informations de la soutenance : date, heure, salle
- Composition du jury : president et membre
- Note finale (affichee uniquement si disponible) : detail par critere + total
- Decision du jury : valide | refuse | corrections requises
- Message si soutenance pas encore planifiee

/(student)/student/notifications/+page.svelte
- Liste complete des notifications avec horodatage
- Badge de type : affectation | validation | soutenance | reclamation
- Marquage lu/non lu

## Enseignant

/(teacher)/teacher/dashboard/+page.svelte
- Nombre d'etudiants encadres actuellement
- Nombre de sujets en attente de validation (de la meme specialite)
- Prochaines soutenances ou il est jury (2 max, lien vers tout voir)
- Statut de disponibilite actuel avec bouton de modification rapide
- Raccourcis : "Mes sujets", "Sujets a valider", "Mes encadrements"

/(teacher)/teacher/proposed-subjects/+page.svelte
- Liste des sujets proposes par l'enseignant avec statut :
  en_attente | valide | refuse | expire
- Bouton "Proposer un nouveau sujet"
- Bouton "Voir les candidats" sur les sujets valides
- Bouton "Modifier et resoumettre" sur les sujets refuses

/(teacher)/teacher/proposed-subjects/new/+page.svelte
- Formulaire : titre, description (textarea), specialite(s) (multiselect),
  type de groupe (monome | binome | trinome)
- Bouton "Soumettre"

/(teacher)/teacher/proposed-subjects/[id]/candidats/+page.svelte
- Liste des etudiants ayant mis ce sujet dans leurs voeux
- Pour chaque etudiant : nom, prenom, specialite, promotion
- Case a cocher pour selectionner (dans la limite du type de groupe)
- Bouton "Confirmer l'affectation" (desactive si selection depasse le type de groupe)
- Indication : "Ce sujet accepte X etudiant(s)"

/(teacher)/teacher/subjects-to-validate/+page.svelte
- Liste des sujets en attente de validation de la meme specialite
- Pour chaque sujet : titre, auteur, type de groupe, date de soumission
- Bouton "Examiner" sur chaque sujet

/(teacher)/teacher/subjects-to-validate/[id]/+page.svelte
- Detail complet du sujet : titre, description, auteur, specialite, type de groupe
- Formulaire de decision : accepte | accepte_sous_reserve | refuse
- Champ commentaire (obligatoire si refuse ou sous reserve)
- Bouton "Soumettre la decision"

/(teacher)/teacher/supervised-pfes/+page.svelte
- Liste des PFE encadres (annee en cours)
- Pour chaque PFE : nom(s) etudiant(s), titre du sujet, statut, derniere entrée journal
- Bouton "Voir le detail"
- Onglet "Historique" : PFE encadres les annees precedentes

/(teacher)/teacher/supervised-pfes/[id]/+page.svelte
- Informations du PFE : titre, etudiant(s), statut
- Journal de suivi : liste des entrées (date, notes, avancement, auteur), formulaire d'ajout
- Si co-promoteur : indication de l'entreprise co-encadrante

/(teacher)/teacher/availability/+page.svelte
- Statut actuel affiche
- Formulaire : trois options (disponible | indisponible | indisponible jusqu'au [date])
- Bouton "Enregistrer"

/(teacher)/teacher/jury-duties/+page.svelte
- Liste des soutenances ou l'enseignant est jury
- Pour chaque soutenance : date, heure, salle, PFE concerne, role (membre | president)
- Formulaire de saisie de note si soutenance passee :
  4 criteres sur 5 chacun, total calcule automatiquement sur 20
  si president et desaccord : choix entre sa note, note du membre, ou moyenne
- Statut de la note : non saisie | saisie | validee

/(teacher)/teacher/notifications/+page.svelte
- Liste complete des notifications avec horodatage
- Badge de type : validation_requise | affectation | jury | disponibilite
- Marquage lu/non lu

## Admin

/(admin)/admin/dashboard/+page.svelte
- Cartes : total PFE annee en cours, taux de validation, soutenances planifiees, PFE en retard
- Graphique repartition par specialite
- Graphique evolution du volume annuel de PFE
- Tableau des enseignants les plus charges (top 5)
- Alertes : sujets bloques en validation, entreprises en attente de validation
- Raccourcis vers toutes les sections admin

/(admin)/admin/users/+page.svelte
- Onglets : Enseignants | Etudiants | Entreprises
- Enseignants : nom, email, specialite, grade, statut disponibilite, actions (modifier, desactiver)
- Etudiants : nom, email, specialite, promotion, statut PFE, actions
- Entreprises : raison sociale, statut, nombre d'employes, actions
- Bouton "Importer CSV" (enseignants et etudiants)
- Bouton "Creer un compte" (enseignants uniquement)
- Bouton "Valider" sur les entreprises en attente

/(admin)/admin/users/[id]/+page.svelte
- Formulaire de modification selon le type d'utilisateur
- Bouton "Transferer le role admin" (si enseignant)
- Bouton "Desactiver le compte"

/(admin)/admin/academic-years/+page.svelte
- Liste des annees universitaires avec statut (active | cloturee)
- Pour chaque annee : date d'ouverture, date de cloture, nombre de PFE
- Bouton "Creer une nouvelle annee"
- Bouton "Cloturer" sur l'annee active

/(admin)/admin/academic-years/new/+page.svelte
- Formulaire : libelle (ex. "2024-2025"), date d'ouverture, date de cloture
- Bouton "Creer"

/(admin)/admin/promotions/+page.svelte
- Liste des promotions avec specialite et annee universitaire
- Bouton "Creer une promotion"
- Bouton "Voir les etudiants" sur chaque promotion

/(admin)/admin/subjects/+page.svelte
- Liste de tous les sujets toutes annees confondues
- Filtres : statut, specialite, type d'encadreur
- Bouton "Assigner des validateurs" sur les sujets en attente
- Bouton "Debloquer" sur les sujets bloques

/(admin)/admin/subjects/[id]/+page.svelte
- Detail complet du sujet
- Statut de validation par validateur
- Formulaire d'assignation des validateurs (deux selects filtres par specialite)
- Historique des decisions de validation

/(admin)/admin/assignments/+page.svelte
- Liste de toutes les affectations etudiant-PFE de l'annee en cours
- Filtres : specialite, statut PFE, encadreur
- Pour chaque affectation : etudiant(s), sujet, encadreur, co-promoteur, statut

/(admin)/admin/defenses/+page.svelte
- Liste de toutes les soutenances (planifiees et passees)
- Filtres : date, specialite, statut
- Bouton "Planifier une soutenance"
- Bouton "Modifier" sur les soutenances planifiees

/(admin)/admin/defenses/new/+page.svelte
- Etape 1 : selectionner le PFE concerne
- Etape 2 : choisir date, heure, salle
- Etape 3 : selectionner le jury parmi la liste recommandee (filtre automatique),
  designation du president parmi les deux selectionnes
- Bouton "Confirmer la planification"

/(admin)/admin/defenses/[id]/+page.svelte
- Detail : PFE, date, heure, salle, jury
- Statut des notes : non saisies | partiellement saisies | validees | en_desaccord
- Note finale si disponible

/(admin)/admin/audit-log/+page.svelte
- Tableau : horodatage, type d'action, description, acteur
- Filtres : type d'action, acteur, plage de dates
- Recherche dans les descriptions

/(admin)/admin/exports/+page.svelte
- Export Excel ou PDF : affectations, plannings, statistiques
- Filtre par annee universitaire

/(admin)/admin/statistics/+page.svelte
- Volume PFE par annee (courbe)
- Repartition par specialite (barres)
- Repartition par type d'encadrement (camembert)
- Charge d'encadrement par enseignant (tableau)
- Taux de validation (entonnoir)
- PFE dans les delais vs en retard
- Evolution des partenariats entreprises
- Filtre par annee universitaire

## Entreprise

/(company)/company/dashboard/+page.svelte
- Nombre de sujets proposes / etudiants affectes
- Liste des sujets avec statut
- Dernieres notifications
- Raccourcis : "Proposer un sujet", "Mes encadrements"

/(company)/company/propose-subject/+page.svelte
- Formulaire : titre, description, specialite(s), type de groupe
- Bouton "Soumettre"
- Message : le sujet sera visible apres validation par deux enseignants

/(company)/company/my-subjects/+page.svelte
- Liste des sujets proposes avec statut et nombre de candidats
- Bouton "Voir les candidats" sur les sujets valides
- Bouton "Modifier et resoumettre" sur les sujets refuses

/(company)/company/my-subjects/[id]/candidats/+page.svelte
- Liste des etudiants ayant mis ce sujet en voeu
- Selection manuelle dans la limite du type de groupe
- Bouton "Confirmer l'affectation"

/(company)/company/supervised-pfes/+page.svelte
- Liste des PFE encadres : etudiant(s), sujet, co-promoteur, statut
- Bouton "Voir le detail"

/(company)/company/supervised-pfes/[id]/+page.svelte
- Informations du PFE : titre, etudiant(s), co-promoteur
- Journal de suivi : liste des entrées, formulaire d'ajout
- Statut et informations de soutenance si planifiee

/(company)/company/notifications/+page.svelte
- Liste complete avec horodatage
- Badge de type : affectation | soutenance | validation
- Marquage lu/non lu

---

# WORKFLOW ET PROGRESSION

## Ordre de construction strict

Le projet est construit par couches successives dans cet ordre. Ne jamais passer a la couche
suivante avant que la couche courante soit validee et confirmee.

Couche 1 : Infrastructure et DB layer
  - src/lib/server/db/schema.ts
  - src/lib/types/domain.ts et database.ts
  - src/lib/server/repositories/port.ts
  - src/lib/server/repositories/impl/drizzle/ (toutes les entites)
  - src/lib/server/repositories/impl/supabase/ (toutes les entites)
  - src/lib/server/repositories/factory.ts

Couche 2 : Use-cases
  - src/lib/server/use-cases/shared/ (notifications, audit) en premier
  - src/lib/server/use-cases/admin/
  - src/lib/server/use-cases/teacher/
  - src/lib/server/use-cases/student/
  - src/lib/server/use-cases/company/

Couche 3 : API et +page.server.ts
  - src/routes/api/ (endpoints purs)
  - +page.server.ts de chaque page, par role

Couche 4 : Composants UI de base
  - src/lib/components/ui/ (Button, Input, Modal, Table, Badge, etc.)

Couche 5 : Pages
  - Une page a la fois, par role

## Signal de fin de couche

Quand une couche est terminee, ecrire exactement :
"[COUCHE X TERMINEE] En attente de validation avant de continuer."
Ne jamais continuer vers la couche suivante sans confirmation explicite.

## Decoupage des instructions

- Une couche a la fois, un role a la fois dans cette couche.
- Pas plus de 3 a 5 fichiers par instruction.
- Si une instruction demande plus de 5 fichiers, le signaler et decouper en etapes
  avant de commencer.

## Verification avant chaque generation

Avant de generer un fichier, verifier dans PROJECT_PROGRESS.txt :
- Ce fichier est-il deja marque [DONE] ? Si oui, ne pas le recreer, proposer de le modifier.
- Les dependances de ce fichier sont-elles [DONE] ?
  Ex. ne pas generer un use-case si le repository qu'il utilise n'est pas [DONE].

## Contexte a chaque session

Au debut de chaque session :
1. Lire PROJECT_PROGRESS.txt pour connaitre l'etat exact du projet.
2. Parcourir l'arborescence du projet existant.
3. Ne jamais supposer ce qui existe sans avoir lu PROJECT_PROGRESS.txt.
4. Ne jamais regenerer ce qui est marque [DONE].

## Structure de PROJECT_PROGRESS.txt

Creer ce fichier a la racine du projet des le debut avec la structure suivante,
puis le mettre a jour apres chaque fichier termine :

---
PROJECT : Plateforme PFE
DERNIERE MISE A JOUR : [date et heure]

== COUCHE 1 : INFRASTRUCTURE ==
[ ] src/lib/server/db/schema.ts
[ ] src/lib/types/domain.ts
[ ] src/lib/types/database.ts
[ ] src/lib/server/repositories/port.ts
[ ] src/lib/server/repositories/factory.ts
[ ] src/lib/server/repositories/impl/drizzle/users.ts
[ ] src/lib/server/repositories/impl/drizzle/subjects.ts
[ ] src/lib/server/repositories/impl/drizzle/assignments.ts
[ ] src/lib/server/repositories/impl/drizzle/defenses.ts
[ ] src/lib/server/repositories/impl/drizzle/notifications.ts
[ ] src/lib/server/repositories/impl/drizzle/audit.ts
[ ] src/lib/server/repositories/impl/drizzle/progress.ts
[ ] src/lib/server/repositories/impl/supabase/users.ts
[ ] src/lib/server/repositories/impl/supabase/subjects.ts
[ ] src/lib/server/repositories/impl/supabase/assignments.ts
[ ] src/lib/server/repositories/impl/supabase/defenses.ts
[ ] src/lib/server/repositories/impl/supabase/notifications.ts
[ ] src/lib/server/repositories/impl/supabase/audit.ts
[ ] src/lib/server/repositories/impl/supabase/progress.ts

== COUCHE 2 : USE-CASES ==
[ ] src/lib/server/use-cases/shared/notifications.ts
[ ] src/lib/server/use-cases/shared/audit.ts
[ ] src/lib/server/use-cases/admin/assign-validators.ts
[ ] src/lib/server/use-cases/admin/constitute-jury.ts
[ ] src/lib/server/use-cases/admin/schedule-defense.ts
[ ] src/lib/server/use-cases/admin/archive-pfe.ts
[ ] src/lib/server/use-cases/admin/validate-subject.ts
[ ] src/lib/server/use-cases/teacher/propose-subject.ts
[ ] src/lib/server/use-cases/teacher/review-subject.ts
[ ] src/lib/server/use-cases/teacher/assign-student.ts
[ ] src/lib/server/use-cases/teacher/log-meeting.ts
[ ] src/lib/server/use-cases/teacher/submit-grade.ts
[ ] src/lib/server/use-cases/student/submit-wish.ts
[ ] src/lib/server/use-cases/student/remove-wish.ts
[ ] src/lib/server/use-cases/student/log-meeting.ts
[ ] src/lib/server/use-cases/company/propose-subject.ts
[ ] src/lib/server/use-cases/company/assign-student.ts
[ ] src/lib/server/use-cases/company/log-meeting.ts

== COUCHE 3 : API ET PAGE.SERVER.TS ==
[ ] ... (liste complete des +page.server.ts par role)

== COUCHE 4 : COMPOSANTS UI ==
[ ] src/lib/components/ui/Button.svelte
[ ] src/lib/components/ui/Input.svelte
[ ] src/lib/components/ui/Modal.svelte
[ ] src/lib/components/ui/Table.svelte
[ ] src/lib/components/ui/Badge.svelte
[ ] src/lib/components/ui/Notification.svelte
[ ] src/lib/components/ui/Calendar.svelte
[ ] src/lib/components/ui/Pagination.svelte

== COUCHE 5 : PAGES ==
[ ] ... (liste complete des pages par role)

== JOURNAL ==
[DONE] src/lib/server/db/schema.ts
- Tables creees : user, teacher, student, company, subject, pfe, defense, audit_log, notification
- Enums : UserRole, SubjectStatus, PfeStatus, AvailabilityStatus, DefenseDecision, TeacherGrade
- Relations definies entre toutes les tables
---

Regles strictes :
- Mis a jour apres chaque fichier termine, pas a la fin de la session.
- Chaque entrée [DONE] contient un resume de ce qui a ete fait (fonctions exportees,
  tables creees, composants exposes...).
- Ne jamais marquer [DONE] un fichier partiellement complete.
- Si une session est interrompue, marquer les fichiers non termines [IN PROGRESS]
  avec le detail de ce qui reste a faire.
