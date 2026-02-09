/**
 * Emission Factor Service
 * Fetches real-time emission factors from external APIs
 * 
 * Sources:
 * - Climatiq API (aggregated EPA, DEFRA, IPCC data)
 * - US EPA eGRID for electricity grid factors
 * - UK DEFRA annual conversion factors
 */

const axios = require('axios');
const emissionFactors = require('../config/emissionFactors');

// API Configuration
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io/data/v1';

/**
 * Fetch emission factor from Climatiq API
 * @param {string} activityId - Climatiq activity ID
 * @param {object} parameters - Activity parameters (e.g., distance, energy)
 * @returns {object} - Emission estimate with CO2e value
 */
const getClimatiqEstimate = async (activityId, parameters) => {
  if (!CLIMATIQ_API_KEY) {
    console.warn('Climatiq API key not set, using local emission factors');
    return null;
  }

  try {
    const response = await axios.post(
      `${CLIMATIQ_BASE_URL}/estimate`,
      {
        emission_factor: {
          activity_id: activityId,
        },
        parameters,
      },
      {
        headers: {
          Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      co2e: response.data.co2e,
      co2e_unit: response.data.co2e_unit,
      source: response.data.emission_factor.source,
      year: response.data.emission_factor.year,
    };
  } catch (error) {
    console.error('Climatiq API error:', error.message);
    return null;
  }
};

/**
 * Activity ID mappings for Climatiq API
 * See: https://www.climatiq.io/explorer
 */
const CLIMATIQ_ACTIVITY_IDS = {
  // Transport
  transport: {
    petrol_car: 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_medium-vehicle_age_na-vehicle_weight_na',
    diesel_car: 'passenger_vehicle-vehicle_type_car-fuel_source_diesel-engine_size_medium-vehicle_age_na-vehicle_weight_na',
    electric_car: 'passenger_vehicle-vehicle_type_car-fuel_source_bev-engine_size_na-vehicle_age_na-vehicle_weight_na',
    bus: 'passenger_vehicle-vehicle_type_bus-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na',
    train: 'passenger_train-route_type_commuter_rail-fuel_source_na',
    domestic_flight: 'passenger_flight-route_type_domestic-aircraft_type_na-distance_na-class_na-rf_included',
    long_haul_flight: 'passenger_flight-route_type_long_haul-aircraft_type_na-distance_na-class_na-rf_included',
  },
  // Energy
  energy: {
    electricity_us: 'electricity-supply_grid-source_supplier_mix',
    electricity_uk: 'electricity-supply_grid-source_supplier_mix',
    natural_gas: 'fuel_type_natural_gas-fuel_use_stationary_combustion',
  },
  // Food
  food: {
    beef: 'consumer_goods-type_meat_products_beef',
    chicken: 'consumer_goods-type_meat_products_poultry',
    vegetables: 'consumer_goods-type_fruit_vegetables',
    dairy: 'consumer_goods-type_dairy_products',
  },
};

/**
 * Get transport emission factor with API fallback
 */
const getTransportEmissionFactor = async (transportType, distanceKm, region = 'US') => {
  const activityId = CLIMATIQ_ACTIVITY_IDS.transport[transportType];
  
  if (activityId && CLIMATIQ_API_KEY) {
    const estimate = await getClimatiqEstimate(activityId, {
      distance: distanceKm,
      distance_unit: 'km',
    });
    
    if (estimate) {
      return {
        co2e: estimate.co2e,
        source: 'Climatiq API',
        factor: estimate.co2e / distanceKm,
      };
    }
  }
  
  // Fallback to local emission factors
  const localFactor = emissionFactors.transport[transportType] || 0;
  return {
    co2e: localFactor * distanceKm,
    source: 'Local (EPA/DEFRA)',
    factor: localFactor,
  };
};

/**
 * Get electricity emission factor by region
 * US regions use EPA eGRID subregions
 */
const getElectricityEmissionFactor = async (region = 'US-AVG') => {
  // EPA eGRID subregion codes
  const eGridRegions = {
    'US-AVG': 0.42,      // US Average
    'US-CAMX': 0.25,     // California
    'US-NWPP': 0.30,     // Northwest
    'US-RFCW': 0.45,     // Midwest
    'US-SRSO': 0.48,     // Southeast
    'US-TXRE': 0.41,     // Texas
    'UK': 0.21,          // UK Grid (DEFRA 2024)
    'EU-AVG': 0.28,      // EU Average
  };

  // Try Climatiq API first
  if (CLIMATIQ_API_KEY) {
    const estimate = await getClimatiqEstimate(
      CLIMATIQ_ACTIVITY_IDS.energy.electricity_us,
      { energy: 1, energy_unit: 'kWh' }
    );
    
    if (estimate) {
      return {
        factor: estimate.co2e,
        source: estimate.source,
        year: estimate.year,
      };
    }
  }

  // Fallback to local eGRID data
  return {
    factor: eGridRegions[region] || eGridRegions['US-AVG'],
    source: 'EPA eGRID 2022',
    year: 2022,
  };
};

/**
 * Get food emission factor
 */
const getFoodEmissionFactor = async (foodType) => {
  const activityId = CLIMATIQ_ACTIVITY_IDS.food[foodType];
  
  if (activityId && CLIMATIQ_API_KEY) {
    const estimate = await getClimatiqEstimate(activityId, {
      money: 1,
      money_unit: 'usd',
    });
    
    if (estimate) {
      return {
        factor: estimate.co2e,
        source: 'Climatiq API',
      };
    }
  }
  
  // Fallback to local
  return {
    factor: emissionFactors.food[foodType] || 0,
    source: 'Local (DEFRA)',
  };
};

/**
 * Sync emission factors from external sources
 * Call this periodically to update local cache
 */
const syncEmissionFactors = async () => {
  console.log('🔄 Syncing emission factors from external sources...');
  
  // This would update a database cache of emission factors
  // For now, we just validate API connectivity
  
  if (!CLIMATIQ_API_KEY) {
    console.log('⚠️  No Climatiq API key - using local emission factors');
    return { success: false, message: 'API key not configured' };
  }

  try {
    // Test API connectivity
    const testEstimate = await getClimatiqEstimate(
      CLIMATIQ_ACTIVITY_IDS.transport.petrol_car,
      { distance: 1, distance_unit: 'km' }
    );
    
    if (testEstimate) {
      console.log('✅ Climatiq API connected successfully');
      console.log(`   Source: ${testEstimate.source}, Year: ${testEstimate.year}`);
      return { success: true, source: testEstimate.source };
    }
  } catch (error) {
    console.error('❌ Failed to sync emission factors:', error.message);
  }
  
  return { success: false, message: 'API connection failed' };
};

module.exports = {
  getTransportEmissionFactor,
  getElectricityEmissionFactor,
  getFoodEmissionFactor,
  syncEmissionFactors,
  CLIMATIQ_ACTIVITY_IDS,
};
