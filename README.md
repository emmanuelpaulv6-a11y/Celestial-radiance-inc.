# Site web — Celestial Radiance Inc.

Site vitrine statique, bilingue (FR/EN), sans framework ni étape de compilation. Il suffit de déposer les fichiers sur un hébergeur statique (GitHub Pages, Netlify, Cloudflare Pages…).

## Contenu du dossier

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | Page d'accueil (toutes les sections) |
| `restauration.html` | Page Restauration : packs et plats (contenu d'exemple à remplacer) |
| `equipe.html` | Équipe dirigeante (noms, titres, photos; contenu d'exemple à remplacer) |
| `promotions.html` | Annonces de promotions (+ bandeau en haut du site, `_banner`) |
| `nous-rejoindre.html` | Offres d'emploi/stages + candidature spontanée (sans pièce jointe) |
| `mentions-legales.html`, `confidentialite.html` | Pages légales (**modèles à faire valider**, champs surlignés à compléter) |
| `js/config.js`, `js/content.js` | Lecture du Google Sheets (promotions, packs, plats, offres, bandeau) |
| `celestial-radiance-contenu-modele.xlsx` | Modèle du tableur à importer dans Google Sheets |
| `css/styles.css` | Styles (couleurs et typographie de la charte graphique V2.0) |
| `js/main.js` | Comportements : bascule FR/EN, menu mobile, formulaire, liens préremplis |
| `js/i18n.js` | Tous les textes en français et en anglais |
| `assets/img/` | Logos officiels, favicon, image de partage |
| `assets/team/` | Photos de l'équipe dirigeante (`membre-1.jpg`, `membre-2.jpg`…), à créer au besoin |
| `assets/plats/` | Photos des mets haïtiens (`haiti-1.jpg` à `haiti-4.jpg`), à créer au besoin; les plats ajoutés via le tableur utilisent le nom de fichier de la colonne `photo` |
| `assets/photos/` | **Vos photos** (voir ci-dessous) |
| `robots.txt`, `sitemap.xml` | Référencement (adresse `www.celestialradiance.ca` à ajuster si besoin) |

## 1. Ajouter les photos

Déposez trois images dans `assets/photos/` avec exactement ces noms : `photo-1.jpg` (grande, à gauche), `photo-2.jpg` et `photo-3.jpg`. Elles remplacent automatiquement les zones « PHOTO À INSÉRER ». Format conseillé : JPG, 1600 px de large, moins de 400 Ko chacune. Photos de personnes : autorisation écrite requise (charte, section 8.4).

## 2. Activer le formulaire de devis

Tant que le formulaire n'est pas relié à un service, il ouvre le courriel du visiteur, prérempli, à destination de `admin@celestialradiance.ca` (ça fonctionne, mais le visiteur doit cliquer sur « Envoyer »).

Pour recevoir les demandes directement par courriel :
1. Créez un compte gratuit sur https://formspree.io et un nouveau formulaire avec l'adresse `admin@celestialradiance.ca`.
2. Copiez son identifiant (par exemple `xyzabcde`).
3. Dans `index.html`, remplacez `YOUR_FORM_ID` par cet identifiant, dans la ligne `<form id="quote-form" action="https://formspree.io/f/YOUR_FORM_ID" …>`.
4. Dans `confidentialite.html`, remplacez `[NOM DU SERVICE, ex. Formspree]` par le nom du service utilisé.

## 3. Publier sur GitHub Pages

1. Créez un dépôt GitHub (par exemple `celestial-radiance-site`), public.
2. Déposez-y **le contenu** de ce dossier (le fichier `index.html` doit être à la racine du dépôt) : bouton « Add file » → « Upload files », puis « Commit changes ».
3. Dans le dépôt : **Settings → Pages → Build and deployment** → Source : « Deploy from a branch », branche `main`, dossier `/ (root)` → Save.
4. Après une à deux minutes, le site est visible à `https://VOTRE-COMPTE.github.io/celestial-radiance-site/`.

### Utiliser le domaine celestialradiance.ca
1. Settings → Pages → Custom domain : saisir `www.celestialradiance.ca`, puis cocher « Enforce HTTPS » une fois disponible.
2. Chez le registraire du domaine, ajouter un enregistrement **CNAME** : `www` → `VOTRE-COMPTE.github.io`. Pour que le domaine sans « www » fonctionne aussi, ajouter les enregistrements **A** de GitHub Pages (liste officielle : docs.github.com → « Managing a custom domain for your GitHub Pages site »).

## 3b. Formulaire de candidature

Même principe que le devis : dans `nous-rejoindre.html`, remplacez `YOUR_FORM_ID` (vous pouvez réutiliser le même identifiant Formspree). Aucune pièce jointe n'est demandée; le CV est réclamé au premier contact.

## 4. Annonces, promotions, packs, plats, offres (Google Sheets)

Le client met à jour ces contenus lui-même, dans un tableur, sans toucher au site.

**Mise en place (une seule fois)**
1. Importer `celestial-radiance-contenu-modele.xlsx` dans Google Drive, puis l'ouvrir avec Google Sheets (il contient 5 onglets : `promotions`, `packs`, `plats`, `offres`, `equipe`).
2. Pour **chaque onglet** : Fichier → Partager → **Publier sur le Web** → choisir l'onglet → format **Valeurs séparées par des virgules (.csv)** → Publier → copier l'adresse.
3. Coller les 5 adresses dans `js/config.js` (promos, packs, plats, offres, equipe), puis redéployer ce fichier sur GitHub.

**Au quotidien** : modifier le tableur (ajouter une ligne = nouvelle annonce). Le site se met à jour en quelques minutes (délai de Google, environ 5 min).

**Colonnes communes** : `actif` (oui/non), `date_fin` (AAAA-MM-JJ : l'annonce disparaît seule après cette date), colonnes `_fr` / `_en` pour chaque texte (si l'anglais est vide, le français est utilisé).
- `promotions` : `service` (p1 à p5 : pôle présélectionné dans le devis), `banniere` (oui = affichée aussi dans le bandeau en haut du site; une seule à la fois), `etiquette`, `titre`, `description`, `validite`, `id` (change l'identifiant pour réafficher le bandeau aux visiteurs qui l'ont fermé).
- `packs` : `contenu` (éléments séparés par des points-virgules), `duree`, `prix` (vide = « Sur devis »), `service`.
- `plats` (mets haïtiens) : `nom`, `description`, `prix`, `photo` (nom du fichier déposé dans `assets/plats/`, ex. `plat-1.jpg`, format 16:10; vide = espace réservé).
- `equipe` : `ordre` (1 = premier), `nom`, `titre`, `bio`, `photo` (nom du fichier déposé dans `assets/team/`, ex. `membre-1.jpg`; vide = silhouette).
- `offres` : `type` (emploi ou stage), `titre`, `lieu`, `statut`, `description`.

Tant qu'une adresse est vide (ou injoignable), la page affiche son contenu d'exemple. Dès qu'un onglet est publié, le contenu d'exemple est remplacé et le message « Contenu d'exemple » disparaît. Un onglet sans ligne active affiche « Aucune annonce pour le moment ».

**Bandeau et bouton « Promotions en cours »** : une fois l'onglet `promotions` publié, ils s'affichent uniquement quand au moins une promotion est en cours (`actif` = oui et `date_fin` non dépassée). Sans promotion active, ou si le tableur est injoignable, ils disparaissent. Le bandeau reprend la promotion marquée `banniere = oui`, sinon la première promotion active. Tant que le tableur n'est pas relié, le bandeau d'exemple reste affiché.

Les textes fixes du site (titres, présentation) restent modifiables par moi sur demande.

## 5. Modifier un texte

Le français est écrit directement dans `index.html`; la version anglaise et la version française utilisées par la bascule sont dans `js/i18n.js`. Pour changer une phrase, modifiez-la aux deux endroits (même clé `data-i18n="…"`), ou demandez-moi de le faire.

## 6. À compléter avant la mise en ligne

- [ ] Réseaux sociaux : remplacer les adresses Facebook / Instagram du pied de page (recherchez `facebook.com` dans chaque page, ou demandez-moi) et ajouter d'autres réseaux si besoin
- [ ] Équipe dirigeante : noms, titres, courtes présentations et photos (autorisation écrite des personnes)
- [ ] Photos (section 1)
- [ ] Formulaire relié à Formspree (section 2)
- [ ] Restauration : prix, plats et packs réels; supprimer les mentions « EXEMPLE »
- [ ] Tableur publié et adresses collées dans `js/config.js` (section 4)
- [ ] Mentions légales : numéro d'entreprise et responsable de la publication
- [ ] Politique de confidentialité : nom du service de formulaire et date; faire valider les deux pages légales par un professionnel
- [ ] Adresse du site web : l'offre de services mentionne `celestialradince.ca` (faute de frappe probable) ; le site suppose `celestialradiance.ca`
