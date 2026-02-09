/**
 * India-Specific Emission Factors
 * 
 * Sources:
 * - Central Electricity Authority (CEA) - India Grid Emission Factor
 * - Bureau of Energy Efficiency (BEE) India
 * - IPCC Guidelines
 * - GHG Platform India
 */

const indiaEmissionFactors = {
  // India Electricity Grid - CEA 2023-24
  // Source: https://cea.nic.in/co2-baseline-database/
  energy: {
    electricity: 0.71,        // kg CO₂e/kWh (India grid average - CEA)
    natural_gas: 2.0,         // kg CO₂e/m³ (PNG)
    lpg: 2.98,                // kg CO₂e/kg (LPG cylinder)
    coal: 2.42,               // kg CO₂e/kg
    kerosene: 2.52,           // kg CO₂e/L
    diesel_generator: 2.68,   // kg CO₂e/L
    solar: 0.05,              // kg CO₂e/kWh
    wind: 0.01,               // kg CO₂e/kWh
  },

  // Transport - India specific
  // Source: IPCC + India fuel standards
  transport: {
    petrol_car: 0.18,         // kg CO₂e/km (average Indian car)
    diesel_car: 0.22,         // kg CO₂e/km
    cng_car: 0.12,            // kg CO₂e/km (popular in Delhi/Mumbai)
    electric_car: 0.06,       // kg CO₂e/km (using India grid)
    two_wheeler_petrol: 0.05, // kg CO₂e/km (scooter/bike)
    two_wheeler_electric: 0.02, // kg CO₂e/km
    auto_rickshaw: 0.08,      // kg CO₂e/km
    auto_rickshaw_cng: 0.06,  // kg CO₂e/km
    bus: 0.06,                // kg CO₂e/km per passenger
    metro: 0.03,              // kg CO₂e/km (Delhi/Mumbai metro)
    local_train: 0.04,        // kg CO₂e/km (Mumbai local, etc.)
    train_ac: 0.02,           // kg CO₂e/km (Rajdhani, Shatabdi)
    train_sleeper: 0.01,      // kg CO₂e/km
    domestic_flight: 0.255,   // kg CO₂e/km
    bicycle: 0,
    walking: 0,
    e_rickshaw: 0.02,         // kg CO₂e/km
  },

  // Food - India context
  // Source: IPCC + Indian agricultural studies
  food: {
    mutton: 39.2,             // kg CO₂e/kg (goat meat - common in India)
    chicken: 6.9,             // kg CO₂e/kg
    fish: 5.0,                // kg CO₂e/kg (freshwater fish)
    eggs: 4.8,                // kg CO₂e/kg
    paneer: 8.0,              // kg CO₂e/kg
    milk: 3.2,                // kg CO₂e/L
    curd_yogurt: 3.5,         // kg CO₂e/kg
    ghee: 12.0,               // kg CO₂e/kg
    rice: 2.7,                // kg CO₂e/kg (includes paddy methane)
    wheat_atta: 1.4,          // kg CO₂e/kg
    dal_lentils: 0.9,         // kg CO₂e/kg
    vegetables: 1.5,          // kg CO₂e/kg
    fruits: 1.0,              // kg CO₂e/kg
    cooking_oil: 3.0,         // kg CO₂e/L
    sugar: 1.2,               // kg CO₂e/kg
    tea: 3.0,                 // kg CO₂e/kg (dry leaves)
    coffee: 5.0,              // kg CO₂e/kg
  },

  // Diet multipliers for India
  dietTypes: {
    vegan: 0.4,
    vegetarian: 0.5,          // Common in India
    eggetarian: 0.55,         // Veg + eggs (common)
    non_vegetarian: 1.0,
    high_meat: 1.3,
  },

  // Goods - India pricing context
  goods: {
    clothing_local: 8.0,      // kg CO₂e/item (local brands)
    clothing_branded: 15.0,   // kg CO₂e/item
    electronics: 40.0,        // kg CO₂e/item
    mobile_phone: 70.0,       // kg CO₂e/unit
    furniture_wood: 50.0,     // kg CO₂e/item
    furniture_metal: 80.0,    // kg CO₂e/item
    appliances: 100.0,        // kg CO₂e/item
    plastic_items: 6.0,       // kg CO₂e/kg
    online_shopping: 0.5,     // kg CO₂e per ₹100 spent
  },

  // Region-wise electricity factors (India states)
  // Source: CEA State-wise CO2 emissions
  stateElectricityFactors: {
    'delhi': 0.69,
    'maharashtra': 0.72,
    'karnataka': 0.65,
    'tamil_nadu': 0.68,
    'gujarat': 0.74,
    'rajasthan': 0.76,
    'west_bengal': 0.82,
    'uttar_pradesh': 0.78,
    'kerala': 0.45,           // High hydro
    'himachal_pradesh': 0.35, // High hydro
    'punjab': 0.71,
    'haryana': 0.75,
    'andhra_pradesh': 0.70,
    'telangana': 0.72,
    'madhya_pradesh': 0.80,
    'odisha': 0.85,
    'jharkhand': 0.88,
    'chhattisgarh': 0.90,     // Coal heavy
    'average': 0.71,
  },
};

module.exports = indiaEmissionFactors;
