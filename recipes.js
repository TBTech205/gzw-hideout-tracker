// Recipe data. Edit this file when the game patches or you add new stations.
// time = production time in seconds, inputs = { itemId: amountNeededPerCraft }
// Every craft is assumed to produce 1 of the item.
window.RECIPES = {
  items: {
    // Raw materials
    opium_gum: {
      name: 'Opium Gum',
      type: 'raw'
    },
    garden_lime: {
      name: 'Garden Lime',
      type: 'raw'
    },
    ammonium_chloride: {
      name: 'Ammonium Chloride',
      type: 'raw'
    },
    purified_water: {
      name: 'Purified Water',
      type: 'raw'
    },
    citric_acid: {
      name: 'Citric Acid',
      type: 'raw'
    },
    sulfuric_acid: {
      name: 'Sulfuric Acid',
      type: 'raw'
    },
    methylparaben: {
      name: 'Methylparaben',
      type: 'raw'
    },
    saline: {
      name: 'Saline',  
      type: 'raw'
    },
    acetic_anhydride: {
      name: 'Acetic Anhydride',
      type: 'raw'
    },
    sodium_carbonate: {
      name: 'Sodium Carbonate',
      type: 'raw'
    },
    chloroform: {
      name: 'Chloroform',
      type: 'raw'
    },
    ether: {
      name: 'Ether',
      type: 'raw'
    },
    hydrochloric_acid: {
      name: 'Hydrochloric Acid',
      type: 'raw'
    },
    ethyl_alcohol: {
      name: 'Ethyl Alcohol',
      type: 'raw'
    },

    // Laboratory production
    low_base: {
      name: 'Low-Quality Morphine Base',
      type: 'craft',
      time: 3600,
      inputs: { opium_gum: 1, garden_lime: 1, ammonium_chloride: 1, purified_water: 1 }
    },
    medium_base: {
      name: 'Medium-Quality Morphine Base',
      type: 'craft',
      time: 5400,
      inputs: { opium_gum: 1, garden_lime: 1, ammonium_chloride: 1, purified_water: 1 }
    },
    high_base: {
      name: 'High-Quality Morphine Base',
      type: 'craft',
      time: 7200,
      inputs: { opium_gum: 1, garden_lime: 1, ammonium_chloride: 1, purified_water: 1 }
    },
    gray_heroin: {
      name: 'Gray Heroin',
      type: 'craft',
      time: 7200,
      inputs: { medium_base: 1, acetic_anhydride: 1, sodium_carbonate: 1, chloroform: 1 }
    },
    white_heroin: {
      name: 'Pure White Heroin',
      type: 'craft',
      time: 9000,
      inputs: { high_base: 1, acetic_anhydride: 1, ether: 1, hydrochloric_acid: 1, ethyl_alcohol: 1 }
    }
  },

  // New installs start with an empty stash. Fill it in on the Stash tab.
  seedStash: {}
};
