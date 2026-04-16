-- CreateTable
CREATE TABLE "Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 2,
    "prepTimeMin" INTEGER,
    "cookTimeMin" INTEGER,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "recipeId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeekPlanEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "mealSlot" TEXT NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 2,
    "weekPlanId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    CONSTRAINT "WeekPlanEntry_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeekPlanEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroceryListItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalQuantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekPlanId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    CONSTRAINT "GroceryListItem_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroceryListItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanEntry_weekPlanId_dayOfWeek_mealSlot_key" ON "WeekPlanEntry"("weekPlanId", "dayOfWeek", "mealSlot");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryListItem_weekPlanId_ingredientId_key" ON "GroceryListItem"("weekPlanId", "ingredientId");
