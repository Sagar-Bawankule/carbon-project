// CO2 Emission Factors (kg CO2e per unit)
// Sources: EPA, DEFRA, and various environmental agencies

const emissionFactors = {
  // Transport (kg CO2e per km)
  transport: {
    electric: 0.05,      // Electric vehicle
    hybrid: 0.12,        // Hybrid vehicle
    petrol: 0.21,        // Petrol/Gasoline car
    diesel: 0.27,        // Diesel car
    motorcycle: 0.11,    // Motorcycle
    bus: 0.089,          // Public bus
    train: 0.041,        // Train/Metro
    bicycle: 0,          // Bicycle
    walking: 0,          // Walking
    flight_short: 0.255, // Short-haul flight (<1500km)
    flight_long: 0.195,  // Long-haul flight (>1500km)
  },

  // Energy
  electricity: 0.42,     // kg CO2e per kWh (average grid)
  naturalGas: 2.0,       // kg CO2e per cubic meter
  heatingOil: 2.68,      // kg CO2e per liter
  propane: 1.51,         // kg CO2e per liter

  // Food (kg CO2e per kg of food)
  food: {
    beef: 27.0,
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 5.0,
    eggs: 4.8,
    dairy: 3.2,
    cheese: 13.5,
    rice: 2.7,
    vegetables: 2.0,
    fruits: 1.1,
    legumes: 0.9,
    bread: 0.8,
    plantBased: 0.7,
  },

  // Diet types (daily average kg CO2e)
  dietTypes: {
    meatHeavy: 7.19,
    average: 5.63,
    pescatarian: 3.91,
    vegetarian: 3.81,
    vegan: 2.89,
  },

  // Shopping/Goods (kg CO2e per dollar spent)
  goods: {
    clothing: 0.5,
    electronics: 0.8,
    furniture: 0.4,
    household: 0.3,
    personalCare: 0.25,
    entertainment: 0.2,
    other: 0.35,
  },
};

module.exports = emissionFactors;
