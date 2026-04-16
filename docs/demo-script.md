# Menubelo — Demo Script (3 minutes)
> QA: Daniel · Version 1.0 · 2026-04-14

---

## Setup (Before Recording)

Run these steps before hitting record — they should NOT appear on camera.

```bash
# 1. Start the app
npm run dev

# 2. Seed the database (if seed script exists)
npx prisma db seed

# 3. Clear any leftover state: open the app in a fresh browser tab (incognito)
# URL: http://localhost:3000
```

**Pre-seed the following in the database so they appear in the library:**
- Tortilla española (from seed)
- Ensalada César (from seed)
- Pasta al pesto (from seed)

**Window setup:**
- Browser at 1280×800 or full HD, 100% zoom
- Hide bookmarks bar
- Use Safari or Chrome with no extensions visible
- Keep terminal hidden — not on screen

---

## Act 1 — Recipe Ingestion via Text (0:00–0:55)

**Goal:** Show that Menubelo understands free-form text and extracts a structured recipe.

### Step 1 — Navigate to Agregar (0:00)
- Open `http://localhost:3000/agregar`
- **Camera moment:** the clean landing with the tab switcher — "Texto" selected by default, a calm sage-green UI

### Step 2 — Paste the recipe text (0:10)
Click the text area and paste the following (pre-copied to clipboard):

```
Guacamole clásico

Para 4 personas.

Ingredientes:
- 3 aguacates maduros
- 1 limón (jugo)
- ½ cebolla morada finamente picada
- 2 dientes de ajo
- 1 tomate mediano sin semillas
- Cilantro al gusto
- Sal y pimienta al gusto
- 1 chile jalapeño (opcional)
```

### Step 3 — Click "Analizar receta" (0:20)
- **Camera moment:** the loading state — spinner or skeleton, form disabled
- Good moment to narrate: *"Menubelo le manda el texto a Claude para extraer los ingredientes de forma inteligente"*

### Step 4 — Confirm step (0:35)
- **Camera moment:** the editable ingredient table appears — quantities, units, categories all filled
- Make one small edit live: change "cilantro al gusto" quantity to `1` unit `puñado`
- Click **"Guardar receta"**
- **Camera moment:** success toast / redirect to library with the new card visible

---

## Act 2 — Recipe Library (0:55–1:20)

**Goal:** Show that the library is organized and searchable.

### Step 5 — Navigate to /recetas (0:55)
- **Camera moment:** the card grid with 4 recipes now visible (3 seeded + Guacamole just added)
- Cards should show: recipe name, serving count, ingredient count, category tag

### Step 6 — Search demo (1:05)
- Type "ensalada" in the search bar
- **Camera moment:** the grid filters in real time — only "Ensalada César" remains
- Clear the search to restore all cards

### Step 7 — Open recipe detail (1:15)
- Click on "Tortilla española"
- **Camera moment:** the detail view or modal — ingredient list, servings, clean layout

---

## Act 3 — Weekly Planner (1:20–1:55)

**Goal:** Show planning a week in seconds.

### Step 8 — Navigate to /planificador (1:20)
- **Camera moment:** the 7-day grid, Mon–Sun, all slots empty

### Step 9 — Add meals to the week (1:25)
Add the following in order (each add takes ~5 seconds):

| Day | Recipe |
|-----|--------|
| Lunes | Tortilla española — 4 porciones |
| Miércoles | Ensalada César — 2 porciones |
| Viernes | Pasta al pesto — 4 porciones |
| Domingo | Guacamole clásico — 6 porciones |

- **Camera moment:** after all 4 are added — a partially-filled week grid looking intentional and organized

---

## Act 4 — Grocery List (1:55–2:40)

**Goal:** Show the payoff — everything consolidated automatically.

### Step 10 — Navigate to /compras (1:55)
- Click "Generar lista" (or it auto-generates from the plan)
- **Camera moment:** the consolidation happening — brief loading, then grouped categories appear

### Step 11 — Review the list (2:05)
Point out:
- **Verduras y frescos:** aguacate (3 ud), cebolla morada (½), tomate (1 ud), limón (1 ud), cilantro…
- **Lácteos:** queso parmesano (from César), huevos (from Tortilla)
- **Despensa:** aceite de oliva, sal, pimienta, pasta, pesto…
- **Camera moment:** the category groupings with their headers — clean, logical shopping flow

### Step 12 — Check off items (2:25)
- Check off 3–4 items: aceite de oliva, sal, huevos
- **Camera moment:** the satisfying strikethrough animation — items visually "done"
- Narrate: *"El estado persiste — podés cerrar y volver y tu lista sigue igual"*

---

## Act 5 — Close (2:40–3:00)

### Step 13 — Final shot (2:40)
- Navigate back to `/recetas`
- **Camera moment:** the full library — 4 recipes, clean grid, warm cream background, sage green accents
- Zoom out slightly if possible to show the whole page

### Closing line (2:50)
> *"Menubelo — agregás tus recetas, planificás tu semana, y la lista de compras se arma sola."*

---

## Camera Direction Notes

| Moment | Why it looks great |
|--------|--------------------|
| Loading spinner after "Analizar" | Shows AI doing real work — not instant |
| Editable confirm step | Shows transparency — user stays in control |
| Card grid in /recetas | Clean, organized, visually rich |
| Planner grid filling up | Satisfying progression, week taking shape |
| Grocery list categories | The product's core value — instant payoff |
| Strikethrough on checklist | Tactile, delightful micro-interaction |

---

## Fallback Recipes (if seed fails)

Use these as paste-in text for the text ingestion flow:

### Tortilla española
```
Tortilla española clásica. Para 4 personas.
Ingredientes: 6 huevos, 500g de papa, 1 cebolla grande, aceite de oliva, sal.
```

### Ensalada César
```
Ensalada César. Para 2 personas.
Ingredientes: 1 lechuga romana, 50g parmesano rallado, 100g crutones, 
2 filetes de anchoa, 3 cucharadas de aderezo César, 1 limón.
```

### Pasta al pesto
```
Pasta al pesto. Para 4 personas.
Ingredientes: 400g de pasta (spaghetti), 2 cucharadas de pesto, 
50g de parmesano, piñones al gusto, aceite de oliva, sal.
```

---

## Pre-Demo Checklist

- [ ] `npm run dev` running, no errors in terminal
- [ ] DB seeded with 3 recipes
- [ ] `/agregar` text "Guacamole clásico" copied to clipboard
- [ ] Browser in incognito, 1280×800, no extensions visible
- [ ] Terminal hidden / minimized
- [ ] Test parse once before recording to confirm Claude API key is valid
- [ ] All 4 nav routes load without console errors
