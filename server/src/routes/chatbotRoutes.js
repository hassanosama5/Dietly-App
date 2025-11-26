// routes/chatbotRoutes.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Initialize Gemini AI
let genAI;
let geminiAvailable = false;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiAvailable = true;
    console.log("Gemini AI initialized successfully");
  } else {
    console.log("GEMINI_API_KEY not found, using fallback responses");
  }
} catch (error) {
  console.log("Gemini AI initialization failed:", error.message);
}

// POST /api/v1/chatbot/message - Send message to AI coach
router.post("/message", protect, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    let aiResponse;
    let source = "fallback";

    if (geminiAvailable && genAI) {
      try {
        // Try different model names - use gemini-pro as it's widely available
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build conversation context
        const historyText = conversationHistory
          .slice(-6)
          .map((msg) => `${msg.isBot ? "Assistant" : "User"}: ${msg.text}`)
          .join("\n");

        const prompt = `
You are Dietly AI Coach, a friendly nutrition assistant. Help with diet, nutrition, and meal planning.

Guidelines:
- Keep responses concise (2-4 sentences)
- Be practical and encouraging
- Focus on nutrition and healthy habits
- No medical advice
- Reference Dietly app features when relevant

${historyText ? `Previous conversation:\n${historyText}\n\n` : ""}
User: ${message}

Assistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponse = response.text().trim();
        aiResponse = aiResponse.replace(/^Assistant:\s*/i, "").trim();
        source = "gemini";
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall back to our own responses
        aiResponse = getEnhancedFallbackResponse(message);
        source = "fallback";
      }
    } else {
      aiResponse = getEnhancedFallbackResponse(message);
      source = "fallback";
    }

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      source: source,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);

    const fallbackResponse = getEnhancedFallbackResponse(req.body.message);

    res.json({
      success: true,
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      source: "fallback",
      note: "AI service temporarily unavailable",
    });
  }
});

// Enhanced fallback responses
function getEnhancedFallbackResponse(userMessage = "") {
  const message = (userMessage || "").toLowerCase();

  const responses = {
    hello:
      "Hello! I'm your Dietly AI Coach. I can help you with nutrition advice, meal planning, weight management, and healthy eating tips. What would you like to know?",
    hi: "Hi there! I'm here to help with diet and nutrition questions. You can ask me about meal planning, healthy recipes, or browse our 400+ meal library!",
    "weight loss":
      "For healthy weight loss:\n• Aim for a 500-calorie daily deficit\n• Focus on protein-rich meals to stay full\n• Include strength training 2-3x weekly\n• Stay hydrated and get quality sleep\n\nCheck our meal library for weight-loss friendly recipes!",
    "lose weight":
      "Great goal! For sustainable weight loss:\n• Eat plenty of vegetables and lean proteins\n• Track your progress in the app\n• Be consistent with your routine\n• Don't skip meals\n\nOur personalized meal plans can help you stay on track!",
    protein:
      "Excellent protein sources include:\n• Chicken, turkey, and fish\n• Eggs and Greek yogurt\n• Lentils, beans, and tofu\n• Protein powders\n• Nuts and seeds\n\nWe have many high-protein recipes in our meal library!",
    "meal plan":
      "Our AI meal planner creates personalized weekly plans based on:\n• Your calorie and protein targets\n• Dietary preferences and allergies\n• Cooking time and skill level\n• Your health goals\n\nTry generating your first plan in the 'Meal Plans' section!",
    "healthy eating":
      "Key principles of healthy eating:\n• Fill half your plate with vegetables\n• Include lean protein with each meal\n• Choose whole grains over refined\n• Include healthy fats like avocado and nuts\n• Limit processed foods and sugars\n\nBrowse our recipes for balanced meal ideas!",
    calories:
      "Calorie needs depend on your goals:\n• Weight loss: 500-calorie deficit daily\n• Maintenance: Balance calories in vs out\n• Muscle gain: 300-500 calorie surplus\n\nOur meal planner automatically calculates your daily targets!",
    breakfast:
      "Healthy breakfast ideas:\n• Greek yogurt with berries and nuts\n• Oatmeal with banana and peanut butter\n• Scrambled eggs with vegetables\n• Protein smoothie with spinach\n• Whole grain toast with avocado\n\nWe have 100+ breakfast recipes in our library!",
    snack:
      "Healthy snack options:\n• Apple slices with peanut butter\n• Greek yogurt with honey\n• Vegetable sticks with hummus\n• Handful of almonds\n• Cottage cheese with fruit\n• Protein bar or shake",
    workout:
      "For exercise nutrition:\n• Pre-workout: Carbs for energy (banana, oats)\n• Post-workout: Protein for recovery (shake, chicken)\n• Stay hydrated before, during, and after\n• Listen to your body's hunger signals",
    water:
      "Hydration guidelines:\n• 8-10 glasses (2-2.5L) daily minimum\n• More if you exercise or in hot weather\n• Water-rich foods like fruits help\n• Carry a water bottle as a reminder\n• Drink when you feel thirsty",
    carbs:
      "Healthy carbohydrate sources:\n• Whole grains (oats, brown rice, quinoa)\n• Fruits (berries, apples, bananas)\n• Vegetables (sweet potatoes, carrots)\n• Legumes (lentils, chickpeas)\n• Limit refined carbs and sugars",
    default:
      "I specialize in nutrition and meal planning! Ask me about:\n• Weight management strategies\n• Healthy recipe ideas\n• Meal prep and planning\n• Nutrition basics\n• Exercise nutrition\n\nOr explore our 400+ meal library for cooking inspiration!",
  };

  // Find the best matching response
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }

  return responses.default;
}

// GET /api/v1/chatbot/health - Check chatbot service health
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Dietly AI Coach",
    status: geminiAvailable ? "operational" : "fallback_mode",
    timestamp: new Date().toISOString(),
    available_models: ["gemini-pro"],
  });
});

module.exports = router;
