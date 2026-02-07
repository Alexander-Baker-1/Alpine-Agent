// Ranking engine - scores products based on multiple criteria

class RankingEngine {
  /**
   * Rank products based on user preferences and constraints
   * @param {Array} products - List of products to rank
   * @param {Object} preferences - User preferences (budget, delivery, warmth, etc.)
   * @returns {Array} - Sorted products with scores and explanations
   */
  rankProducts(products, preferences = {}) {
    const scoredProducts = products.map(product => {
      const scores = this.calculateScores(product, preferences);
      const totalScore = this.calculateTotalScore(scores, preferences);
      const explanation = this.generateExplanation(scores, product);

      return {
        ...product,
        score: totalScore,
        scoreBreakdown: scores,
        explanation
      };
    });

    // Sort by score (highest first)
    return scoredProducts.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate individual scores for different criteria
   */
  calculateScores(product, preferences) {
    return {
      priceScore: this.scorePriceFit(product.price, preferences.budget),
      deliveryScore: this.scoreDelivery(product.delivery_days, preferences.delivery_days),
      specsScore: this.scoreSpecs(product, preferences),
      preferenceScore: this.scorePreferences(product, preferences),
      ratingScore: this.scoreRating(product.rating)
    };
  }

  /**
   * Score how well the price fits the budget
   * Best score: under budget with good value
   */
  scorePriceFit(price, budget) {
    if (!budget) return 0.5; // Neutral if no budget specified

    if (price > budget) {
      // Over budget - penalty increases with how far over
      const overPercentage = ((price - budget) / budget) * 100;
      return Math.max(0, 1 - (overPercentage / 50)); // 0 if 50%+ over budget
    }

    // Under budget - good, but not too cheap (might be low quality)
    const percentOfBudget = (price / budget) * 100;
    
    if (percentOfBudget < 30) {
      return 0.6; // Very cheap might be low quality
    } else if (percentOfBudget < 70) {
      return 0.9; // Good value
    } else {
      return 1.0; // Close to budget, maximizing value
    }
  }

  /**
   * Score delivery time against deadline
   */
  scoreDelivery(deliveryDays, maxDeliveryDays) {
    if (!maxDeliveryDays) return 0.5; // Neutral if no deadline

    if (deliveryDays > maxDeliveryDays) {
      return 0; // Fails deadline - zero score
    }

    // Faster is better, but diminishing returns
    const daysUnderDeadline = maxDeliveryDays - deliveryDays;
    return Math.min(1, 0.6 + (daysUnderDeadline * 0.1));
  }

  /**
   * Score technical specifications (waterproof, warmth, etc.)
   */
  scoreSpecs(product, preferences) {
    if (!product.specs) return 0.5;

    let score = 0.5;
    const specs = product.specs;

    // Waterproof rating (for jackets/pants)
    if (specs.waterproof_rating) {
      const rating = parseInt(specs.waterproof_rating);
      if (rating >= 20000) score += 0.2; // Excellent
      else if (rating >= 15000) score += 0.15; // Very good
      else if (rating >= 10000) score += 0.1; // Good
      else score += 0.05; // Basic
    }

    // Warmth/insulation
    if (preferences.warmth === 'extra warm' || preferences.warmth === 'very warm') {
      if (specs.insulation && specs.insulation !== 'none') {
        score += 0.15;
      }
      if (specs.temperature_range && specs.temperature_range.includes('-20')) {
        score += 0.1;
      }
    }

    // Material quality (merino wool bonus for base layers)
    if (product.category === 'base_layer' && specs.material) {
      if (specs.material.includes('merino')) score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Score based on user preferences (color, brand, etc.)
   */
  scorePreferences(product, preferences) {
    let score = 0.5;

    // Color preference
    if (preferences.colors && preferences.colors.length > 0) {
      const matchesColor = preferences.colors.some(color => 
        product.color.toLowerCase().includes(color.toLowerCase())
      );
      if (matchesColor) score += 0.2;
    }

    // Brand preference
    if (preferences.brands && preferences.brands.length > 0) {
      const matchesBrand = preferences.brands.some(brand =>
        product.name.toLowerCase().includes(brand.toLowerCase())
      );
      if (matchesBrand) score += 0.15;
    }

    // Retailer preference
    if (preferences.preferred_retailers && preferences.preferred_retailers.length > 0) {
      if (preferences.preferred_retailers.includes(product.retailer)) {
        score += 0.15;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Score based on product rating
   */
  scoreRating(rating) {
    if (!rating) return 0.5;
    
    // Normalize rating to 0-1 scale (assuming 5-star system)
    return rating / 5;
  }

  /**
   * Calculate total weighted score
   */
  calculateTotalScore(scores, preferences) {
    // Default weights
    let weights = {
      priceScore: 0.30,      // 30% - price fit to budget
      deliveryScore: 0.25,   // 25% - delivery feasibility
      specsScore: 0.25,      // 25% - technical specs quality
      preferenceScore: 0.10, // 10% - color/brand preferences
      ratingScore: 0.10      // 10% - customer rating
    };

    // Adjust weights based on user priorities
    if (preferences.prioritize === 'budget') {
      weights.priceScore = 0.50;
      weights.specsScore = 0.20;
    } else if (preferences.prioritize === 'delivery') {
      weights.deliveryScore = 0.45;
      weights.priceScore = 0.25;
    } else if (preferences.prioritize === 'quality') {
      weights.specsScore = 0.40;
      weights.ratingScore = 0.20;
      weights.priceScore = 0.20;
    }

    // Calculate weighted sum
    return (
      scores.priceScore * weights.priceScore +
      scores.deliveryScore * weights.deliveryScore +
      scores.specsScore * weights.specsScore +
      scores.preferenceScore * weights.preferenceScore +
      scores.ratingScore * weights.ratingScore
    );
  }

  /**
   * Generate human-readable explanation for ranking
   */
  generateExplanation(scores, product) {
    const reasons = [];

    // Price explanation
    if (scores.priceScore >= 0.8) {
      reasons.push('excellent value for price');
    } else if (scores.priceScore >= 0.6) {
      reasons.push('good price point');
    } else if (scores.priceScore < 0.3) {
      reasons.push('over budget');
    }

    // Delivery explanation
    if (scores.deliveryScore === 1.0) {
      reasons.push(`fast delivery (${product.delivery_days} days)`);
    } else if (scores.deliveryScore === 0) {
      reasons.push('delivery too slow');
    }

    // Specs explanation
    if (scores.specsScore >= 0.8) {
      reasons.push('excellent technical specs');
    } else if (scores.specsScore >= 0.6) {
      reasons.push('good quality specs');
    }

    // Rating explanation
    if (scores.ratingScore >= 0.9) {
      reasons.push('highly rated');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'meets basic requirements';
  }

  /**
   * Find the best complete outfit within budget
   * Ensures one item from each required category
   */
  findBestOutfit(rankedProducts, preferences) {
    const requiredCategories = preferences.items_needed || [
      'jacket', 'pants', 'base_layer', 'gloves', 'goggles'
    ];

    const budget = preferences.budget || Infinity;
    
    // Group products by category
    const byCategory = {};
    requiredCategories.forEach(cat => {
      byCategory[cat] = rankedProducts.filter(p => p.category === cat);
    });

    // Try to find best combination within budget
    return this.findBestCombination(byCategory, requiredCategories, budget);
  }

  /**
   * Find best combination of items within budget
   * Uses greedy algorithm with backtracking
   */
  findBestCombination(byCategory, categories, budget) {
    const outfit = [];
    let totalCost = 0;

    // First pass: pick highest-scored item from each category
    for (const category of categories) {
      const items = byCategory[category];
      if (!items || items.length === 0) continue;

      // Find best item that fits remaining budget
      const remainingBudget = budget - totalCost;
      const affordableItems = items.filter(item => item.price <= remainingBudget);

      if (affordableItems.length > 0) {
        const bestItem = affordableItems[0]; // Already sorted by score
        outfit.push(bestItem);
        totalCost += bestItem.price;
      }
    }

    return {
      items: outfit,
      totalCost,
      withinBudget: totalCost <= budget,
      categories: outfit.map(item => item.category),
      missingCategories: categories.filter(cat => 
        !outfit.some(item => item.category === cat)
      )
    };
  }
}

module.exports = new RankingEngine();