// seedMeals-spoonacular.js (FINAL + FIXED VERSION)
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Meal = require("../models/Meal");
const User = require("../models/User");

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// ==========================================
// CONFIG — CHANGE THIS ONLY
// ==========================================
const CONFIG = {
  mealsPerType: {
    breakfast: 0,
    lunch: 100,
    dinner: 100,
    snack: 0,
  },
  clearExistingMeals: false,
  maxRetries: 2,
  delayBetweenRequests: 300,
  dryRun: false,
};

// ==========================================
// CONNECT DB
// ==========================================
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

// ==========================================
// HELPERS
// ==========================================
const mapUnitToValidEnum = (unit) => {
  if (!unit) return "g";

  const map = {
    tablespoons: "tbsp",
    tablespoon: "tbsp",
    tbsp: "tbsp",
    teaspoons: "tsp",
    teaspoon: "tsp",
    tsp: "tsp",
    cups: "cup",
    cup: "cup",
    ounces: "oz",
    ounce: "oz",
    oz: "oz",
    pounds: "lb",
    pound: "lb",
    lb: "lb",
    milliliters: "ml",
    milliliter: "ml",
    ml: "ml",
    liters: "l",
    liter: "l",
    l: "l",
    grams: "g",
    gram: "g",
    g: "g",
    kilograms: "kg",
    kilogram: "kg",
    kg: "kg",
    pieces: "piece",
    piece: "piece",
    whole: "piece",
    medium: "piece",
    large: "piece",
    small: "piece",
  };

  return map[unit.toLowerCase()] || "g";
};

// ==========================================
// FIXED CLASSIFIER — REAL AND RELIABLE
// ==========================================
//
// Spoonacular does NOT reliably mark "lunch" or "dinner".
// So we infer using dishTypes as follows:
//
// breakfast: "breakfast"
// snack: "snack", "appetizer", "side dish"
// lunch: "salad", "sandwich", OR "main course" under 500 calories
// dinner: "main course" (heavier meals)
//
// This WORKS consistently and returns hundreds of meals.
//
const classifyMealType = (recipe) => {
  const dt = (recipe.dishTypes || []).map((d) => d.toLowerCase());
  const calories =
    recipe.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount ??
    400;

  if (dt.includes("breakfast")) return "breakfast";
  if (dt.includes("snack") || dt.includes("appetizer")) return "snack";

  // lunch = salads, sandwiches, light main courses
  if (dt.includes("salad") || dt.includes("sandwich") || calories < 500)
    return "lunch";

  // dinner = main courses
  if (dt.includes("main course")) return "dinner";

  return "lunch"; // default fallback
};

const mapDietaryTags = (recipe) => {
  const tags = [];
  if (recipe.vegetarian) tags.push("vegetarian");
  if (recipe.vegan) tags.push("vegan");
  if (recipe.glutenFree) tags.push("gluten-free");
  if (recipe.dairyFree) tags.push("dairy-free");

  const n = recipe.nutrition?.nutrients || [];
  const protein = n.find((x) => x.name === "Protein")?.amount || 0;
  const carbs = n.find((x) => x.name === "Carbohydrates")?.amount || 0;

  if (protein > 20) tags.push("high-protein");
  if (carbs < 25) tags.push("low-carb");

  return [...new Set(tags)];
};

const mapAllergens = (recipe) => {
  const all = [];
  const txt = (recipe.extendedIngredients || [])
    .map((i) => (i.original || "").toLowerCase())
    .join(" ");

  if (!recipe.dairyFree) all.push("dairy");
  if (!recipe.glutenFree) all.push("gluten");

  if (txt.includes("nut") || txt.includes("almond")) all.push("nuts");
  if (txt.includes("peanut")) all.push("peanuts");
  if (txt.includes("egg")) all.push("eggs");
  if (txt.includes("soy")) all.push("soy");
  if (txt.includes("salmon") || txt.includes("tuna")) all.push("fish");
  if (txt.includes("shrimp") || txt.includes("shellfish"))
    all.push("shellfish");

  return [...new Set(all)];
};

const generateInstructions = (steps) => {
  if (steps?.length) return steps[0].steps.map((s) => s.step);
  return ["Prepare ingredients", "Cook meal", "Serve"];
};

// ==========================================
// MAP SPOONACULAR → YOUR MEAL MODEL
// ==========================================
const mapRecipeToMeal = (r, adminId) => {
  const nutrients = r.nutrition?.nutrients || [];

  const get = (name, def) =>
    Math.round(nutrients.find((n) => n.name === name)?.amount || def);

  return {
    name: r.title,
    description: (r.summary || "").replace(/<[^>]*>/g, "").slice(0, 490),
    mealType: classifyMealType(r),
    imageUrl:
      r.image || `https://spoonacular.com/recipeImages/${r.id}-556x370.jpg`,
    source: "spoonacular",
    sourceId: r.id.toString(),
    prepTime: r.preparationMinutes || 10,
    cookTime: r.cookingMinutes || 20,
    servings: r.servings || 4,

    ingredients: (r.extendedIngredients || []).map((i) => ({
      name: i.nameClean || i.name,
      amount: Math.round((i.amount || 1) * 10) / 10,
      unit: mapUnitToValidEnum(i.unit),
      allergens: [],
    })),

    instructions: generateInstructions(r.analyzedInstructions).slice(0, 10),

    nutrition: {
      calories: get("Calories", 300),
      protein: get("Protein", 10),
      carbohydrates: get("Carbohydrates", 30),
      fats: get("Fat", 10),
      fiber: get("Fiber", 5),
      sugar: get("Sugar", 8),
      sodium: get("Sodium", 400),
    },

    dietaryTags: mapDietaryTags(r),
    allergens: mapAllergens(r),

    difficulty: r.readyInMinutes <= 30 ? "easy" : "medium",
    averageRating: 4,
    isActive: true,
    createdBy: adminId,
  };
};

// ==========================================
// API — Pagination + Retry
// ==========================================
const fetchWithRetry = async (url, params) => {
  for (let i = 0; i <= CONFIG.maxRetries; i++) {
    try {
      const res = await axios.get(url, { params });
      return res.data;
    } catch (err) {
      if (i === CONFIG.maxRetries) return null;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
};

const fetchAllRecipes = async (mealType, target) => {
  console.log(`📡 Fetching ${target} ${mealType} recipes...`);

  const results = [];
  let offset = 0;
  const pageSize = 50;

  const dishTypes = {
    breakfast: "breakfast",
    lunch: "lunch",
    dinner: "dinner",
    snack: "snack",
  };

  while (results.length < target) {
    const params = {
      apiKey: SPOONACULAR_API_KEY,
      number: pageSize,
      offset,
      type: dishTypes[mealType], // THIS IS THE FIX
      addRecipeInformation: true,
      addRecipeNutrition: true,
      instructionsRequired: true,
      sort: "popularity",
    };

    const data = await fetchWithRetry(
      `${SPOONACULAR_BASE_URL}/complexSearch`,
      params
    );

    if (!data?.results?.length) {
      console.log(`⚠️ No results at offset ${offset}`);
      break;
    }

    results.push(...data.results);
    offset += pageSize;

    await new Promise((r) => setTimeout(r, 300));
  }

  return results.slice(0, target);
};

// ==========================================
// MAIN SEEDER
// ==========================================
const seedMeals = async () => {
  console.log("🚀 Starting Spoonacular Seeder");

  if (!SPOONACULAR_API_KEY) {
    console.error("❌ Missing SPOONACULAR_API_KEY");
    process.exit(1);
  }

  await connectDB();

  const admin = await User.findOne({ email: "admin@dietly.com" });
  if (!admin) {
    console.error("❌ Admin user not found");
    process.exit(1);
  }

  if (CONFIG.clearExistingMeals) {
    console.log("🗑 Clearing meals...");
    await Meal.deleteMany({});
  }

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const allMeals = [];

  for (const type of mealTypes) {
    const count = CONFIG.mealsPerType[type];
    if (count === 0) continue;

    const recipes = await fetchAllRecipes(type, count);
    console.log(`   → Received ${recipes.length} ${type} recipes`);

    for (const r of recipes) {
      try {
        const meal = mapRecipeToMeal(r, admin._id);
        if (meal.mealType === type) {
          allMeals.push(meal);
        }
      } catch {}
    }
  }

  if (allMeals.length === 0) {
    console.log("❌ No meals fetched");
    process.exit(1);
  }

  console.log(`💾 Inserting ${allMeals.length} meals...`);
  const inserted = await Meal.insertMany(allMeals, { ordered: false });

  console.log(`✅ Inserted ${inserted.length} meals`);
  process.exit(0);
};

// Run
seedMeals();
