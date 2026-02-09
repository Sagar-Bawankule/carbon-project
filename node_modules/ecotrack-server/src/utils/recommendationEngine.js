/**
 * AI-style Recommendation Engine
 * Generates personalized suggestions based on user activity patterns
 */

class RecommendationEngine {
  static recommendations = {
    energy: {
      high: [
        { title: 'Switch to LED Bulbs', description: 'LED bulbs use 75% less energy than incandescent lighting.', impact: 'Save up to 50 kg CO₂e/year' },
        { title: 'Unplug Idle Devices', description: 'Phantom power can account for 10% of your energy bill.', impact: 'Save up to 30 kg CO₂e/year' },
        { title: 'Adjust Thermostat', description: 'Lowering heating by 1°C can reduce energy use by 10%.', impact: 'Save up to 100 kg CO₂e/year' },
        { title: 'Use Smart Power Strips', description: 'Automatically cut power to devices in standby mode.', impact: 'Save up to 40 kg CO₂e/year' },
      ],
      moderate: [
        { title: 'Optimize Appliance Usage', description: 'Run dishwashers and washing machines with full loads only.', impact: 'Save up to 25 kg CO₂e/year' },
        { title: 'Air Dry Clothes', description: 'Skip the dryer when possible to save significant energy.', impact: 'Save up to 60 kg CO₂e/year' },
      ]
    },
    transport: {
      high: [
        { title: 'Consider Carpooling', description: 'Share rides to reduce per-person emissions significantly.', impact: 'Reduce transport emissions by 50%' },
        { title: 'Try Public Transit', description: 'Buses and trains produce far less CO₂ per passenger-km.', impact: 'Save up to 2 kg CO₂e per trip' },
        { title: 'Explore Electric Vehicles', description: 'EVs produce zero direct emissions and lower lifetime carbon.', impact: 'Reduce transport emissions by 70%' },
        { title: 'Combine Trips', description: 'Plan errands together to minimize total driving distance.', impact: 'Save up to 20 kg CO₂e/month' },
      ],
      moderate: [
        { title: 'Eco-Driving Techniques', description: 'Smooth acceleration and maintaining tire pressure improve efficiency.', impact: 'Improve fuel economy by 15%' },
        { title: 'Work From Home', description: 'When possible, remote work eliminates commute emissions entirely.', impact: 'Save 3-5 kg CO₂e per day' },
      ]
    },
    food: {
      high: [
        { title: 'Try Meatless Mondays', description: 'Reducing meat consumption one day a week makes a big difference.', impact: 'Save up to 200 kg CO₂e/year' },
        { title: 'Choose Local Produce', description: 'Locally sourced food reduces transportation emissions.', impact: 'Reduce food emissions by 10%' },
        { title: 'Reduce Food Waste', description: 'Plan meals and use leftovers to minimize waste.', impact: 'Save up to 100 kg CO₂e/year' },
        { title: 'Explore Plant-Based Options', description: 'Plant proteins have a fraction of the carbon footprint of meat.', impact: 'Save 2-5 kg CO₂e per meal' },
      ],
      moderate: [
        { title: 'Seasonal Eating', description: 'Eating in-season produce reduces energy for growing and transport.', impact: 'Reduce food emissions by 5%' },
        { title: 'Grow Your Own Herbs', description: 'Fresh herbs at home mean zero transport emissions.', impact: 'Small but meaningful impact' },
      ]
    },
    goods: {
      high: [
        { title: 'Buy Second-Hand', description: 'Pre-owned items require no new manufacturing emissions.', impact: 'Save 70-90% of item emissions' },
        { title: 'Choose Quality Over Quantity', description: 'Durable goods last longer, reducing replacement needs.', impact: 'Reduce goods emissions by 30%' },
        { title: 'Repair Before Replacing', description: 'Extending product life is better than recycling.', impact: 'Save manufacturing emissions entirely' },
      ],
      moderate: [
        { title: 'Avoid Fast Fashion', description: 'Quality clothing lasts years, not seasons.', impact: 'Save up to 50 kg CO₂e/year' },
        { title: 'Digital Over Physical', description: 'E-books and streaming reduce material consumption.', impact: 'Reduce product emissions significantly' },
      ]
    },
    general: [
      { title: 'Track Progress Weekly', description: 'Regular monitoring helps identify patterns and opportunities.', impact: 'Stay accountable and motivated' },
      { title: 'Set Realistic Goals', description: 'Gradual changes are more sustainable than drastic shifts.', impact: 'Long-term behavior change' },
      { title: 'Share Your Journey', description: 'Inspire others by sharing your carbon reduction achievements.', impact: 'Multiply your impact' },
    ],
    budgetExceeded: [
      { title: '⚠️ Budget Alert', description: 'You\'ve exceeded your monthly carbon budget. Review your highest-impact activities.', impact: 'Immediate action needed', priority: 'high' },
      { title: 'Focus on Big Wins', description: 'Transport and food typically offer the largest reduction opportunities.', impact: 'Significant impact', priority: 'high' },
    ],
    budgetWarning: [
      { title: '⚡ Approaching Limit', description: 'You\'re at 80% of your monthly budget. Consider reducing high-emission activities.', impact: 'Preventive action', priority: 'medium' },
    ]
  };

  /**
   * Generate personalized recommendations based on user data
   */
  static generateRecommendations(userData) {
    const { activities, goal, categoryTotals } = userData;
    const recommendations = [];

    // Check budget status
    if (goal) {
      const percentage = (goal.currentTotal / goal.monthlyLimit) * 100;
      if (percentage >= 100) {
        recommendations.push(...this.recommendations.budgetExceeded);
      } else if (percentage >= 80) {
        recommendations.push(...this.recommendations.budgetWarning);
      }
    }

    // Analyze each category
    if (categoryTotals) {
      const categories = ['energy', 'transport', 'food', 'goods'];
      const total = categoryTotals.total || 1;

      categories.forEach(category => {
        const categoryTotal = categoryTotals[category] || 0;
        const percentage = (categoryTotal / total) * 100;

        if (percentage > 30) {
          // High impact category
          const categoryRecs = this.recommendations[category]?.high || [];
          recommendations.push(...categoryRecs.slice(0, 2).map(rec => ({ ...rec, category })));
        } else if (percentage > 15) {
          // Moderate impact category
          const categoryRecs = this.recommendations[category]?.moderate || [];
          recommendations.push(...categoryRecs.slice(0, 1).map(rec => ({ ...rec, category })));
        }
      });
    }

    // Add general recommendations if we have few specific ones
    if (recommendations.length < 3) {
      recommendations.push(...this.recommendations.general.slice(0, 3 - recommendations.length));
    }

    // Limit total recommendations
    return recommendations.slice(0, 6);
  }

  /**
   * Get category-specific tips
   */
  static getCategoryTips(category) {
    const categoryRecs = this.recommendations[category];
    if (!categoryRecs) return this.recommendations.general;
    
    return [...(categoryRecs.high || []), ...(categoryRecs.moderate || [])];
  }
}

module.exports = RecommendationEngine;
