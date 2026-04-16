import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MealSlot = "desayuno" | "almuerzo" | "merienda" | "cena";

type RecipeIngredientSeed = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes?: string;
};

type RecipeSeed = {
  name: string;
  description: string;
  servings: number;
  prepTimeMin: number;
  cookTimeMin: number;
  mealSlot: MealSlot;
  ingredients: RecipeIngredientSeed[];
};

function getCurrentWeekStart(): Date {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function ensureIngredient(name: string, category: string) {
  return prisma.ingredient.upsert({
    where: { name },
    update: { category },
    create: { name, category },
  });
}

async function createRecipe(seed: RecipeSeed) {
  return prisma.recipe.create({
    data: {
      name: seed.name,
      description: seed.description,
      servings: seed.servings,
      prepTimeMin: seed.prepTimeMin,
      cookTimeMin: seed.cookTimeMin,
    },
  });
}

async function linkRecipeIngredients(recipeId: number, ingredients: RecipeIngredientSeed[]) {
  for (const item of ingredients) {
    const ingredient = await ensureIngredient(item.name, item.category);
    await prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId: ingredient.id,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes ?? null,
      },
    });
  }
}

const RECIPES: RecipeSeed[] = [
  {
    name: "Medialunas de manteca",
    description: "Clasico desayuno argentino, ideal para arrancar la semana con cafe.",
    servings: 8,
    prepTimeMin: 30,
    cookTimeMin: 18,
    mealSlot: "desayuno",
    ingredients: [
      { name: "harina 000", category: "panaderia", quantity: 500, unit: "g" },
      { name: "leche", category: "lacteos", quantity: 240, unit: "ml" },
      { name: "levadura", category: "panaderia", quantity: 10, unit: "g" },
      { name: "manteca", category: "lacteos", quantity: 120, unit: "g" },
      { name: "azucar", category: "endulzantes", quantity: 90, unit: "g" },
    ],
  },
  {
    name: "Tostadas con palta y huevo",
    description: "Desayuno simple y rendidor con influencia sudamericana.",
    servings: 2,
    prepTimeMin: 8,
    cookTimeMin: 6,
    mealSlot: "desayuno",
    ingredients: [
      { name: "pan de campo", category: "panaderia", quantity: 4, unit: "rebanadas" },
      { name: "palta", category: "frutas", quantity: 1, unit: "unidad" },
      { name: "huevo", category: "huevos", quantity: 2, unit: "unidades" },
      { name: "aceite de oliva", category: "aceites y grasas", quantity: 20, unit: "ml" },
    ],
  },
  {
    name: "Arepas con queso",
    description: "Clasico venezolano muy popular en toda sudamerica.",
    servings: 4,
    prepTimeMin: 15,
    cookTimeMin: 15,
    mealSlot: "desayuno",
    ingredients: [
      { name: "harina de maiz precocida", category: "pasta y cereales", quantity: 300, unit: "g" },
      { name: "agua", category: "bebidas", quantity: 420, unit: "ml" },
      { name: "sal", category: "condimentos", quantity: 1, unit: "cucharadita" },
      { name: "queso fresco", category: "lacteos", quantity: 200, unit: "g" },
    ],
  },
  {
    name: "Empanadas de carne",
    description: "Clasico argentino de carne, cebolla y condimentos.",
    servings: 6,
    prepTimeMin: 35,
    cookTimeMin: 25,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "tapas para empanada", category: "panaderia", quantity: 24, unit: "unidades" },
      { name: "carne picada", category: "carnes y aves", quantity: 700, unit: "g" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 2, unit: "unidades" },
      { name: "huevo", category: "huevos", quantity: 2, unit: "unidades" },
      { name: "comino", category: "hierbas y especias", quantity: 1, unit: "cucharadita" },
    ],
  },
  {
    name: "Locro criollo",
    description: "Guiso patrio argentino con maiz, porotos y carnes.",
    servings: 8,
    prepTimeMin: 25,
    cookTimeMin: 120,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "maiz blanco", category: "legumbres", quantity: 400, unit: "g" },
      { name: "porotos", category: "legumbres", quantity: 250, unit: "g" },
      { name: "falda", category: "carnes y aves", quantity: 600, unit: "g" },
      { name: "chorizo colorado", category: "carnes y embutidos", quantity: 2, unit: "unidades" },
      { name: "zapallo", category: "verduras y hortalizas", quantity: 800, unit: "g" },
    ],
  },
  {
    name: "Milanesa napolitana",
    description: "Bodegon clasico con salsa y queso gratinado.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 30,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "nalga", category: "carnes y aves", quantity: 800, unit: "g" },
      { name: "huevo", category: "huevos", quantity: 3, unit: "unidades" },
      { name: "pan rallado", category: "panaderia", quantity: 250, unit: "g" },
      { name: "salsa de tomate", category: "condimentos", quantity: 320, unit: "g" },
      { name: "mozzarella", category: "lacteos", quantity: 300, unit: "g" },
    ],
  },
  {
    name: "Asado con chimichurri",
    description: "Parrilla argentina de domingo con corte vacuno.",
    servings: 6,
    prepTimeMin: 20,
    cookTimeMin: 80,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "tira de asado", category: "carnes y aves", quantity: 1400, unit: "g" },
      { name: "chorizo", category: "carnes y embutidos", quantity: 6, unit: "unidades" },
      { name: "perejil", category: "hierbas y especias", quantity: 1, unit: "atado" },
      { name: "ajo", category: "verduras y hortalizas", quantity: 4, unit: "dientes" },
      { name: "vinagre de vino", category: "condimentos", quantity: 40, unit: "ml" },
    ],
  },
  {
    name: "Lomo saltado",
    description: "Clasico peruano de carne salteada con papas.",
    servings: 4,
    prepTimeMin: 15,
    cookTimeMin: 18,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "lomo", category: "carnes y aves", quantity: 600, unit: "g" },
      { name: "cebolla morada", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "tomate", category: "verduras y hortalizas", quantity: 2, unit: "unidades" },
      { name: "papa", category: "verduras y hortalizas", quantity: 700, unit: "g" },
      { name: "salsa de soja", category: "condimentos", quantity: 30, unit: "ml" },
    ],
  },
  {
    name: "Ceviche peruano",
    description: "Pescado marinado en limon con cebolla y cilantro.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 0,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "pescado blanco", category: "pescados y mariscos", quantity: 700, unit: "g" },
      { name: "limon", category: "frutas", quantity: 10, unit: "unidades" },
      { name: "cebolla morada", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "cilantro", category: "hierbas y especias", quantity: 1, unit: "atado" },
      { name: "aji amarillo", category: "hierbas y especias", quantity: 1, unit: "unidad" },
    ],
  },
  {
    name: "Feijoada brasileña",
    description: "Guiso brasileño de porotos negros y cerdo.",
    servings: 6,
    prepTimeMin: 20,
    cookTimeMin: 110,
    mealSlot: "almuerzo",
    ingredients: [
      { name: "poroto negro", category: "legumbres", quantity: 500, unit: "g" },
      { name: "paleta de cerdo", category: "carnes y aves", quantity: 700, unit: "g" },
      { name: "chorizo", category: "carnes y embutidos", quantity: 2, unit: "unidades" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "ajo", category: "verduras y hortalizas", quantity: 3, unit: "dientes" },
    ],
  },
  {
    name: "Pan de yuca",
    description: "Merienda ecuatoriana de queso, suave y elastica.",
    servings: 6,
    prepTimeMin: 12,
    cookTimeMin: 20,
    mealSlot: "merienda",
    ingredients: [
      { name: "almidon de mandioca", category: "pasta y cereales", quantity: 280, unit: "g" },
      { name: "queso semiduro", category: "lacteos", quantity: 200, unit: "g" },
      { name: "huevo", category: "huevos", quantity: 2, unit: "unidades" },
      { name: "leche", category: "lacteos", quantity: 120, unit: "ml" },
    ],
  },
  {
    name: "Alfajores de maicena",
    description: "Clasico rioplatense para una merienda bien dulce.",
    servings: 16,
    prepTimeMin: 25,
    cookTimeMin: 12,
    mealSlot: "merienda",
    ingredients: [
      { name: "maicena", category: "panaderia", quantity: 300, unit: "g" },
      { name: "harina 0000", category: "panaderia", quantity: 200, unit: "g" },
      { name: "manteca", category: "lacteos", quantity: 200, unit: "g" },
      { name: "dulce de leche", category: "endulzantes", quantity: 350, unit: "g" },
      { name: "coco rallado", category: "frutas", quantity: 100, unit: "g" },
    ],
  },
  {
    name: "Sopaipillas chilenas",
    description: "Merienda chilena frita con zapallo y harina.",
    servings: 6,
    prepTimeMin: 20,
    cookTimeMin: 15,
    mealSlot: "merienda",
    ingredients: [
      { name: "harina 000", category: "panaderia", quantity: 450, unit: "g" },
      { name: "zapallo", category: "verduras y hortalizas", quantity: 300, unit: "g" },
      { name: "manteca", category: "lacteos", quantity: 40, unit: "g" },
      { name: "sal", category: "condimentos", quantity: 1, unit: "cucharadita" },
      { name: "aceite de girasol", category: "aceites y grasas", quantity: 400, unit: "ml" },
    ],
  },
  {
    name: "Pastel de papa",
    description: "Receta casera argentina de carne, pure y horno.",
    servings: 6,
    prepTimeMin: 25,
    cookTimeMin: 45,
    mealSlot: "cena",
    ingredients: [
      { name: "carne picada", category: "carnes y aves", quantity: 800, unit: "g" },
      { name: "papa", category: "verduras y hortalizas", quantity: 1300, unit: "g" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 2, unit: "unidades" },
      { name: "huevo", category: "huevos", quantity: 3, unit: "unidades" },
      { name: "aceitunas", category: "conservas", quantity: 80, unit: "g" },
    ],
  },
  {
    name: "Humita en olla",
    description: "Clasico del norte argentino a base de choclo.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 35,
    mealSlot: "cena",
    ingredients: [
      { name: "choclo", category: "verduras y hortalizas", quantity: 10, unit: "unidades" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "morron rojo", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "queso cremoso", category: "lacteos", quantity: 180, unit: "g" },
      { name: "leche", category: "lacteos", quantity: 220, unit: "ml" },
    ],
  },
  {
    name: "Carbonada criolla",
    description: "Guiso argentino de carne y verduras de invierno.",
    servings: 6,
    prepTimeMin: 20,
    cookTimeMin: 70,
    mealSlot: "cena",
    ingredients: [
      { name: "roast beef", category: "carnes y aves", quantity: 900, unit: "g" },
      { name: "papa", category: "verduras y hortalizas", quantity: 500, unit: "g" },
      { name: "batata", category: "verduras y hortalizas", quantity: 500, unit: "g" },
      { name: "zapallo", category: "verduras y hortalizas", quantity: 700, unit: "g" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
    ],
  },
  {
    name: "Tacos al pastor",
    description: "Clasico de mexico, muy popular en toda centroamerica.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 25,
    mealSlot: "cena",
    ingredients: [
      { name: "bondiola de cerdo", category: "carnes y aves", quantity: 700, unit: "g" },
      { name: "tortillas", category: "panaderia", quantity: 16, unit: "unidades" },
      { name: "anana", category: "frutas", quantity: 200, unit: "g" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
      { name: "aji rojo", category: "hierbas y especias", quantity: 1, unit: "unidad" },
    ],
  },
  {
    name: "Pupusas revueltas",
    description: "Clasico de el salvador con queso y porotos.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 15,
    mealSlot: "cena",
    ingredients: [
      { name: "harina de maiz precocida", category: "pasta y cereales", quantity: 320, unit: "g" },
      { name: "queso mozzarella", category: "lacteos", quantity: 180, unit: "g" },
      { name: "poroto refrito", category: "legumbres", quantity: 250, unit: "g" },
      { name: "agua", category: "bebidas", quantity: 420, unit: "ml" },
    ],
  },
  {
    name: "Hamburguesa completa con papas",
    description: "Toque americano para el menu demo, bien cargada.",
    servings: 4,
    prepTimeMin: 20,
    cookTimeMin: 20,
    mealSlot: "cena",
    ingredients: [
      { name: "carne picada", category: "carnes y aves", quantity: 700, unit: "g" },
      { name: "pan de hamburguesa", category: "panaderia", quantity: 4, unit: "unidades" },
      { name: "queso cheddar", category: "lacteos", quantity: 120, unit: "g" },
      { name: "tomate", category: "verduras y hortalizas", quantity: 2, unit: "unidades" },
      { name: "papas", category: "verduras y hortalizas", quantity: 900, unit: "g" },
    ],
  },
  {
    name: "Hot dog completo",
    description: "Segunda opcion americana, rapida para una cena casual.",
    servings: 4,
    prepTimeMin: 10,
    cookTimeMin: 10,
    mealSlot: "cena",
    ingredients: [
      { name: "salchicha", category: "carnes y embutidos", quantity: 8, unit: "unidades" },
      { name: "pan de hot dog", category: "panaderia", quantity: 8, unit: "unidades" },
      { name: "ketchup", category: "condimentos", quantity: 120, unit: "g" },
      { name: "mostaza", category: "condimentos", quantity: 80, unit: "g" },
      { name: "cebolla", category: "verduras y hortalizas", quantity: 1, unit: "unidad" },
    ],
  },
];

async function resetDatabase() {
  await prisma.groceryListItem.deleteMany({});
  await prisma.weekPlanEntry.deleteMany({});
  await prisma.weekPlan.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.ingredient.deleteMany({});
}

async function main() {
  console.log("Resetting and seeding demo data...");
  await resetDatabase();

  const recipeMap = new Map<string, { id: number; servings: number; mealSlot: MealSlot }>();

  for (const seed of RECIPES) {
    const recipe = await createRecipe(seed);
    await linkRecipeIngredients(recipe.id, seed.ingredients);
    recipeMap.set(seed.name, { id: recipe.id, servings: seed.servings, mealSlot: seed.mealSlot });
  }

  const weekPlan = await prisma.weekPlan.create({
    data: {
      name: "Semana demo LATAM",
      startDate: getCurrentWeekStart(),
    },
  });

  const bySlot: Record<MealSlot, RecipeSeed[]> = {
    desayuno: RECIPES.filter((r) => r.mealSlot === "desayuno"),
    almuerzo: RECIPES.filter((r) => r.mealSlot === "almuerzo"),
    merienda: RECIPES.filter((r) => r.mealSlot === "merienda"),
    cena: RECIPES.filter((r) => r.mealSlot === "cena"),
  };

  const slots: MealSlot[] = ["desayuno", "almuerzo", "merienda", "cena"];
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
    for (const slot of slots) {
      const options = bySlot[slot];
      const recipeSeed = options[(dayOfWeek + slots.indexOf(slot)) % options.length];
      const recipe = recipeMap.get(recipeSeed.name);
      if (!recipe) continue;

      await prisma.weekPlanEntry.create({
        data: {
          weekPlanId: weekPlan.id,
          dayOfWeek,
          mealSlot: slot,
          recipeId: recipe.id,
          servings: slot === "desayuno" || slot === "merienda" ? 3 : 4,
        },
      });
    }
  }

  const entries = await prisma.weekPlanEntry.findMany({
    where: { weekPlanId: weekPlan.id },
    include: { recipe: { include: { ingredients: true } } },
  });

  const totals = new Map<number, { quantity: number; unit: string }>();
  for (const entry of entries) {
    for (const ri of entry.recipe.ingredients) {
      const scale = entry.servings / Math.max(entry.recipe.servings, 1);
      const amount = Number((ri.quantity * scale).toFixed(2));
      const prev = totals.get(ri.ingredientId);
      if (!prev) {
        totals.set(ri.ingredientId, { quantity: amount, unit: ri.unit });
      } else if (prev.unit === ri.unit) {
        prev.quantity = Number((prev.quantity + amount).toFixed(2));
      }
    }
  }

  for (const [ingredientId, total] of totals.entries()) {
    await prisma.groceryListItem.create({
      data: {
        weekPlanId: weekPlan.id,
        ingredientId,
        totalQuantity: total.quantity,
        unit: total.unit,
        checked: false,
      },
    });
  }

  console.log(`Seed complete: ${RECIPES.length} recipes loaded.`);
  console.log("Planner and grocery list created from scratch.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
