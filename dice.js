
module.exports =
{
  roll: function(diceNum, max, explosive = false, giveAvg = true)
  {
  	var str = "";
  	var total = 0;

  	for (var i = 0; i < diceNum; i++)
  	{
  		var result = Math.floor((Math.random() * max) + 1);

  		if (explosive == true && result == max)
      {
        result += explodeDie(max);
      }

  		total += result;

  		if (diceNum == 1)
      {
        str += result;
      }

  		else if (i == diceNum - 1)
      {
        str += result + " = " + total;
      }

  		else str += result + " + ";
  	}

    if (giveAvg)
    {
      var avg = ((max + 1) * 0.5) * diceNum;
      str += " (Avg: " + avg.toFixed(0) + ")";
    }

  	return str + ".";
  },

  //The Dom4 DRN is a 2d6 roll in which a result of 6 is exploded, but substracting 1 from it.
  DRN: function()
  {
  	var die1 = Math.floor((Math.random() * 6) + 1);
  	var die2 = Math.floor((Math.random() * 6) + 1);

  	if (die1 == 6)
  	{
  		die1 += -1 + explodeDRN();
  	}

  	if (die2 == 6)
  	{
  		die2 += -1 + explodeDRN();
  	}

  	return die1 + die2;
  },

  //The Dom4 drn works the same as the DRN, but is only 1d6. Used for dispells, for example.
  drn: function()
  {
  	var die = Math.floor((Math.random() * 6) + 1);

  	if (die1 == 6)
  	{
  		die1 += -1 + explodeDRN();
  	}

  	return die1;
  }
}

function explodeDie(max)
{
	var rndm = Math.floor((Math.random() * max) + 1);

	if (rndm == max)
	{
		rndm += explodeDie(max);
	}

	return rndm;
}

function explodeDRN()
{
  var rndm = Math.floor((Math.random() * 6) + 1);

  if (rndm == 6)
  {
    rndm += -1 + explodeDRN();
  }

  return rndm;
}
