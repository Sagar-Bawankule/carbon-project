/**
 * Free Emission Factor APIs for India
 * 
 * This service uses FREE APIs and data sources for India-specific emission factors
 */

const axios = require('axios');
const indiaEmissionFactors = require('../config/indiaEmissionFactors');

/**
 * FREE API OPTIONS FOR INDIA
 * ===========================
 * 
 * 1. CO2.js by The Green Web Foundation (FREE & Open Source)
 *    - No API key needed
 *    - npm install @tgwf/co2
 *    - Great for digital carbon (websites, data transfer)
 * 
 * 2. Electricity Maps API (FREE tier - 30 requests/hour)
 *    - Real-time India grid carbon intensity
 *    - https://api.electricitymaps.com/
 * 
 * 3. Carbon Interface API (FREE - 200 requests/month)
 *    - https://www.carboninterface.com/
 *    - Good for vehicles, electricity, flights
 * 
 * 4. Grok AI (X.AI) - Dynamic Recommendations
 *    - https://api.x.ai/
 *    - AI-powered personalized eco recommendations
 */

// API Keys from environment
const ELECTRICITY_MAPS_API_KEY = process.env.ELECTRICITY_MAPS_API_KEY || 'uo8jDShLB8XscgmvWPMP';
const CARBON_INTERFACE_API_KEY = process.env.CARBON_INTERFACE_API_KEY || 'vzApz6RxhQKfpfLUw4ifQ';
const GROK_API_KEY = process.env.GROK_API_KEY || 'xai-inyDvx85RnbaSLVDABomiC6XiPdm8ECELSDJ7OFLLs6Apjb4qEFlTe3gLs7MJ6IWlb7n1Iq0NRta6zW1';

// API URLs
const ELECTRICITY_MAPS_URL = 'https://api.electricitymaps.com/v3';
const CARBON_INTERFACE_URL = 'https://www.carboninterface.com/api/v1';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// ========================================
// 1. ELECTRICITY MAPS API (Real-time Grid)
// ========================================

/**
 * Get real-time carbon intensity for India
 * FREE: 30 requests/hour
 */
const getIndiaGridCarbonIntensity = async (zone = 'IN') => {
  // India zone codes: IN, IN-DL (Delhi), IN-MH (Maharashtra), IN-KA (Karnataka), etc.
  
  try {
    console.log('🔌 Fetching real-time India grid carbon intensity...');
    
    const response = await axios.get(
      `${ELECTRICITY_MAPS_URL}/carbon-intensity/latest`,
      {
        params: { zone },
        headers: { 'auth-token': ELECTRICITY_MAPS_API_KEY },
        timeout: 10000,
      }
    );

    console.log('✅ Electricity Maps API response received');
    
    return {
      carbonIntensity: response.data.carbonIntensity, // gCO2eq/kWh
      zone: response.data.zone,
      datetime: response.data.datetime,
      source: 'Electricity Maps (Real-time)',
      isRealTime: true,
      factorKgPerKwh: response.data.carbonIntensity / 1000, // Convert to kg
    };
  } catch (error) {
    console.error('⚠️ Electricity Maps API error:', error.message);
    return {
      carbonIntensity: 710, // India average in gCO2/kWh
      source: 'CEA India (Fallback)',
      isRealTime: false,
      factorKgPerKwh: 0.71,
    };
  }
};

// ========================================
// 2. CARBON INTERFACE API (FREE TIER)
// ========================================

// ========================================
// 2. CARBON INTERFACE API (Vehicles/Flights)
// ========================================

/**
 * Calculate vehicle emissions
 * FREE: 200 requests/month
 */
const getVehicleEmissions = async (distanceKm, vehicleType = 'petrol_car') => {
  try {
    console.log('🚗 Fetching vehicle emissions from Carbon Interface...');
    
    const response = await axios.post(
      `${CARBON_INTERFACE_URL}/estimates`,
      {
        type: 'vehicle',
        distance_unit: 'km',
        distance_value: distanceKm,
        vehicle_model_id: '7268a9b7-17e8-4c8d-acca-57059252afe9', // Medium car
      },
      {
        headers: {
          Authorization: `Bearer ${CARBON_INTERFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Carbon Interface API response received');

    return {
      co2e_kg: response.data.data.attributes.carbon_kg,
      carbon_mt: response.data.data.attributes.carbon_mt,
      distance_km: distanceKm,
      source: 'Carbon Interface API',
    };
  } catch (error) {
    console.error('⚠️ Carbon Interface API error:', error.message);
    // Use local India factors as fallback
    const factor = indiaEmissionFactors.transport[vehicleType] || 
                   indiaEmissionFactors.transport.petrol_car;
    return {
      co2e_kg: distanceKm * factor,
      distance_km: distanceKm,
      source: 'Local India Factors (Fallback)',
    };
  }
};

/**
 * Calculate flight emissions
 */
const getFlightEmissions = async (originAirport, destinationAirport, passengers = 1) => {
  try {
    console.log('✈️ Fetching flight emissions from Carbon Interface...');
    
    const response = await axios.post(
      `${CARBON_INTERFACE_URL}/estimates`,
      {
        type: 'flight',
        passengers: passengers,
        legs: [
          { departure_airport: originAirport, destination_airport: destinationAirport }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${CARBON_INTERFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Flight emissions received');

    return {
      co2e_kg: response.data.data.attributes.carbon_kg,
      distance_km: response.data.data.attributes.distance_value,
      source: 'Carbon Interface API',
    };
  } catch (error) {
    console.error('⚠️ Flight emissions API error:', error.message);
    
    // Common India flight routes distances
    const commonRoutes = {
      'DEL-BOM': 1150, 'BOM-DEL': 1150,
      'DEL-BLR': 1740, 'BLR-DEL': 1740,
      'DEL-CCU': 1300, 'CCU-DEL': 1300,
      'BOM-BLR': 845,  'BLR-BOM': 845,
      'DEL-MAA': 1760, 'MAA-DEL': 1760,
      'BOM-CCU': 1660, 'CCU-BOM': 1660,
      'DEL-HYD': 1260, 'HYD-DEL': 1260,
      'BOM-HYD': 620,  'HYD-BOM': 620,
      'DEL-GOI': 1500, 'GOI-DEL': 1500,
      'BOM-GOI': 440,  'GOI-BOM': 440,
    };
    
    const routeKey = `${originAirport}-${destinationAirport}`;
    const distanceKm = commonRoutes[routeKey] || 1000;
    
    return {
      co2e_kg: distanceKm * 0.255 * passengers,
      distance_km: distanceKm,
      source: 'Local Estimate (Fallback)',
    };
  }
};

// ========================================
// 3. GROK AI - Dynamic Recommendations
// ========================================

/**
 * Generate personalized eco recommendations using Grok AI
 * @param {object} userStats - User's carbon footprint statistics
 * @returns {object} - AI-generated recommendations
 */
const getGrokRecommendations = async (userStats) => {
  try {
    console.log('🤖 Generating AI recommendations with Grok...');
    
    const systemPrompt = `You are EcoTrack AI, an expert environmental advisor for Indian users. 
Your role is to provide personalized, actionable recommendations to reduce carbon footprint.
Focus on practical tips relevant to Indian lifestyle, climate, and available options.
Be encouraging, specific, and provide estimates of CO2 savings where possible.
Keep responses concise but impactful. Use emojis sparingly for friendliness.
Always provide 3-5 specific recommendations.`;

    const userPrompt = `Based on this user's carbon footprint data, provide personalized recommendations:

User Statistics:
- Total Monthly Emissions: ${userStats.totalMonthly || 0} kg CO₂e
- Monthly Limit: ${userStats.monthlyLimit || 500} kg CO₂e
- Status: ${userStats.totalMonthly > userStats.monthlyLimit ? 'OVER LIMIT ⚠️' : 'Within limit ✓'}

Breakdown:
- Energy: ${userStats.energy || 0} kg CO₂e (${userStats.energyPercent || 0}%)
- Transport: ${userStats.transport || 0} kg CO₂e (${userStats.transportPercent || 0}%)
- Food: ${userStats.food || 0} kg CO₂e (${userStats.foodPercent || 0}%)
- Shopping: ${userStats.goods || 0} kg CO₂e (${userStats.goodsPercent || 0}%)

User Profile:
- Location: ${userStats.state || 'India'}
- Diet Type: ${userStats.dietType || 'Not specified'}
- Primary Transport: ${userStats.primaryTransport || 'Not specified'}

Highest Impact Category: ${userStats.highestCategory || 'Unknown'}

Please provide personalized recommendations to help reduce their carbon footprint, focusing on their highest impact areas. Include specific actions and estimated CO2 savings.`;

    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-4-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ Grok AI recommendations received');

    const aiResponse = response.data.choices[0].message.content;
    
    // Parse recommendations into structured format
    const recommendations = parseGrokResponse(aiResponse, userStats);
    
    return {
      success: true,
      rawResponse: aiResponse,
      recommendations: recommendations,
      source: 'Grok AI (X.AI)',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('⚠️ Grok AI error:', error.message);
    
    // Return fallback recommendations
    return {
      success: false,
      recommendations: getFallbackRecommendations(userStats),
      source: 'Local Recommendations (Fallback)',
      error: error.message,
    };
  }
};

/**
 * Parse Grok response into structured recommendations
 */
const parseGrokResponse = (response, userStats) => {
  const recommendations = [];
  
  // Split response by common patterns
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentRec = null;
  
  for (const line of lines) {
    // Check if it's a numbered recommendation
    const numberedMatch = line.match(/^(\d+[\.\)]|\-|\•|\*)\s*(.+)/);
    
    if (numberedMatch) {
      if (currentRec) {
        recommendations.push(currentRec);
      }
      
      const text = numberedMatch[2].trim();
      currentRec = {
        id: recommendations.length + 1,
        text: text,
        category: detectCategory(text),
        priority: detectPriority(text, userStats),
        potentialSavings: extractSavings(text),
      };
    } else if (currentRec && line.trim()) {
      // Append to current recommendation
      currentRec.text += ' ' + line.trim();
    }
  }
  
  if (currentRec) {
    recommendations.push(currentRec);
  }
  
  // If parsing failed, return as single recommendation
  if (recommendations.length === 0) {
    return [{
      id: 1,
      text: response,
      category: 'general',
      priority: 'medium',
    }];
  }
  
  return recommendations.slice(0, 5); // Max 5 recommendations
};

/**
 * Detect category from recommendation text
 */
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  
  if (lower.includes('electric') || lower.includes('power') || lower.includes('ac') || 
      lower.includes('fan') || lower.includes('led') || lower.includes('solar') ||
      lower.includes('electricity') || lower.includes('energy')) {
    return 'energy';
  }
  if (lower.includes('car') || lower.includes('bike') || lower.includes('metro') || 
      lower.includes('bus') || lower.includes('train') || lower.includes('walk') ||
      lower.includes('cycle') || lower.includes('transport') || lower.includes('travel') ||
      lower.includes('commute') || lower.includes('flight')) {
    return 'transport';
  }
  if (lower.includes('meat') || lower.includes('vegetarian') || lower.includes('food') || 
      lower.includes('diet') || lower.includes('eat') || lower.includes('meal') ||
      lower.includes('chicken') || lower.includes('mutton') || lower.includes('local')) {
    return 'food';
  }
  if (lower.includes('shopping') || lower.includes('buy') || lower.includes('purchase') ||
      lower.includes('reuse') || lower.includes('recycle') || lower.includes('clothes')) {
    return 'goods';
  }
  
  return 'general';
};

/**
 * Detect priority based on user stats
 */
const detectPriority = (text, userStats) => {
  const category = detectCategory(text);
  
  if (category === userStats.highestCategory) {
    return 'high';
  }
  
  if (text.toLowerCase().includes('immediately') || 
      text.toLowerCase().includes('urgent') ||
      text.toLowerCase().includes('significant')) {
    return 'high';
  }
  
  return 'medium';
};

/**
 * Extract potential savings from text
 */
const extractSavings = (text) => {
  // Look for patterns like "save 50kg", "reduce 20%", etc.
  const kgMatch = text.match(/(\d+)\s*(kg|kilogram)/i);
  if (kgMatch) {
    return { value: parseInt(kgMatch[1]), unit: 'kg CO₂e/month' };
  }
  
  const percentMatch = text.match(/(\d+)\s*%/);
  if (percentMatch) {
    return { value: parseInt(percentMatch[1]), unit: '% reduction' };
  }
  
  return null;
};

/**
 * Fallback recommendations when API fails
 */
const getFallbackRecommendations = (userStats) => {
  const recommendations = [];
  
  // Based on highest category
  if (userStats.highestCategory === 'transport' || userStats.transportPercent > 30) {
    recommendations.push({
      id: 1,
      text: 'Consider using Delhi Metro or local trains for your commute. Public transport can reduce your transport emissions by up to 80%.',
      category: 'transport',
      priority: 'high',
      potentialSavings: { value: 50, unit: 'kg CO₂e/month' },
    });
  }
  
  if (userStats.highestCategory === 'energy' || userStats.energyPercent > 30) {
    recommendations.push({
      id: 2,
      text: 'Switch to LED bulbs and use AC at 24°C instead of lower temperatures. This can save up to 30% on electricity bills and emissions.',
      category: 'energy',
      priority: 'high',
      potentialSavings: { value: 30, unit: '% reduction' },
    });
  }
  
  if (userStats.highestCategory === 'food' || userStats.foodPercent > 25) {
    recommendations.push({
      id: 3,
      text: 'Try having 2-3 vegetarian days per week. Indian vegetarian cuisine is delicious and can reduce food emissions by 40%.',
      category: 'food',
      priority: 'medium',
      potentialSavings: { value: 40, unit: '% reduction' },
    });
  }
  
  // Add general recommendations
  recommendations.push({
    id: recommendations.length + 1,
    text: 'Carry a reusable water bottle and shopping bags. Avoiding single-use plastics saves about 5kg CO₂e monthly.',
    category: 'goods',
    priority: 'medium',
    potentialSavings: { value: 5, unit: 'kg CO₂e/month' },
  });
  
  recommendations.push({
    id: recommendations.length + 1,
    text: 'Unplug devices when not in use. Standby power consumption accounts for 5-10% of household electricity use in India.',
    category: 'energy',
    priority: 'low',
    potentialSavings: { value: 10, unit: '% reduction' },
  });
  
  return recommendations.slice(0, 5);
};

/**
 * Get quick tip from Grok AI
 */
const getQuickTip = async (category) => {
  try {
    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-4-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are EcoTrack AI. Provide a single, short, actionable eco-tip for Indian users. Keep it under 100 characters.' 
          },
          { 
            role: 'user', 
            content: `Give me one quick tip to reduce ${category} carbon emissions in India.` 
          }
        ],
        stream: false,
        temperature: 0.8,
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        timeout: 10000,
      }
    );

    return {
      tip: response.data.choices[0].message.content.trim(),
      category: category,
      source: 'Grok AI',
    };
  } catch (error) {
    const fallbackTips = {
      energy: '💡 Set AC to 24°C - saves 6% electricity per degree!',
      transport: '🚇 Metro travel emits 85% less CO₂ than driving alone.',
      food: '🥗 One vegetarian day weekly saves 100kg CO₂ yearly.',
      goods: '♻️ Repair before replacing - extends product life & saves emissions.',
    };
    
    return {
      tip: fallbackTips[category] || '🌱 Every small action counts towards a greener India!',
      category: category,
      source: 'Local Tips',
    };
  }
};

// ========================================
// 3. CO2.JS - DIGITAL CARBON (FREE)
// ========================================

/**
 * For digital carbon footprint (websites, streaming, etc.)
 * Install: npm install @tgwf/co2
 * No API key needed!
 */
const getDigitalCarbonFootprint = async (dataTransferGB) => {
  try {
    // Dynamic import for CO2.js
    const { co2 } = await import('@tgwf/co2');
    const oneByte = new co2({ model: 'swd' }); // Sustainable Web Design model
    
    const bytes = dataTransferGB * 1024 * 1024 * 1024;
    const emissions = oneByte.perByte(bytes, true); // green hosting = true
    
    return {
      co2e_g: emissions,
      co2e_kg: emissions / 1000,
      source: 'CO2.js (Green Web Foundation)',
    };
  } catch (error) {
    // Fallback calculation
    // Average: 0.2g CO2 per MB for green hosting
    return {
      co2e_g: dataTransferGB * 1024 * 0.2,
      co2e_kg: dataTransferGB * 1024 * 0.2 / 1000,
      source: 'Local Estimate',
    };
  }
};

// ========================================
// 4. INDIA-SPECIFIC CALCULATIONS
// ========================================

/**
 * Get emission factor for Indian state
 */
const getStateElectricityFactor = (state) => {
  const stateLower = state.toLowerCase().replace(/\s+/g, '_');
  return {
    factor: indiaEmissionFactors.stateElectricityFactors[stateLower] || 
            indiaEmissionFactors.stateElectricityFactors.average,
    state: state,
    source: 'CEA India 2023-24',
  };
};

/**
 * Calculate LPG cylinder emissions (common in India)
 */
const getLPGEmissions = (cylindersUsed, cylinderWeightKg = 14.2) => {
  // Standard domestic cylinder is 14.2 kg
  const totalKg = cylindersUsed * cylinderWeightKg;
  return {
    co2e_kg: totalKg * indiaEmissionFactors.energy.lpg,
    cylinders: cylindersUsed,
    source: 'India LPG Standard',
  };
};

/**
 * Calculate two-wheeler emissions (very common in India)
 */
const getTwoWheelerEmissions = (distanceKm, fuelType = 'petrol') => {
  const factorKey = fuelType === 'electric' ? 'two_wheeler_electric' : 'two_wheeler_petrol';
  const factor = indiaEmissionFactors.transport[factorKey];
  
  return {
    co2e_kg: distanceKm * factor,
    factor: factor,
    source: 'India Transport Factors',
  };
};

/**
 * Calculate Indian diet emissions
 */
const getIndianMealEmissions = (mealType) => {
  // Common Indian meals
  const mealEmissions = {
    'veg_thali': 1.2,           // Rice, dal, sabzi, roti, curd
    'non_veg_thali': 3.5,       // With chicken
    'south_indian_breakfast': 0.8, // Idli, dosa, sambar
    'north_indian_breakfast': 1.0, // Paratha, curd
    'biryani_veg': 1.5,
    'biryani_chicken': 3.0,
    'biryani_mutton': 5.0,
    'pizza': 2.5,
    'burger': 3.0,
    'chai': 0.1,                // Cup of tea
    'coffee': 0.15,
  };

  return {
    co2e_kg: mealEmissions[mealType] || 1.5,
    meal: mealType,
    source: 'India Food Factors',
  };
};

// ========================================
// SETUP INSTRUCTIONS
// ========================================

const getSetupInstructions = () => {
  return `
╔════════════════════════════════════════════════════════════════╗
║     APIs CONFIGURED FOR ECOTRACK INDIA                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✅ ELECTRICITY MAPS - Real-time India Grid                   ║
║     Status: Configured                                         ║
║     Zone: IN (India)                                          ║
║                                                                ║
║  ✅ CARBON INTERFACE - Vehicle & Flight Emissions             ║
║     Status: Configured                                         ║
║     Limit: 200 requests/month                                 ║
║                                                                ║
║  ✅ GROK AI (X.AI) - Dynamic Recommendations                  ║
║     Status: Configured                                         ║
║     Model: grok-4-latest                                        ║
║                                                                ║
║  ✅ LOCAL INDIA DATA - Always Available                       ║
║     - CEA electricity factors (state-wise)                    ║
║     - India transport (cars, bikes, auto, metro)              ║
║     - Indian food items (dal, paneer, biryani, etc.)          ║
║     - LPG cylinder calculations                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `;
};

/**
 * Test all API connections
 */
const testAPIConnections = async () => {
  console.log('\n🔧 Testing API Connections...\n');
  const results = {};
  
  // Test Electricity Maps
  try {
    const gridResult = await getIndiaGridCarbonIntensity('IN');
    results.electricityMaps = {
      status: gridResult.isRealTime ? '✅ Connected' : '⚠️ Using Fallback',
      carbonIntensity: gridResult.carbonIntensity,
      source: gridResult.source,
    };
    console.log(`Electricity Maps: ${results.electricityMaps.status}`);
  } catch (error) {
    results.electricityMaps = { status: '❌ Failed', error: error.message };
  }
  
  // Test Carbon Interface
  try {
    const vehicleResult = await getVehicleEmissions(10, 'petrol_car');
    results.carbonInterface = {
      status: vehicleResult.source.includes('API') ? '✅ Connected' : '⚠️ Using Fallback',
      testResult: `10km = ${vehicleResult.co2e_kg.toFixed(2)} kg CO₂e`,
      source: vehicleResult.source,
    };
    console.log(`Carbon Interface: ${results.carbonInterface.status}`);
  } catch (error) {
    results.carbonInterface = { status: '❌ Failed', error: error.message };
  }
  
  // Test Grok AI
  try {
    const tipResult = await getQuickTip('energy');
    results.grokAI = {
      status: tipResult.source === 'Grok AI' ? '✅ Connected' : '⚠️ Using Fallback',
      testTip: tipResult.tip,
      source: tipResult.source,
    };
    console.log(`Grok AI: ${results.grokAI.status}`);
  } catch (error) {
    results.grokAI = { status: '❌ Failed', error: error.message };
  }
  
  console.log('\n📊 Test Results:', JSON.stringify(results, null, 2));
  return results;
};

module.exports = {
  // Real-time APIs
  getIndiaGridCarbonIntensity,
  getVehicleEmissions,
  getFlightEmissions,
  getDigitalCarbonFootprint,
  
  // Grok AI Recommendations
  getGrokRecommendations,
  getQuickTip,
  
  // India-specific
  getStateElectricityFactor,
  getLPGEmissions,
  getTwoWheelerEmissions,
  getIndianMealEmissions,
  
  // Info & Testing
  getSetupInstructions,
  testAPIConnections,
  
  // Raw factors
  indiaEmissionFactors,
  
  // API Keys (for reference)
  API_KEYS: {
    ELECTRICITY_MAPS: ELECTRICITY_MAPS_API_KEY ? 'Configured' : 'Not Set',
    CARBON_INTERFACE: CARBON_INTERFACE_API_KEY ? 'Configured' : 'Not Set',
    GROK_AI: GROK_API_KEY ? 'Configured' : 'Not Set',
  },
};
