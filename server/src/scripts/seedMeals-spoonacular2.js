// seedMeals-spoonacular-fixed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Meal = require("../models/Meal");
const User = require("../models/User");

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL =
  "https://api.spoonacular.com/recipes/complexSearch";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const CONFIG = {
  mealsPerType: { lunch: 200, dinner: 300 },
  pageSize: 50,
  maxRetries: 2,
  delayBetweenRequests: 300, // ms
  clearExistingMeals: false,
};

// ---------------------------
// Connect DB
// ---------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  }
};

// ---------------------------
// Helpers
// ---------------------------
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const classifyMealType = (recipe) => {
  const dt = (recipe.dishTypes || []).map((d) => d.toLowerCase());
  const calories =
    recipe.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount ??
    400;

  if (dt.includes("breakfast")) return "breakfast";
  if (dt.includes("snack") || dt.includes("appetizer")) return "snack";

  // lunch = salads, sandwiches, or light main courses
  if (dt.includes("salad") || dt.includes("sandwich") || calories < 500)
    return "lunch";

  if (dt.includes("main course")) return "dinner";

  return "lunch";
};

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

const generateInstructions = (steps) => {
  if (!steps?.length) return ["Prepare ingredients", "Cook meal", "Serve"];
  return steps[0].steps.map((s) => s.step);
};

const mapRecipeToMeal = (recipe, adminId) => {
  const nutrients = recipe.nutrition?.nutrients || [];
  const getNutrient = (name, def) =>
    Math.round(nutrients.find((n) => n.name === name)?.amount || def);

  return {
    name: recipe.title,
    description: (recipe.summary || "").replace(/<[^>]*>/g, "").slice(0, 490),
    mealType: classifyMealType(recipe),
    imageUrl:
      recipe.image ||
      `https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg`,
    source: "spoonacular",
    sourceId: recipe.id.toString(),
    prepTime: recipe.preparationMinutes || 10,
    cookTime: recipe.cookingMinutes || 20,
    servings: recipe.servings || 4,
    ingredients: (recipe.extendedIngredients || []).map((i) => ({
      name: i.nameClean || i.name,
      amount: Math.round((i.amount || 1) * 10) / 10,
      unit: mapUnitToValidEnum(i.unit),
      allergens: [],
    })),
    instructions: generateInstructions(recipe.analyzedInstructions).slice(
      0,
      10
    ),
    nutrition: {
      calories: getNutrient("Calories", 300),
      protein: getNutrient("Protein", 10),
      carbohydrates: getNutrient("Carbohydrates", 30),
      fats: getNutrient("Fat", 10),
      fiber: getNutrient("Fiber", 5),
      sugar: getNutrient("Sugar", 8),
      sodium: getNutrient("Sodium", 400),
    },
    dietaryTags: [
      ...(recipe.vegetarian ? ["vegetarian"] : []),
      ...(recipe.vegan ? ["vegan"] : []),
      ...(recipe.glutenFree ? ["gluten-free"] : []),
      ...(recipe.dairyFree ? ["dairy-free"] : []),
    ],
    allergens: [],
    difficulty: recipe.readyInMinutes <= 30 ? "easy" : "medium",
    averageRating: 4,
    isActive: true,
    createdBy: adminId,
  };
};

// ---------------------------
// Fetch with retry
// ---------------------------
const fetchWithRetry = async (url, params) => {
  for (let i = 0; i <= CONFIG.maxRetries; i++) {
    try {
      const res = await axios.get(url, { params });
      return res.data;
    } catch (err) {
      if (i === CONFIG.maxRetries) throw err;
      await delay(1200);
    }
  }
};

// ---------------------------
// Fetch all recipes for a meal type
// ---------------------------
const fetchAllRecipes = async (mealType, target) => {
  console.log(`📡 Fetching ${target} ${mealType} recipes...`);
  const results = [];
  let offset = 0;

  const typeMapping = {
    lunch: ["salad", "sandwich", "main course"],
    dinner: ["main course"],
  };

  while (results.length < target) {
    for (const type of typeMapping[mealType]) {
      const params = {
        apiKey: SPOONACULAR_API_KEY,
        number: CONFIG.pageSize,
        offset,
        type,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        instructionsRequired: true,
      };

      const data = await fetchWithRetry(SPOONACULAR_BASE_URL, params);
      if (!data?.results?.length) continue;

      results.push(...data.results);
      if (results.length >= target) break;

      await delay(CONFIG.delayBetweenRequests);
    }
    offset += CONFIG.pageSize;
    if (offset > 1000) break; // Spoonacular limit
  }

  return results.slice(0, target);
};

// ---------------------------
// Main seeder
// ---------------------------
const seedMeals = async () => {
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

  const allMeals = [];
  for (const [type, count] of Object.entries(CONFIG.mealsPerType)) {
    const recipes = await fetchAllRecipes(type, count);
    console.log(`   → Fetched ${recipes.length} ${type} recipes`);
    for (const r of recipes) {
      try {
        const meal = mapRecipeToMeal(r, admin._id);
        allMeals.push(meal);
      } catch {}
    }
  }

  console.log(`💾 Inserting ${allMeals.length} meals...`);
  const inserted = await Meal.insertMany(allMeals, { ordered: false });
  console.log(`✅ Inserted ${inserted.length} meals`);
  process.exit(0);
};

seedMeals();
