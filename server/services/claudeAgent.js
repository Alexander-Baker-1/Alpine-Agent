const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class ClaudeAgent {
  constructor() {
    this.conversationHistory = new Map(); // Store conversations by session ID
  }

  /**
   * Parse user intent from natural language
   * Extracts structured shopping requirements
   */
  async parseIntent(userMessage, sessionId = 'default') {
    const systemPrompt = `You are a shopping assistant that extracts structured shopping requirements from natural language.

When a user describes what they want to buy, extract:
- budget (number)
- size (string)
- delivery_days (number, maximum days for delivery)
- warmth (string: "light", "medium", "warm", "extra warm")
- colors (array of strings)
- items_needed (array of category strings: "jacket", "pants", "base_layer", "gloves", "goggles", "helmet", "socks")
- prioritize (string: "budget", "delivery", "quality", or null)
- brands (array of preferred brand names, if mentioned)

Respond ONLY with a JSON object. No markdown, no explanation.

Example input: "I need a skiing outfit, budget $400, size M, delivery in 5 days, I want it warm"
Example output:
{
  "budget": 400,
  "size": "M",
  "delivery_days": 5,
  "warmth": "warm",
  "colors": [],
  "items_needed": ["jacket", "pants", "base_layer", "gloves", "goggles"],
  "prioritize": null,
  "brands": []
}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const responseText = message.content[0].text;
      
      // Parse JSON response
      const intent = JSON.parse(responseText);
      
      return {
        success: true,
        intent,
        rawResponse: responseText
      };

    } catch (error) {
      console.error('Error parsing intent:', error);
      return {
        success: false,
        error: error.message,
        intent: null
      };
    }
  }

  /**
   * Have a conversational interaction with the user
   * Maintains context and helps refine requirements
   */
  async chat(userMessage, sessionId = 'default', context = {}) {
    // Get or create conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    const history = this.conversationHistory.get(sessionId);

    const systemPrompt = `You are a helpful shopping assistant for skiing gear. You help users:
1. Clarify what they need
2. Understand their budget and constraints
3. Explain product recommendations
4. Answer questions about skiing gear

Current context:
${context.currentIntent ? `User's current requirements: ${JSON.stringify(context.currentIntent, null, 2)}` : 'No requirements specified yet'}
${context.cartItems ? `Items in cart: ${context.cartItems.length} items, total: $${context.cartTotal}` : 'Cart is empty'}

Be conversational, helpful, and concise. If the user hasn't specified their requirements yet, help them articulate what they need.`;

    try {
      // Add user message to history
      history.push({
        role: 'user',
        content: userMessage
      });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: history
      });

      const responseText = message.content[0].text;

      // Add assistant response to history
      history.push({
        role: 'assistant',
        content: responseText
      });

      // Keep history manageable (last 10 messages)
      if (history.length > 10) {
        this.conversationHistory.set(sessionId, history.slice(-10));
      }

      return {
        success: true,
        message: responseText,
        sessionId
      };

    } catch (error) {
      console.error('Error in chat:', error);
      return {
        success: false,
        error: error.message,
        message: "Sorry, I'm having trouble responding right now."
      };
    }
  }

  /**
   * Generate explanation for why products are ranked a certain way
   */
  async explainRanking(rankedProducts, userIntent) {
    const topProducts = rankedProducts.slice(0, 3);
    
    const systemPrompt = `You are a shopping assistant explaining product recommendations.

User is looking for: ${JSON.stringify(userIntent, null, 2)}

Top recommended products:
${topProducts.map((p, i) => `
${i + 1}. ${p.name} - ${p.retailer}
   Price: $${p.price}
   Score: ${(p.score * 100).toFixed(0)}/100
   Delivery: ${p.delivery_days} days
   Explanation: ${p.explanation}
`).join('\n')}

Explain in 2-3 sentences why these are the best matches for the user's needs. Be specific about what makes them good choices.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
      });

      return message.content[0].text;

    } catch (error) {
      console.error('Error explaining ranking:', error);
      return "These products match your requirements for price, delivery time, and quality.";
    }
  }

  /**
   * Suggest cheaper alternatives if over budget
   */
  async suggestBudgetAlternatives(currentOutfit, budget, allProducts) {
    const overBudget = currentOutfit.totalCost - budget;
    
    const systemPrompt = `User is over budget by $${overBudget}.

Current outfit total: $${currentOutfit.totalCost}
Budget: $${budget}

Items in current outfit:
${currentOutfit.items.map(item => `- ${item.name} ($${item.price})`).join('\n')}

Suggest 1-2 specific ways to reduce cost. Be practical and specific.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
      });

      return message.content[0].text;

    } catch (error) {
      console.error('Error suggesting alternatives:', error);
      return "Try looking for a more budget-friendly jacket or pants to stay within budget.";
    }
  }

  /**
   * Clear conversation history for a session
   */
  clearHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }
}

module.exports = new ClaudeAgent();