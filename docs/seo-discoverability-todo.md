# TODO technique — SEO, données structurées, maillage, découvrabilité IA

> Objectif client : « Strengthen metadata, SEO, structured data, internal linking,
> and AI/LLM discoverability so Outside Observations becomes the reference point
> for visual research. »
> Politique d'indexation retenue : pages indexées, fichiers images non (option B),
> avec dérogation par œuvre via un champ Sanity.

## 1. Socle (à faire en premier)

- [x] **Canonical unique par œuvre** — `generateMetadata` de
  `src/app/(pages)/archive/entry/[slug]/page.js` : choisir un slug canonique
  (`metadata.slug` prioritaire, sinon `slug`) et poser `alternates.canonical`.
  Les 2 500 entrées répondent aujourd'hui sur deux URLs.
- [x] **Alt text depuis `aiDescription`** — dans `ArchiveEntryMediaLink`,
  `ArchiveEntryContent`, `ArchiveVisualEssay` : `alt = aiDescription`
  (tronquée ~125 caractères), fallback `artName — source`.
- [x] **Titres/descriptions par œuvre** — `generateMetadata` entrée :
  `title = artName — artiste (année)`, `description` = extrait aiDescription.
- [x] **Crawlers vs archive fermée (3h-6h)** — `ClosedArchiveRedirect` est
  client-side : vérifier qu'aucune redirection ne s'applique aux bots
  (elle ne s'exécute pas sans JS, mais Googlebot exécute le JS → exclure
  les user-agents bots ou ne rediriger qu'après interaction).
- [x] **Previews Netlify noindex** — header `X-Robots-Tag: noindex` sur les
  contextes `branch-deploy` / `deploy-preview` (netlify.toml).

## 2. Politique d'indexation des images (option B)

- [x] **`noimageindex` + `max-image-preview: none`** — bloc `robots` dans le
  `generateMetadata` des pages entrée, archive, widline-cadet,
  unexpected-connections.
- [x] **`Disallow: /_next/image` dans `public/robots.txt`** — sans bloquer
  `share-image.png` ni `logo.png` (servis en direct).
- [x] **Champ Sanity `allowImageIndexing`** (boolean, défaut false) dans
  `src/sanity/schemaTypes/archive-entry.js` — si true, la page de l'œuvre
  ne pose pas `noimageindex`. Ajouter au groupe métadonnées du Studio.
- [x] **Sitemap : jamais de balises `<image:image>`** (rien à faire, à ne pas
  introduire).

## 3. Données structurées

- [x] **`VisualArtwork`** — enrichir `ArchiveEntryJsonLd` : `creator`
  (source/credit), `dateCreated` (year), `keywords` (tags + moods),
  `creditText`, `copyrightNotice`, `isPartOf` (l'archive).
- [x] **`WebSite` + `SearchAction`** — layout racine, en s'appuyant sur
  l'URL de recherche existante : `/archive?search={search_term_string}`.
- [x] **`BreadcrumbList`** sur les pages entrée (Archive → œuvre).
- [x] **`CollectionPage`** sur `/archive`.

## 4. Maillage interne — EN ATTENTE (impact visible, validation client/design requise)

- [ ] ⏸ **Pages de fonds par artiste** — route `src/app/(pages)/archive/artist/[slug]/page.js`,
  rendue serveur : liste des œuvres de `metadata.source`, metadata + JSON-LD
  propres, dans le sitemap. Générer les slugs artistes (GROQ distinct sur source).
- [ ] ⏸ **Pages de fonds par tag** — même modèle sur les tags
  (`/archive/tag/[slug]`, slugs des documents `tag` déjà existants).
- [ ] ⏸ **Bloc « œuvres liées »** — 3-5 liens serveur sur chaque page entrée,
  par tags/moods partagés (GROQ `references()`, déjà indexé — cf. la recherche).
- [x] **`rel=prev/next` serveur** — le pager actuel est client ; ajouter les
  liens précédent/suivant dans le HTML initial (ordre par défaut `_updatedAt`).
- [ ] ⏸ **Lier les pages artistes/tags depuis les pages œuvre** (artiste cliquable,
  tags cliquables) et depuis la légende de la grille.

## 5. Découvrabilité IA / LLM

- [x] **robots.txt différencié** — bloquer les bots d'entraînement
  (`GPTBot`, `Google-Extended`, `CCBot`, `anthropic-ai`, `Bytespider`,
  `meta-externalagent`…), laisser les bots de recherche/citation
  (`Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot` à arbitrer).
- [x] **`llms.txt`** — description du projet, taxonomie, pages de fonds,
  politique d'usage.
- [ ] **Contenu serveur vérifié** — s'assurer que les pages entrée et les
  futures pages de fonds livrent tout leur texte sans JavaScript
  (`curl` sans JS = texte complet).
- [ ] *(À valider client)* **Catalogue ouvert** — endpoint JSON des métadonnées
  du fonds (sans fichiers images) : artiste, titre, année, tags, URL.

## 6. Performance (critère de classement)

- [x] **Attribut `sizes` sur les vignettes** — `ArchiveEntryMediaLink` et la
  grille : ~1 Mo économisé par page sur mobile (mesuré : 23,8 Ko servis là où
  5,9 suffisent).
- [ ] **Audit Core Web Vitals** après le reste (Lighthouse sur entrée + archive).

## Vérifications post-déploiement

- [ ] Search Console : soumettre le sitemap, vérifier la couverture.
- [ ] `site:outsideobservations.com` dans Google Images → doit se vider.
- [ ] Test résultats enrichis Google sur une page œuvre (VisualArtwork).
- [ ] Rechercher le site dans Perplexity/ChatGPT Search → doit citer avec lien.
