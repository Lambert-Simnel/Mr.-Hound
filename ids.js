

module.exports =
{
  store: function(name, id)
  {
    module.exports[name.toLowerCase()] = id;
    module.exports[id] = name;
  },

  //Discord ids
  OWNER_ID: "212328740233936896",
  GUILD_ID: "253548414162173952",
  BOT_ID: "264320933429248003",
  ADMIN_ID: "253550883156000768",
  MOD_ID: "260420633823805440",
  PROPHET_ID: "260420462817837056",
  CELESTIAL_CLOCKMAKER_ID: "253551130712342528",
  HOUNDS_ID: "263002098055118848",
  ARENA_ID: "265969239842750485",
  GLADIATOR_ID: "307814883586473994",
  "307814883586473994": "Gladiator",
  "264320933429248003": "Bot",
  "253550883156000768": "Admin",
  "260420633823805440": "Mod",
  "260420462817837056": "Prophet",
  "253551130712342528": "Celestial Clockmaker",
  "263002098055118848": "Hound",

  //Char/form stats
  LVL: "level",
  LVL_POINTS: "level-up points",
  XP: "experience",
  ACTIVE_EFF: "active effects",
  FORM: "form",
  SIZE: "size",
  FACTORS: "factors",
  BASE_FACTORS: "base factors",
  SHARES: "shares",
  HP_INC: "hp increments",
  MAX_HP: "maximum hp",
  CURR_HP: "current hp",
  REM_HP: "remainder hp",
  AFFL: "afflictions",
  PROT: "protection",
  PROT_BODY: "body protection",
  PROT_HEAD: "head protection",
  PROT_SHLD: "shield protection",
  MR: "mr",
  MRL: "morale",
  STR: "strength",
  ATK: "attack",
  DEF: "defence",
  PREC: "precision",
  ENC: "encumbrance",
  FAT: "fatigue",
  APS: "ap",
  PATHS: "paths",
  PROPS: "properties",
  PARTS: "parts",
  SLOTS: "slots",
  CAT: "category",
  ATKS: "attacks",
  TRANSITIONS: "transitions",
  START_POINTS: "starting points",
  TRANSITION_POINTS: "transition points",

  //Item stats
  DMG: "damage",
  PARRY: "parry",
  LENGTH: "length",
  NBR_ATKS: "number of attacks",
  DMG_TYPE: "damage type",
  ON_HIT: "on hit",
  ON_DMG: "on damage",
  CAN_REPEL: "can repel",
  SLOT: "slot",
  REQ_SLOTS: "required slots",
  RAR: "rarity",

  //Item categories
  ANIMAL: "animal",
  AXES: "axes",


  //slots
  HANDS: "hands",
  HEAD: "head",
  BODY: "body",
  FEET: "feet",
  MISC: "misc",

  //parts
  EYE: "eye",
  ARM: "arm",
  LEG: "leg",
  WING: "wing",
  SHLD: "shield",

  //damage types
  BLUNT: "blunt",
  PIERCE: "pierce",
  SLASH: "slash",
  COLD: "cold",
  DRAIN: "drain life",
  PARALYSIS: "paralysis",
  POISON: "poison",
  SHOCK: "shock",
  UNTYPED: "untyped",
  WEB: "web",

  //form props
  ANIMAL: "animal",
  AWE: "awe",
  BERSERK: "berserker",
  COLD_AURA: "cold aura",
  ETHEREAL: "ethereal",
  FIRE_SHLD: "fire shield",
  FIRSTSHAPE: "firstshape",
  GLAMOUR: "glamour",
  HEAT_AURA: "heat aura",
  SECONDSHAPE: "secondshape",
  SHAPECHANGE: "shapechange",
  STONE: "stone-being",
  LIFELESS: "lifeless",
  MINDLESS: "mindless",
  POISON_BARBS: "poison barbs",
  POISON_SKIN: "poison skin",
  RECUP: "recuperation",
  REGEN: "regeneration",
  RES_COLD: function() {return "resist " + this.COLD;},
  RES_FIRE: function() {return "resist " + this.FIRE;},
  RES_POISON: function() {return "resist " + this.POISON;},
  RES_SHOCK: function() {return "resist " + this.SHOCK;},
  RES_BLUNT: function() {return "resist " + this.BLUNT;},
  RES_PIERCE: function() {return "resist " + this.PIERCE;},
  RES_SLASH: function() {return "resist " + this.SLASH;},
  TRAMPLE: "trample",

  //item props
  AP: "armor piercing",
  AN: "armor negating",
  AOE: "area of effect",
  BARKSKIN: "barkskin",
  BONUS: "bonus",
  CAPPED: "capped damage",
  CHARGE: "charge",
  DEMONBANE: "demonbane",
  FLAIL: "flail",
  HEALTH: "health",
  MAGIC: "magical",
  MRN: "mr negates",
  NO_FIRE: "no fire",
  NO_SHIELDS: "ignores shields",
  NO_STR: "strength not added",
  ONCE: "single use",
  REINVIG: "reinvigoration",
  REQ_LIFE: "requires life",
  REQ_MIND: "requires mind",
  SIEGE: "siege bonus",
  SIZE_RES: "size resist",
  STUN: "stun",
  TWIST_FATE: "twist fate",
  UNDEADBANE: "undeadbane",
  ENHANCE: "enhance",

  //consumable props
  INSTANT_EFF: "instant effects",
  ONGOING_EFF: "ongoing effects",
  DURATION: "duration",
  ENHANCED_HEAL: "enhanced healing",
  HEALING: "healing",


  //The key inside which the member's status effects during a battle will be kept track
  STATUS: "status",
  ON_FIRE: "on fire",
  WEBBED: "webbed",
  PARALYZED: "paralyzed",
  FREEZING: "freezing",
  POISONED: "poisoned",
  UNCONSCIOUS: "unconscious",

  //afflictions
  DMGD: "damaged",
  LOST: "lost",
  BATTLE_FRIGHT: "battle fright",
  CHEST_WOUND: "chest wound",
  CRIPPLED: "crippled",
  DMGD_ARM: function() {return this.DMGD + " " + this.ARM;},
  DMGD_EYE: function() {return this.DMGD + " " + this.EYE;},
  DMGD_HEAD: function() {return this.DMGD + " " + this.HEAD;},
  DMGD_WING: function() {return this.DMGD + " " + this.WING;},
  DEMENTIA: "dementia",
  DISEASED: "diseased",
  FEEBLEMINDED: "feebleminded",
  LIMP: "limp",
  LOST_ALL: "lost all",
  LOST_ARM: function() {return this.LOST + " " + this.ARM;},
  LOST_EYE: function() {return this.LOST + " " + this.EYE;},
  LOST_HEAD: function() {return this.LOST + " " + this.HEAD;},
  LOST_WING: function() {return this.LOST + " " + this.WING;},
  LOST_ALL_ARMS: function() {return this.LOST_ALL + " " + this.ARM + "s";},
  LOST_ALL_EYES: function() {return this.LOST_ALL + " " + this.EYE + "s";},
  LOST_ALL_HEADS: function() {return this.LOST_ALL + " " + this.HEAD + "s";},
  LOST_ALL_WINGS: function() {return this.LOST_ALL + " " + this.WING + "s";},
  MUTE: "mute",
  NEVER_HEAL_WOUND: "never healing wound",
  WEAKENED: "weakened",
  TORN_WING: function() {return "torn " + this.WING;},

  //special slots
  USED: "used",
  LOST: "lost",
  EMPTY: "empty",

  //currency
  GOLD: "gold",
  START_GOLD: "starting gold",
  GEMS: "gems",
  AIR_G: "diamonds",
  "diamonds_1": "diamond",
  ASTRAL_G: "pearls",
  "pearls_1": "pearl",
  BLOOD_G: "bloodstones",
  "bloodstones_1": "bloodstone",
  DEATH_G: "onyxes",
  "onyxes_1": "onyx",
  EARTH_G: "topazes",
  "topazes_1": "topaz",
  FIRE_G: "rubies",
  "rubies_1": "ruby",
  HOLY_G: "piety",
  NATURE_G: "emeralds",
  "emeralds_1": "emerald",
  WATER_G: "sapphires",
  "sapphires_1": "sapphire",


  //paths
  AIR: "air",
  ASTRAL: "astral",
  BLOOD: "blood",
  DEATH: "death",
  EARTH: "earth",
  FIRE: "fire",
  HOLY: "holy",
  NATURE: "nature",
  WATER: "water",
  
  //Scales
  HEATSCALE: "heat scale",
  ORDERSCALE: "order scale",
  PRODSCALE: "production scale",
  GROWTHSCALE: "growth scale",
  LUCKSCALE: "fortune scale",
  MAGICSCALE: "magic scale",
  LIGHTSCALE: "light scale",
  DOMSCALE: "dominion scale",

  //tasks

  REST: "rest",
  EARN: "earn",
  SEARCH: "search",
  TRAIN: "train",
  RESEARCH: "research",

  //Form tags
  AMPH: "amphibian",
  ANIMAL: "animal",
  COLD_BLOOD: "cold-blooded",
  DEMON: "demon",
  INANIMATE: "inanimate",
  MAGIC_BEING: "magic being",
  TAGLESS: "tagless",
  UNDEAD: "undead",

  "task timestamp": true,
  "cost": true
}
