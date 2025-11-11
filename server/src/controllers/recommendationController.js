const Recommendation = require("../models/Recommendation");
const User = require("../models/User");
const Progress = require("../models/Progress");
const MealPlan = require("../models/MealPlan");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHandler");

// Helper function to generate AI recommendations based on user data
const generateRecommendations = async (user) => {
  const recommendations = [];

  // Get user's latest progress
  const latestProgress = await Progress.findOne({ user: user._id })
    .sort({ date: -1 })
    .limit(1);

  // Get active meal plan
  const activeMealPlan = await MealPlan.findOne({
    user: user._id,
    status: "active",
  });

  // Recommendation 1: Weight goal progress
  if (user.targetWeight && user.currentWeight) {
    const weightDiff = user.currentWeight - user.targetWeight;
    const progressDiff = latestProgress
      ? user.currentWeight - latestProgress.weight
      : 0;

    if (user.healthGoal === "lose" && weightDiff > 0) {
      if (progressDiff > 0 && progressDiff < 0.5) {
        recommendations.push({
          type: "progress",
          priority: "high",
          title: "Weight Loss Progress",
          description: `You're making progress! Consider increasing your activity level or adjusting your calorie intake slightly.`,
          reasoning: `You've lost ${Math.abs(progressDiff).toFixed(1)}kg, but progress is slow. Small adjustments can help accelerate results.`,
          actionSteps: [
            { step: "Increase daily activity by 15-20 minutes", completed: false },
            { step: "Review your meal plan adherence", completed: false },
            { step: "Consider consulting with a nutritionist", completed: false },
          ],
          generatedBy: "ai",
          confidence: 0.75,
        });
      } else if (progressDiff <= 0) {
        recommendations.push({
          type: "progress",
          priority: "critical",
          title: "Weight Loss Stalled",
          description: `Your weight loss has stalled. It's time to reassess your approach.`,
          reasoning: `No weight loss detected. This could be due to plateaus, inaccurate tracking, or need for plan adjustment.`,
          actionSteps: [
            { step: "Verify you're tracking all meals accurately", completed: false },
            { step: "Consider recalculating your calorie needs", completed: false },
            { step: "Review and adjust your meal plan", completed: false },
          ],
          generatedBy: "ai",
          confidence: 0.85,
        });
      }
    } else if (user.healthGoal === "gain" && weightDiff < 0) {
      if (progressDiff < 0 && Math.abs(progressDiff) < 0.5) {
        recommendations.push({
          type: "progress",
          priority: "high",
          title: "Weight Gain Progress",
          description: `You're gaining weight gradually. Ensure you're consuming enough calories and protein.`,
          reasoning: `You've gained ${Math.abs(progressDiff).toFixed(1)}kg. Continue monitoring to ensure steady progress.`,
          actionSteps: [
            { step: "Ensure you're meeting daily calorie targets", completed: false },
            { step: "Focus on protein-rich meals", completed: false },
            { step: "Track your progress weekly", completed: false },
          ],
          generatedBy: "ai",
          confidence: 0.75,
        });
      }
    }
  }

  // Recommendation 2: Meal plan adherence
  if (activeMealPlan) {
    const adherence = activeMealPlan.adherence.adherencePercentage || 0;
    if (adherence < 70) {
      recommendations.push({
        type: "meal",
        priority: adherence < 50 ? "high" : "medium",
        title: "Low Meal Plan Adherence",
        description: `Your meal plan adherence is ${adherence}%. Improving adherence will help you reach your goals faster.`,
        reasoning: `Low adherence suggests difficulty following the plan. Consider adjusting meal preferences or simplifying the plan.`,
        actionSteps: [
          { step: "Review meals you're skipping and why", completed: false },
          { step: "Update your dietary preferences if needed", completed: false },
          { step: "Set daily reminders for meals", completed: false },
        ],
        generatedBy: "ai",
        confidence: 0.8,
      });
    }
  }

  // Recommendation 3: Nutrition balance
  if (user.dailyCalorieTarget) {
    const calorieTarget = user.dailyCalorieTarget;
    if (calorieTarget < 1200) {
      recommendations.push({
        type: "nutrition",
        priority: "critical",
        title: "Very Low Calorie Target",
        description: `Your daily calorie target (${calorieTarget} calories) is very low. This may not be sustainable.`,
        reasoning: `Extremely low calorie targets can lead to nutrient deficiencies and metabolic slowdown.`,
        actionSteps: [
          { step: "Consult with a healthcare professional", completed: false },
          { step: "Consider a more moderate calorie deficit", completed: false },
          { step: "Focus on nutrient-dense foods", completed: false },
        ],
        generatedBy: "rule-based",
        confidence: 0.9,
      });
    }
  }

  // Recommendation 4: Activity level
  if (user.activityLevel === "sedentary" && user.healthGoal !== "maintain") {
    recommendations.push({
      type: "exercise",
      priority: "medium",
      title: "Increase Physical Activity",
      description: `Increasing your activity level can help you reach your ${user.healthGoal} weight goal faster.`,
      reasoning: `Sedentary lifestyle combined with weight goals benefits from increased activity.`,
      actionSteps: [
        { step: "Start with 15-20 minutes of daily walking", completed: false },
        { step: "Gradually increase activity level in profile", completed: false },
        { step: "Find activities you enjoy", completed: false },
      ],
      generatedBy: "ai",
      confidence: 0.7,
    });
  }

  // Recommendation 5: Profile completion
  if (!user.height || !user.currentWeight || !user.age) {
    recommendations.push({
      type: "general",
      priority: "low",
      title: "Complete Your Profile",
      description: `Complete your profile information for more accurate meal plan recommendations.`,
      reasoning: `Missing profile data prevents accurate calorie and nutrition calculations.`,
      actionSteps: [
        { step: "Add your height, weight, and age", completed: false },
        { step: "Update your health goals", completed: false },
        { step: "Set your dietary preferences", completed: false },
      ],
      generatedBy: "rule-based",
      confidence: 1.0,
    });
  }

  return recommendations;
};

// @desc    Create manual recommendation
// @route   POST /api/v1/recommendations
// @access  Private
exports.createRecommendation = async (req, res) => {
  try {
    const {
      type,
      priority,
      title,
      description,
      reasoning,
      actionSteps,
    } = req.body;

    if (!type || !title || !description) {
      return sendError(
        res,
        400,
        "Please provide type, title, and description"
      );
    }

    const recommendation = await Recommendation.create({
      user: req.user.id,
      type,
      priority: priority || "medium",
      title,
      description,
      reasoning,
      actionSteps: actionSteps || [],
      status: "active",
      generatedBy: "manual",
    });

    return sendSuccess(res, 201, recommendation);
  } catch (error) {
    console.error("Create recommendation error:", error);
    return sendError(res, 500, "Server error creating recommendation", error.message);
  }
};

// @desc    Generate AI recommendations for user
// @route   POST /api/v1/recommendations/generate-ai
// @access  Private
exports.generateRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Generate recommendations
    const recommendationData = await generateRecommendations(user);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendationData.map((rec) =>
        Recommendation.create({
          ...rec,
          user: user._id,
        })
      )
    );

    return sendSuccess(res, 201, {
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
    });
  } catch (error) {
    console.error("Generate recommendations error:", error);
    return sendError(res, 500, "Server error generating recommendations", error.message);
  }
};

// @desc    Get all recommendations for user
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { status, type, priority, page = 1, limit = 20 } = req.query;

    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const recommendations = await Recommendation.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Recommendation.countDocuments(query);

    return sendPaginated(res, recommendations, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return sendError(res, 500, "Server error fetching recommendations", error.message);
  }
};

// @desc    Get single recommendation
// @route   GET /api/recommendations/:id
// @access  Private
exports.getRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return sendError(res, 404, "Recommendation not found");
    }

    return sendSuccess(res, 200, recommendation);
  } catch (error) {
    console.error("Get recommendation error:", error);
    return sendError(res, 500, "Server error fetching recommendation", error.message);
  }
};

// @desc    Update recommendation status
// @route   PUT /api/recommendations/:id
// @access  Private
exports.updateRecommendation = async (req, res) => {
  try {
    const { status, applied, actionSteps } = req.body;

    let recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return sendError(res, 404, "Recommendation not found");
    }

    if (status) recommendation.status = status;
    if (applied !== undefined) {
      recommendation.applied = applied;
      recommendation.appliedAt = applied ? new Date() : null;
    }
    if (actionSteps) recommendation.actionSteps = actionSteps;

    recommendation.updatedAt = Date.now();
    await recommendation.save();

    return sendSuccess(res, 200, recommendation);
  } catch (error) {
    console.error("Update recommendation error:", error);
    return sendError(res, 500, "Server error updating recommendation", error.message);
  }
};

// @desc    Mark action step as completed
// @route   PUT /api/recommendations/:id/action-step/:stepIndex
// @access  Private
exports.completeActionStep = async (req, res) => {
  try {
    const { stepIndex } = req.params;

    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return sendError(res, 404, "Recommendation not found");
    }

    const index = parseInt(stepIndex);
    if (index < 0 || index >= recommendation.actionSteps.length) {
      return sendError(res, 400, "Invalid action step index");
    }

    recommendation.actionSteps[index].completed = true;
    recommendation.actionSteps[index].completedAt = new Date();
    recommendation.updatedAt = Date.now();

    await recommendation.save();

    return sendSuccess(res, 200, recommendation);
  } catch (error) {
    console.error("Complete action step error:", error);
    return sendError(res, 500, "Server error updating action step", error.message);
  }
};

// @desc    Get active recommendations
// @route   GET /api/recommendations/active
// @access  Private
exports.getActiveRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({
      user: req.user.id,
      status: "active",
    })
      .sort({ priority: 1, createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, {
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Get active recommendations error:", error);
    return sendError(res, 500, "Server error fetching active recommendations", error.message);
  }
};

// @desc    Dismiss recommendation
// @route   PUT /api/recommendations/:id/dismiss
// @access  Private
exports.dismissRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    recommendation.status = "dismissed";
    recommendation.updatedAt = Date.now();
    await recommendation.save();

    return sendSuccess(res, 200, recommendation, "Recommendation dismissed");
  } catch (error) {
    console.error("Dismiss recommendation error:", error);
    return sendError(res, 500, "Server error dismissing recommendation", error.message);
  }
};

// @desc    Delete recommendation
// @route   DELETE /api/v1/recommendations/:id
// @access  Private
exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return sendError(res, 404, "Recommendation not found");
    }

    await recommendation.deleteOne();

    return sendSuccess(res, 200, null, "Recommendation deleted successfully");
  } catch (error) {
    console.error("Delete recommendation error:", error);
    return sendError(res, 500, "Server error deleting recommendation", error.message);
  }
};

// @desc    Mark recommendation as applied
// @route   PUT /api/v1/recommendations/:id/apply
// @access  Private
exports.applyRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recommendation) {
      return sendError(res, 404, "Recommendation not found");
    }

    recommendation.applied = true;
    recommendation.appliedAt = new Date();
    recommendation.status = "completed";
    recommendation.updatedAt = Date.now();
    await recommendation.save();

    return sendSuccess(res, 200, recommendation, "Recommendation applied successfully");
  } catch (error) {
    console.error("Apply recommendation error:", error);
    return sendError(res, 500, "Server error applying recommendation", error.message);
  }
};

