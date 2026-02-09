const emissionFactors = require('../config/emissionFactors');

/**
 * Carbon Footprint Calculation Engine
 * Implements: CF_total = CF_energy + CF_transport + CF_food + CF_goods
 */

class CalculationEngine {
  /**
   * Calculate Energy Footprint
   * Formula: CF_energy = (EF_elec × kWh) + (EF_fuel × Liters)
   */
  static calculateEnergy(subCategory, value) {
    const factors = {
      electricity: emissionFactors.electricity,
      naturalGas: emissionFactors.naturalGas,
      heatingOil: emissionFactors.heatingOil,
      propane: emissionFactors.propane,
    };

    const factor = factors[subCategory];
    if (!factor) {
      throw new Error(`Unknown energy subcategory: ${subCategory}`);
    }

    return value * factor;
  }

  /**
   * Calculate Transport Footprint
   * Formula: CF_transport = Σ(EF_mode_m × Distance_m)
   */
  static calculateTransport(subCategory, distance) {
    const factor = emissionFactors.transport[subCategory];
    if (factor === undefined) {
      throw new Error(`Unknown transport mode: ${subCategory}`);
    }

    return distance * factor;
  }

  /**
   * Calculate Food Footprint
   * Formula: CF_food = Σ(EF_food_j × Quantity_j)
   */
  static calculateFood(subCategory, quantity) {
    // Check if it's a diet type
    if (emissionFactors.dietTypes[subCategory]) {
      return emissionFactors.dietTypes[subCategory] * quantity; // quantity = days
    }

    // Check if it's a specific food item
    const factor = emissionFactors.food[subCategory];
    if (factor === undefined) {
      throw new Error(`Unknown food type: ${subCategory}`);
    }

    return quantity * factor;
  }

  /**
   * Calculate Goods/Shopping Footprint
   * Formula: CF_goods = Σ(EF_goods × Expenditure)
   */
  static calculateGoods(subCategory, expenditure) {
    const factor = emissionFactors.goods[subCategory];
    if (factor === undefined) {
      throw new Error(`Unknown goods category: ${subCategory}`);
    }

    return expenditure * factor;
  }

  /**
   * Main calculation method
   * Routes to appropriate category calculator
   */
  static calculate(category, subCategory, value) {
    let co2;

    switch (category) {
      case 'energy':
        co2 = this.calculateEnergy(subCategory, value);
        break;
      case 'transport':
        co2 = this.calculateTransport(subCategory, value);
        break;
      case 'food':
        co2 = this.calculateFood(subCategory, value);
        break;
      case 'goods':
        co2 = this.calculateGoods(subCategory, value);
        break;
      default:
        throw new Error(`Unknown category: ${category}`);
    }

    // Round to 2 decimal places
    return Math.round(co2 * 100) / 100;
  }

  /**
   * Calculate total footprint from multiple activities
   */
  static calculateTotal(activities) {
    const totals = {
      energy: 0,
      transport: 0,
      food: 0,
      goods: 0,
    };

    activities.forEach((activity) => {
      if (totals[activity.category] !== undefined) {
        totals[activity.category] += activity.calculatedCO2;
      }
    });

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return {
      ...totals,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Get emission factors for frontend display
   */
  static getEmissionFactors() {
    return emissionFactors;
  }
}

module.exports = CalculationEngine;
