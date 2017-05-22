
const ids = require("../../MrHound/Current/ids.js");
const rw = require("../../MrHound/Current/reader_writer.js");

module.exports =
{
  gems: [ids.AIR_G, ids.ASTRAL_G, ids.BLOOD_G, ids.DEATH_G, ids.EARTH_G, ids.FIRE_G, ids.HOLY_G, ids.NATURE_G, ids.WATER_G],

  objTruncate: function(obj, key, places = 5)
  {
    if (isNaN(obj[key]))
    {
      return;
    }

    if (Math.floor(obj[key]) == obj[key])
  	{
  		return;
  	}

  	else if (obj[key].toString().split(".")[1].length > places)
  	{
  		obj[key] = +obj[key].toString().slice(0, obj[key].toString().indexOf(".") + (places + 1));
  	}
  },

  add: function(currObj1, currObj2)
  {
    var obj = Object.assign({}, currObj1);

    if (currObj1 == null)
    {
      return currObj2;
    }

    if (currObj2 == null)
    {
      return currObj1;
    }

    for (var type in currObj2)
  	{
      if (isNaN(currObj2[type]))
      {
        continue;
      }

      if (obj[type] == null)
      {
        obj[type] = currObj2[type];
      }

      else if (isNaN(obj[type]) == false)
      {
        obj[type] += currObj2[type];
      }
  	}

    return obj;
  },

  subtract: function(currObj1, currObj2)
  {
    var obj = Object.assign({}, currObj1);

    for (var type in currObj2)
  	{
      if (isNaN(currObj2[type]))
      {
        continue;
      }

      if (isNaN(currObj1[type]) == false)
      {
        if (currObj1[type] > currObj2[type])
        {
          obj[type] = currObj1[type] - currObj2[type];
          this.objTruncate(obj, type, 5);
        }

        else
        {
          delete obj[type];
        }
      }
  	}

    return obj;
  },

  multiply: function(currObj, multiplier, places = 5)
  {
    var obj = {};

    for (var type in currObj)
    {
      if (isNaN(currObj[type]))
      {
        continue;
      }

      obj[type] = (currObj[type] * multiplier).truncate(places);
    }

    return obj;
  },

  chooseHigher: function(currObj1, currObj2)
  {
    var obj = Object.assign({}, currObj1);

    for (var type in currObj2)
  	{
      if (isNaN(currObj2[type]))
      {
        continue;
      }

      if (isNaN(currObj1[type]) == false && currObj2[type] > currObj1[type])
      {
        obj[type] = currObj2[type];
        this.objTruncate(obj, type, 5);
      }
  	}

    return obj;
  }
}
