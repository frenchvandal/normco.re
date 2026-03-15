# Performance Audit — frenchvandal.com

Rapport reconstruit à partir des nouvelles captures Lighthouse.

---

## Constat principal (identique mobile / bureau)

- CSS principal ~11 KiB
- script `anti-flash.js` dans le chemin critique
- très faible chaîne de requêtes réseau
- élément LCP dans le hero texte

---

## Requêtes bloquant l'affichage

Ressources identifiées :

- `/style.fa69e0047a.css`
- `/scripts/anti-flash.9e88ba3398.js`

Impact estimé Lighthouse :

**≈ 440 ms**

---

## Arborescence réseau

Navigation initiale observée :

```
HTML
 ├ style.fa69e0047a.css
 └ scripts/anti-flash.js
```

Latence critique maximale observée :

**≈ 49 ms**

---

## Répartition LCP

Valeurs observées :

| composant               | durée  |
| ----------------------- | ------ |
| Time To First Byte      | ~40 ms |
| Délai affichage élément | ~90 ms |

Élément LCP :

```html
<p class="hero-lead">
  A personal blog by Phiphi – software, culture, and everyday life from Chengdu.
</p>
```

---

## Réduction taille CSS

CSS principal :

```
style.fa69e0047a.css
```

Taille :

**~11 KiB**

Économie Lighthouse estimée :

**~2 KiB**

Impact faible.

---

## Optimisations code pertinentes

### 1. Inline anti‑flash script

```html
<script>
  (() => {
    const theme = localStorage.getItem("theme");
    if (theme) document.documentElement.dataset.theme = theme;
  })();
</script>
```

---

### 2. Charger JS non critique avec defer

Scripts concernés :

```
theme-toggle.js
language-preference.js
disclosure-controls.js
pagefind-lazy-init.js
link-prefetch-intent.js
sw-register.js
```

Exemple :

```html
<script src="/scripts/theme-toggle.js" defer></script>
```

---

### 3. CSS critique (optionnel)

CSS actuel très petit (~11 KiB).

Inline critical CSS possible mais gain limité.

---

## Conclusion

Le site est déjà **extrêmement performant**.

Les améliorations côté code sont limitées à :

1. suppression du script anti‑flash externe
2. chargement différé du JS
3. micro‑optimisation CSS
