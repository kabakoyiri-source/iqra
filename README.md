# Complexe Scolaire IQRA — site & espaces parent / admin

Site de l'école franco-arabe **IQRA** (مجمع اقرأ المدرسي), construit sur le même modèle que le projet IMAKO IKASSO :
landing page, espace parent (inscription d'enfant, paiements, reçus, bulletins) et portail administration (encaissements, relances, classes, notes).

- **Arabe par défaut (RTL)**, bascule **français (LTR)** depuis le sélecteur « عربي / FR » présent sur toutes les pages.
  Le choix est mémorisé dans le cookie `iqra_lang`, lu côté serveur : la page arrive directement dans la bonne langue et la bonne direction.
- **Pas de backend pour l'instant** : les données vivent dans le `localStorage` du navigateur, initialisées avec un jeu de démonstration (seed).

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

## Comptes de démonstration

| Rôle      | E-mail                       | Mot de passe |
| --------- | ---------------------------- | ------------ |
| Direction | `admin@iqra.ml`              | `admin123`   |
| Parent    | `fatoumata.diallo@gmail.com` | `parent123`  |

Les autres parents du seed (`moussa.coulibaly@gmail.com`, `awa.traore@gmail.com`…) utilisent aussi `parent123`.
Le bouton ↺ du portail admin restaure les données de démonstration.

## Où modifier quoi

| Fichier                         | Contenu                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/school.ts`             | Téléphones, WhatsApp, Instagram, e-mail, **montants des frais**, matières  |
| `src/lib/i18n.ts`               | Tous les textes FR / AR (dates d'inscription comprises, clé `dates`)       |
| `src/lib/db.ts`                 | Types de données, seed de démonstration, lecture/écriture `localStorage`   |
| `src/context/SchoolContext.tsx` | Actions (inscription, connexion, paiements, relances, notes, classes)      |
| `src/app/globals.css`           | Palette IQRA (bleu → vert, lime), motif islamique, arches, impression      |
| `public/camp/`                  | Affiches du Camp Qur'an IQRAA (tirées du compte Instagram)                 |

Pour brancher Supabase plus tard, il suffit de remplacer les actions de `SchoolContext.tsx` (déjà asynchrones) par des appels réseau : les pages n'ont pas à changer.

## À confirmer par l'école

Les éléments suivants sont des **valeurs provisoires** : montants de scolarité / inscription / tenues, dates d'inscription et de rentrée,
adresse précise (seulement « Bamako — Mali » pour l'instant), e-mail de contact et intitulés des cycles.
