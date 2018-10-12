/**
 * Levels
*/
/** Rewards is always the same object, but can contain of 4 things:
  * coins
  * items (array of objects, laid out like {id: item ID, quantity: number})
  * multiplier (number)
  * title (string)
*/
const LEVELS = {
  1: { reward: { coins: 500 }, exp: 100 },
  3: { reward: { coins: 1500 }, exp: 300 },
  5: { reward: { multiplier: 2.5 }, exp: 500 },
  7: { reward: { coins: 4e3, items: [{ tidepod: 2 }] }, exp: 700 },
  9: { reward: { coins: 4e3, items: [{ spinner: 3 }] }, exp: 900 },
  10: { reward: { multiplier: 5 }, exp: 1000 },
  11: { reward: { items: [{ reversal: 1 }] }, exp: 1100 },
  13: { reward: { coins: 5e3, items: [{ inviscloak: 3 }] }, exp: 1300 },
  15: { reward: { multiplier: 5 }, exp: 1500 },
  17: { reward: { coins: 5e3 }, exp: 1700 },
  19: { reward: { coins: 7e3 }, exp: 1900 },
  20: { reward: { coins: 1e4 }, exp: 2000 },
  21: { reward: { coins: 500 }, exp: 2100 },
  23: { reward: { coins: 500 }, exp: 2300 },
  25: { reward: { multiplier: 7.5 }, exp: 2500 }
};

const ItemTypes = {
  ITEM: 'Item',
  COLLECTABLE: 'Collectable',
  TOOL: 'Tool',
  POWERUP: 'Power-up',
  BOX: 'Loot Box'
};

/**
 * Loot Boxes
*/
// The amount of arrays in `items` represents getting multiple items of different tiers (ie, one amazing item, multiple medium items)
// It's important to note that people can sell items meaning they can gain back value on items gained in boxes
// Descriptions need better wording, not sure if I'll keep them
const BOXES = {
  normie: { // 50 to 500 coins, 20% chance to get a low item
    id: 'normie',
    name: 'Normie Box',
    type: ItemTypes.BOX,
    description: 'Can\'t get more basic than this',
    consumable: true,
    rewards: {
      coins: { min: 50, max: 500 },
      items: [{ sand: 1 }, { reversal: 1 }]
    }
  },
  meme: { // 1000 to 3000 coins, 75% chance to get a medium item
    id: 'meme',
    name: 'Meme Box',
    type: ItemTypes.BOX,
    description: 'Something actually worth opening',
    consumable: true,
    rewards: {
      coins: { min: 1e3, max: 3e3 },
      items: [{ phone: 1 }, { tidepod: 1 }]
    }
  },
  dank: { // 7500 to 10000 coins, 100% chance to get one amazing item, multiple medium items
    id: 'dank',
    name: 'Dank Box',
    type: ItemTypes.BOX,
    description: 'Dank rewards for a dank donator',
    consumable: true,
    rewards: {
      coins: { min: 7.5e3, max: 1e4 },
      items: [[{ inviscloak: 1 }, { reversal: 1 }], [{ tidepod: 3 }, { alcohol: 1 }, { phone: 2 }]]
    }
  }
};

/**
 * Items
*/
const ITEMS = Object.assign({
  tidepod: {
    name: 'Tidepod',
    id: 'tidepod',
    type: ItemTypes.ITEM,
    cost: 15e3,
    consumable: true
  },
  inviscloak: {
    name: 'Invisibility Cloak',
    id: 'inviscloak',
    type: ItemTypes.POWERUP,
    cost: 35e3,
    consumable: true
  },
  reversal: {
    name: 'Reversal Card',
    id: 'reversal',
    type: ItemTypes.POWERUP,
    cost: 20e3,
    consumable: true
  },
  spinner: {
    name: 'Fidget Spinner',
    id: 'reversal',
    type: ItemTypes.POWERUP,
    cost: 20e3,
    consumable: true
  },
  pepe: {
    name: 'Rare Pepe',
    id: 'pepe',
    type: ItemTypes.COLLECTABLE,
    cost: 1e5,
    consumable: false
  }
}, BOXES);

// Shop items are only visible in the shop if they have a cost. All items are purchasable by default unless their cost is undefined or 0.
const SHOP = Object.keys(ITEMS)
  .filter(key => ITEMS[key].cost)
  .reduce((obj, key) => {
    obj[key] = ITEMS[key];
    return obj;
  }, {});

module.exports = { shop: SHOP, levels: LEVELS, boxes: BOXES, items: ITEMS, ItemTypes };
