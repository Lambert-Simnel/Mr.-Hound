const ids = require("../../MrHound/Current/ids.js");
const dice = require("../../MrHound/Current/dice.js");
const event = require("../../MrHound/Current/emitter.js");
const rw = require("../../MrHound/Current/reader_writer.js");

var battleExpireTime = 1190000;	//after this amount of time a challenge will expire.
var challengeExpireTime = 59000;	//after this amount of time a challenge will expire.

var limbDmgCap = 0.5;

var challengerDefXP = 50;
var offenderDefXP = 50;
var dmgXPRate = 80;
var lifeXPRate = 65;
var dmgXPCap = 1;
var xpAdjCons = 10;
var xpAdjMult = 0.5;
var xpAdjHighCap = 2.5;
var xpAdjLowCap = 0.25;
var xpAdjLvlMult = 1.05;

var postRoundLimit = 20;
var etherealChance = 75;

//The area determines how big a chance it adds to it being hit,
//and the height is subtracted from the character's size to see
//if it's reachable by an attacker
var partSizes = {	[ids.HEAD]: {area: 4, height: 0},
									[ids.EYE]: {area: 1, height: 0},
									[ids.BODY]: {area: 10, height: -1},
									[ids.ARM]: {area: 4, height: -2},
									[ids.LEG]: {area: 4, height: -6},
									[ids.WING]: {area: 3, height: 0}	};

module.exports =
{
	battles: {},
	challenges: {},

	combatTest: function(challenger, offender, times = 1, returnStr = false)
	{
		var result = "";
		var wins = {challenger: 0, offender: 0, draw: 0};
		var challengerXP = 0;
		var offenderXP = 0;

		for (var i = 0; i < times; i++)
		{
			this.battles[challenger.id] = this.createBattle("spar", challenger, offender);
			this.battles[offender.id] = this.battles[challenger.id];
			var battle = this.battles[challenger.id];

			while (battle.status != "ended")
			{
				if (battle.turnID == battle.challenger.id)
				{
					var res = resolveRound(battle.challenger, battle.offender, "attack", battle);
					result += (returnStr) ? res : "";
					battle.turnID = battle.offender.id;
				}

				else
				{
					var res = resolveRound(battle.offender, battle.challenger, "attack", battle);
					result += (returnStr) ? res : "";
					battle.turnID = battle.challenger.id;
				}
			}

			if (battle.winner == challenger.id)
			{
				wins.challenger++;
			}

			else if (battle.winner == offender.id)
			{
				wins.offender++;
			}

			else wins.draw++;

			challengerXP += battle.challengerXP;
			offenderXP += battle.offenderXP;
			delete battle.challenger;
			delete battle.offender;
			delete this.battles[challenger.id];
			delete this.battles[offender.id];
		}

		rw.log("\nChallenger wins: " + wins.challenger + "\nOffender wins: " + wins.offender + "\nDraws: " + wins.draw);
		rw.log("\nAverage Challenger XP: " + (challengerXP / times) + "\nAverage Offender XP: " + (offenderXP / times));
		return result.replace(/\`\`\`\`\`\`/g, "\n");
	},

	//Takes a GuildMember object
	giftsFromHeaven: function(message, victim)
	{
		if (victim.roles.has(ids.BOT_ID))
		{
			message.reply ("How DARE you try to make me hurt myself?! You shall suffer the consequences, fool!");
			message.channel.send("?GiftsFromHeaven " + message.author);
			return;
		}

		//The TextChannel class has the members property, which specifically contains the members that can SEE the channel.
		//We also filter it by the CheckOnline function which returns only those elements whose .presence property does NOT show offline
		var channelUsers = message.channel.members.array();

		//Find the position within the array of members online
		var victimPos = channelUsers.indexOf(victim);

		//The array that will contain all of the hit members
		var hit = [];

		if (channelUsers.length < 2)
		{
			hit = [victim.user.username];
		}

		else if (victimPos == 0)
		{
			hit = [victim.user.username, channelUsers[victimPos + 1].user.username];
		}

		//Last element of the array
		else if (victimPos == channelUsers.length - 1)
		{
			hit = [victim.user.username, channelUsers[victimPos - 1].user.username];
		}

		else
		{
			hit = [victim.user.username, channelUsers[victimPos - 1].user.username, channelUsers[victimPos + 1].user.username];
		}

		var msg = "A strange whizzing sound emanates from the heavens... The land is crushed under a meteor glowing with astral fire!\n";

		for (var i = 0; i < hit.length; i++)
		{
			var damage = 150 + dice.DRN();

			msg += "\n" + hit[i] + " suffers " + damage + " blunt damage!";
		}

		message.channel.sendCode(null, msg);
	},

	//Takes a GuildMember object
	smite: function(message, victim)
	{
		if (victim.roles.has(ids.BOT_ID))
		{
			message.reply ("How DARE you try to make me hurt myself?! You shall suffer the consequences, fool!");
			message.channel.send("?Smite " + message.author);
			return;
		}

		var dmg = 20 + dice.DRN();
		var msg = victim.user.username + " is smitten by holy fire! " + dmg + " damage!";

		message.channel.sendCode(null, msg);
	},

	createBattle: function(type, chllngr, offndr, stamp = Date.now())
	{
		var absChallenger = chllngr.abstract();
		var absOffender = offndr.abstract();
		var healed = (type == "duel") ? false : true;
		absChallenger.battleReady(healed);
		absOffender.battleReady(healed);

		return obj =
		{
			mode: type, challenger: absChallenger, offender: absOffender,
			challengerXP: challengerDefXP, offenderXP: offenderDefXP,
			challengerHP: absChallenger[ids.CURR_HP], offenderHP: absOffender[ids.CURR_HP],
			turnID: offndr.id, turnNbr: 1, timestamp: stamp
		};
	},

	challenge: function (type, author, receiver)
	{
		//This is the target of the challenge responding!!
		if (this.challenges[receiver.id] && this.challenges[receiver.id][author.id])
		{
			this.battles[receiver.id] = this.createBattle(this.challenges[receiver.id][author.id].mode, receiver, author, this.challenges[receiver.id][author.id].timestamp);
			this.battles[author.id] = this.battles[receiver.id];

			var acceptStr = author.name + " (" + author[ids.FORM].findForm().name.capitalize() + ", level " + author[ids.LVL] + ") " +
											"accepted " + receiver.name + "'s (" + receiver[ids.FORM].findForm().name.capitalize() + ", level " + receiver[ids.LVL] + ") " +
											this.battles[author.id].mode + " offer! The receiver of the challenge gets the first action.";

			delete this.challenges[receiver.id][author.id];
			if (!Object.keys(this.challenges[receiver.id]).length)
			{
				delete this.challenges[receiver.id];
			}

			this.updateExposure(this.battles[receiver.id]);

			if (this.battles[receiver.id].exposure == "private")
			{
				acceptStr += " Since other battles are already ongoing, I will be sending the command results to both of you in private (but keep typing the commands in this channel).";
			}

			return acceptStr;
		}

		else
		{
			this.challenges[author.id] = {[receiver.id]: {mode: type, timestamp: Date.now()}};

			return author.name + " (" + author[ids.FORM].findForm().name.capitalize() + ", level " + author[ids.LVL] + ") " +
						" challenged " + receiver.name + "'s (" + receiver[ids.FORM].findForm().name.capitalize() + ", level " + receiver[ids.LVL] + ") " +
						" to a " + type + ". Type `?" + type + "` and a mention to the challenger to accept the offer.";
		}
	},

	updateExposure: function (battle)
	{
		var battlesArr = Object.keys(this.battles);
		if (battle.exposure == null && battlesArr.length > 2)
		{
			battle.exposure = "private";
		}

		else if (battlesArr.length && battlesArr.length <= 2)
		{
			battle.exposure = "public";
		}
	},

	combat: function(action, actor, target)
	{
		var result = "";
		var battle = this.battles[actor.id];

		if (battle == null)
		{
			battle = this.createBattle("simulation", actor, target);
		}

		if ((actor.id !== battle.challenger.id && actor.id !== battle.offender.id) ||
				(target.id !== battle.challenger.id && target.id !== battle.offender.id))
		{
			delete this.battles[actor.id]; delete this.battles[target.id];
			return "Something is wrong. At least one of the contenders in this battle is not the correct character. I am cancelling it.";
		}

		result += battle.mode.capitalize() + " (" + battle.challenger.name + " vs. " + battle.offender.name + ")\n";

		if (actor.id == battle.challenger.id)
		{
			result += resolveRound(battle.challenger, battle.offender, action, battle);
		}

		else result += resolveRound(battle.offender, battle.challenger, action, battle);

		if (battle.status == "ended" && battle.mode != "simulation")
		{
			delete battle.challenger;
			delete battle.offender;
			delete this.battles[actor.id];
			delete this.battles[target.id];
			event.e.emit("save", [actor.id, target.id]);
			return result;
		}

		else if (battle.mode == "simulation")
		{
			delete battle.challenger;
			delete battle.offender;
			delete battle;
			return result;
		}

		else
		{
			result += updateTurn(battle);

			/*if (battle.auto[battle.turnID])
			{
				setTimeout(fuction(){})
			}*/

			return result;
		}
	},

	cleanChallenges: function()
	{
		for (user in this.challenges)
		{
			for (var offer in this.challenges[user])
			{
				if (Date.now() >= this.challenges[user][offer].timestamp + challengeExpireTime)
				{
					delete this.challenges[user][offer];
				}
			}

			if (!Object.keys(this.challenges[user]).length)
			{
				delete this.challenges[user];
			}
		}
	},

	cleanBattles: function(channel)
	{
		for (match in this.battles)
		{
			if (Date.now() >= this.battles[match].timestamp + battleExpireTime)
			{
				channel.send(endBattle(this.battles[match]));
				delete this.battles[match];
			}
		}
	}
}

/**********************************************************************************************************************
**********************************************END OF EXPOSURE**********************************************************
***********************************************************************************************************************/

//Update turn happens AFTER a round has finished
function updateTurn(battle)
{
	if (battle == null)
	{
		return;
	}

	if (battle.offender.id == battle.turnID)
	{
		battle.turnID = battle.challenger.id;
		return battle.challenger.name + "'s turn.";
	}

	else
	{
		battle.turnNbr++;
		battle.turnID = battle.offender.id;
		return ("Turn " + battle.turnNbr + " starts!").toBox() + battle.offender.name + "'s turn.";
	}
}

function resolveRound(actor, target, action, battle)
{
	var result = "";

	if (actor[ids.PROPS][ids.REGEN])
	{
		result += ("Regeneration. " + actor.heal(actor[ids.PROPS][ids.REGEN])).toBox();
	}

	if (target[ids.PROPS][ids.HEAT_AURA])
	{
		var heatWpn = {[ids.DMG]: 3, [ids.PROPS]: {[ids.STUN]: true}};
		result += ("Heat stroke. " + actor.applyDmg(applyResistances(heatWpn, ids.FIRE, actor), ids.FIRE, ids.BODY, true)).toBox();
	}

	if (target[ids.PROPS][ids.COLD_AURA])
	{
		var coldWpn = {[ids.DMG]: 3, [ids.PROPS]: {[ids.STUN]: true}};
		result += ("Extreme cold. " + actor.applyDmg(applyResistances(coldWpn, ids.COLD, actor), ids.COLD, ids.BODY, true)).toBox();
	}

	if (actor[ids.STATUS][ids.UNCONSCIOUS])
	{
		return (actor.name + " is still unconscious.").toBox() + actor.reinvigorate().toBox() + endRound(actor) + checkIfDead(actor, target, battle);
	}

	if (actor[ids.STATUS][ids.PARALYZED])
	{
		return actor.tickParalysis().toBox() + actor.reinvigorate().toBox() + endRound(actor) + checkIfDead(actor, target, battle);
	}

	if (actor[ids.STATUS][ids.WEBBED])
	{
		return actor.escapeWeb().toBox() + actor.reinvigorate().toBox() + actor.addFatigue(actor.getTtlEnc()).toBox() + endRound(actor) + checkIfDead(actor, target, battle);
	}

	if (action == "attack")
	{
		if (target[ids.PROPS][ids.AWE])
		{
			var moraleRoll = dice.DRN() + actor.getTtlMor(true);
			var difficulty = 10 + target[ids.PROPS][ids.AWE];

			if (moraleRoll <= difficulty)
			{
				return actor.name + " is awe-struck (MRL Roll " + moraleRoll + " vs " + difficulty + ")." + actor.reinvigorate().toBox() + endRound(actor) + checkIfDead(actor, target, battle);
			}
		}

		result += actor.reinvigorate().toBox() + attacks(getAttacks(actor.getWeapons()), actor, target, battle) + actor.addFatigue(actor.getTtlEnc()).toBox();
	}

	var endRoundRes = endRound(actor);

	if (endRoundRes.length)
	{
		result += endRoundRes;
	}

	var deadCheckRes = checkIfDead(actor, target, battle);

	if (deadCheckRes.length)
	{
		result += deadCheckRes;
	}

	return result;
}

function endRound(actor)
{
	var result = "";

	if (actor[ids.STATUS][ids.POISONED])
	{
		result += actor.tickPoison().toBox();
	}

	if (actor[ids.STATUS][ids.ON_FIRE])
	{
		result += actor.tickFire().toBox();
	}

	if (actor[ids.STATUS][ids.FREEZING])
	{
		result += actor.tickCold().toBox();
	}

	return result;
}

function checkIfDead(actor, target, battle)
{
	var result = "";
	var isFinished = false;

	if (actor[ids.CURR_HP] <= 0)
	{
		if (actor[ids.PROPS][ids.SECONDSHAPE])
		{
			result += actor.changeShape(actor[ids.PROPS][ids.SECONDSHAPE], Math.abs(actor[ids.CURR_HP])).toBox();
		}

		else isFinished = true;
	}

	if (target[ids.CURR_HP] <= 0)
	{
		if (target[ids.PROPS][ids.SECONDSHAPE])
		{
			result += target.changeShape(target[ids.PROPS][ids.SECONDSHAPE], Math.abs(target[ids.CURR_HP])).toBox();
		}

		else isFinished = true;
	}

	if (isFinished)
	{
		return result += endBattle(battle);
	}

	else
	{
		return result;
	}
}

function endBattle(battle)
{
	var result = ("The battle is stopped on turn " + battle.turnNbr + "!").toBox() +
								battle.challenger.endEffects(postRoundLimit).toBox() +
								battle.offender.endEffects(postRoundLimit).toBox();

	if (battle.mode == "simulation")
	{
		battle.status = "ended";
		return "";
	}

	result += checkWinner(battle).toBox();
	battle.challengerXP = adjustXP(battle.challengerXP, battle.challenger, battle.challengerHP, battle.offender[ids.LVL]);
	battle.offenderXP = adjustXP(battle.offenderXP, battle.offender, battle.offenderHP, battle.challenger[ids.LVL]);
	result += (battle.challenger.raiseXP(battle.challengerXP) + " " + battle.offender.raiseXP(battle.offenderXP)).toBox();

	if (battle.mode == "duel")
	{
		delete battle.challenger[ids.STATUS];
		delete battle.offender[ids.STATUS];
		battle.challenger.mergeAbstract();
		battle.offender.mergeAbstract();
	}

	battle.status = "ended";
	return result;
}

function checkWinner(battle)
{
	if (battle.challenger[ids.CURR_HP] <= 0 && battle.offender[ids.CURR_HP] <= 0)
	{
		battle.winner = 0;
		return "#####IT'S A DRAW!#####";
	}

	else if (battle.challenger[ids.CURR_HP] <= 0)
	{
		battle.winner = battle.offender.id;
		return "#####" + battle.offender.name + " IS VICTORIOUS!#####";
	}

	else if (battle.offender[ids.CURR_HP] <= 0)
	{
		battle.winner = battle.challenger.id;
		return "#####" + battle.challenger.name + " IS VICTORIOUS!#####";
	}

	else if (battle.turnID == battle.challenger.id)
	{
		battle.winner = battle.offender.id;
		return "#####" + battle.offender.name + " IS VICTORIOUS!#####";
	}

	else if (battle.turnID == battle.offender.id)
	{
		battle.winner = battle.challenger.id;
		return "#####" + battle.challenger.name + " IS VICTORIOUS!#####";
	}

	else
	{
		return "#####NO WINNER COULD BE DECIDED! IT'S A DRAW!#####";
	}
}

function attacks(attempts, atckr, dfndr, battle)
{
	var result = "";
	var attackCount = {nbr: 0};
	var repelCount = {nbr: 0};
	var atckrXP = 0;
	var dfndrXP = 0;

	for (var i = 0; i < attempts.length; i++)
	{
		var atkStr = "";
		var weapon = attempts[i];

		if ((weapon[ids.PROPS][ids.REQ_LIFE] && dfndr[ids.PROPS][ids.LIFELESS]) ||
				(weapon[ids.PROPS][ids.REQ_MIND] && dfndr[ids.PROPS][ids.MINDLESS]))
		{
			result += (weapon.name + " failed.").toBox();
			continue;
		}

		//If the next attempt is an effect and not a weapon, it won't need to do any hit rolls, nor will be repelled
		if (weapon.isNotEffect())
		{
			attackCount.nbr++;

			if (dfndr[ids.STATUS][ids.UNCONSCIOUS] == null && dfndr[ids.STATUS][ids.PARALYZED] == null && dfndr[ids.STATUS][ids.WEBBED] == null)
			{
				var repelResults = repels(dfndr.getRepelWeapons(weapon), dfndr, atckr, repelCount);
				atkStr += repelResults.descr;

				if (repelResults.wasRepelled == true)
				{
					result += atkStr.toBox();
					continue;
				}

				else if (atckr[ids.CURR_HP] <= 0 && battle.mode != "simulation")
				{
					result += atkStr.toBox();
					break;
				}
			}

			if (weapon[ids.PROPS][ids.ONCE])
			{
				if (battle.mode == "duel")
				{
					atckr.unequipItem(weapon.id);
				}

				else atckr.dropItem(weapon.id);
			}

			var attackResult = attack(weapon, atckr, dfndr, attackCount.nbr);
			atkStr += attackResult.descr;

			//Miss
			if (attackResult.diff <= 0)
			{
				result += atkStr.toBox();
				continue;
			}

			if (dfndr[ids.PROPS][ids.FIRE_SHLD])
			{

			}

			if (dfndr[ids.PROPS][ids.ETHEREAL] && weapon[ids.PROPS][ids.MAGIC] == null)
			{
				if (Math.floor((Math.random() * 100)) + 1 <= etherealChance)
				{
					result += (atkStr + "Ethereal negated the attack. ").toBox();
					continue;
				}
			}

			if (weapon[ids.ON_HIT] && weapon[ids.ON_HIT] !== "none")
			{
				//Add to the attack attempts array the on_hit effect of this weapon in the following index
				attempts.splice(i + 1, 0, weapon.getOnHitEffect());
			}
		}

		if (weapon[ids.PROPS][ids.MRN])
		{
			var MRresult = checkMR(weapon, dfndr);
			atkStr += MRresult.descr;

			if (MRresult.diff <= 0)
			{
				result += atkStr.toBox();
				continue;
			}
		}

		var isShieldHit = (attackResult) ? attackResult.isShieldHit : false;
		var damageCalc = calcDmg(weapon, atckr, dfndr, isShieldHit);
		var isStun = (weapon[ids.PROPS][ids.STUN]) ? true : false;

		//Add a separation line after the damage roll to display the end results below
		if (damageCalc.descr !== "")
		{
			atkStr += damageCalc.descr + "\n" + "".width(80, false, "—") + "\n";
		}

		if (damageCalc.amnt > 0)
		{
			if (dfndr[ids.STATUS][ids.TWIST_FATE])
			{
				delete dfndr[ids.STATUS][ids.TWIST_FATE];
				result += (atkStr + "Twist Fate negated the damage. ").toBox();
				continue;
			}

			if (weapon[ids.DMG_TYPE][ids.STUN] == null && weapon[ids.DMG_TYPE][ids.WEB] == null && weapon[ids.PROPS][ids.STUN] == null)
			{
				var xpCap = (dfndr[ids.MAX_HP] * dmgXPCap) - (dfndr[ids.MAX_HP] - dfndr[ids.CURR_HP]);
				atckrXP += (damageCalc.amnt.cap(xpCap) / dfndr.getTtlHP()) * dmgXPRate;
				dfndrXP += (damageCalc.amnt.cap(xpCap) / dfndr.getTtlHP()) * lifeXPRate;
			}

			if (weapon[ids.ON_DMG] && weapon[ids.ON_DMG] !== "none")
			{
				//Add to the attack attempts array the on_dmg effect of this weapon in the following index
				attempts.splice(i + 1, 0, weapon.getOnDmgEffect());
			}

			atkStr += dfndr.applyDmg(damageCalc.amnt, damageCalc.type, damageCalc.hitLoc, isStun);

			if (damageCalc.type.includes("drain"))
			{
				atkStr += atckr.drain(damageCalc.amnt, damageCalc.type);
			}
		}

		if (dfndr[ids.CURR_HP] <= 0)
		{
			result += atkStr.toBox();
			break;
		}

		if (atckr[ids.STATUS] && atckr[ids.STATUS][ids.FAT] >= 100)
		{
			result += atkStr.toBox();
			break;
		}

		result += atkStr.toBox();
	}

	assignRoundXP(dfndr, dfndrXP, battle);
	assignRoundXP(atckr, atckrXP, battle);
	return result;
}

function repels(attempts, rpler, atckr, count)
{
	var result = {descr: "", wasRepelled: false};

	for (var i = 0; i < attempts.length; i++)
	{
		count.nbr++;
		var weapon = attempts[i];
		var attackResult = attack(weapon, rpler, atckr, count.nbr, true);
		result.descr += attackResult.descr;

		if (attackResult.diff <= 0)
		{
			continue;
		}

		if (atckr[ids.PROPS][ids.ETHEREAL] && weapon[ids.PROPS][ids.MAGIC] == null)
		{
			if (Math.floor((Math.random() * 100)) + 1 <= etherealChance)
			{
				result.descr += "Ethereal negates. ";
				continue;
			}
		}

		repelResult = repel(rpler, atckr, attackResult.diff);
		result.descr += repelResult.descr;

		//Attack aborted
		if (repelResult.diff <= 0)
		{
			result.wasRepelled = true;
			break;
		}

		var damageCalc = calcDmg(weapon, rpler, atckr, attackResult.isShieldHit, true);
		result.descr += damageCalc.descr + atckr.reduceHP(damageCalc.amnt, damageCalc.type, damageCalc.hitLoc);
	}

	return result;
}

function attack(weapon, atckr, dfndr, attackNbr, isRepel = false)
{
	var parry = dfndr.getTtlParry();
	var dualPen = (weapon[ids.PROPS][ids.BONUS] == null) ? atckr.getDualPen() : 0;
	var multiplePen = (attackNbr - 1) * 2;
	var attackRoll = (isRepel) ? atckr.getTtlAtt(weapon) - dualPen - multiplePen + dice.DRN() : atckr.getTtlAtt(weapon) - dualPen + dice.DRN();
	var defenceRoll = (isRepel) ? dfndr.getTtlDef() + dice.DRN() : dfndr.getTtlDef() - multiplePen + dice.DRN();

	var actionType = (isRepel) ? "RPL" : "ATK"
	var description = rollDescr("\n" + actionType + " (w. " + weapon.name.capitalize() + ") ", attackRoll, defenceRoll + " (" + (defenceRoll + parry) + ")", " DEF");
	var result = {descr: description, diff: attackRoll - defenceRoll, isShieldHit: false};

	if (dualPen != 0)
	{
		result.descr += (isRepel) ? "-" + dualPen + " RPL multi-wielding. " : "-" + dualPen + " ATK multi-wielding. ";
	}

	if (multiplePen != 0)
	{
		result.descr += (isRepel) ? "-" + multiplePen + " RPL. " : "-" + multiplePen + " DEF. ";
	}

	if (result.diff - parry > 0)
	{
		result.descr += "Hit. ";
	}

	else if (parry > 0 && weapon[ids.PROPS][ids.FLAIL] && (result.diff + 2) - parry > 0)
	{
		result.diff += 2;
		result.descr += "Hit. (+2 vs shields) ";
	}

	else if (result.diff > 0)
	{
		result.isShieldHit = true;
		result.descr += "Shield hit. ";
	}

	else
	{
		result.descr += "Miss. ";
	}

	return result;
}

function repel(rpler, atckr, hitDiff)
{
	var moraleRoll = atckr.getTtlMor() + dice.DRN() + (atckr[ids.SIZE] - rpler[ids.SIZE]);
	var threatRoll = Math.floor(10 + hitDiff / 2) + dice.DRN();

	var description = rollDescr("\nMRL (" + atckr.name + ") ", moraleRoll, threatRoll, " THRT");
	var result = {diff: moraleRoll - threatRoll, descr: description};

	result.descr += (result.diff > 0) ? "ATK continues. " : "ATK stopped. ";

	return result;
}

function checkMR(weapon, dfndr)
{
	var description = "";
	var pen = dice.DRN() + 10;
	var mr = dice.DRN() + dfndr.getTtlMR();
	var difference = pen - mr;
	description += rollDescr("\nPEN (w. " + weapon.name + ") ", pen, mr, " MR");

	if (difference > 0)
	{
		description += "Effect goes through. ";
	}

	else description += "Negated. ";
	return {descr: description, diff: difference};
}

function calcDmg (weapon, atckr, dfndr, isShieldHit, isRepel = false)
{
	var hitLocation = getHitLocation(weapon.length, atckr[ids.SIZE], dfndr);
	var dmgType = pickDmgType(weapon[ids.DMG_TYPE]);
	var dmgScore = getDmgScore(weapon, dmgType, isShieldHit, atckr, dfndr);
	var dmgRoll = (dmgType != ids.POISON) ? dice.DRN() + dmgScore : dmgScore;

	var protRoll = (dfndr[ids.STATUS][ids.FAT] >= 50) ? dice.DRN() - 1 : dice.DRN();
	var protectionCalc = calcProt(protRoll, weapon, dfndr, hitLocation, dmgType);

	var diff = dmgRoll - protectionCalc.amnt;
	var result = {amnt: diff, type: dmgType, hitLoc: hitLocation, descr: ""};
	var description = rollDescr("\nDMG (w. " + weapon.name.capitalize() + ") ", dmgRoll, protectionCalc.amnt, " PRT");

	if (dmgType == "web")
	{
		result.amnt = atckr[ids.SIZE];
		return result;
	}

	if (dmgScore <= 0)
	{
		result.amnt = 0;
		return result;
	}

	if (isRepel && diff > 0)
	{
		result.amnt = 1;
		return result;
	}

	if (weapon[ids.PROPS][ids.CAPPED] && diff > 0)
	{
		result.amnt = 1;
		result.descr += description + result.amnt + " " + dmgType + " DMG (" + hitLocation + "). ";
		return result;
	}

	if (diff > 0)
	{
		var isStun = (weapon[ids.PROPS][ids.STUN]) ? true : false;
		modifiedDmg = modDmg(dfndr, diff, dmgType, hitLocation, isStun);
		result.amnt = modifiedDmg.amnt;
		result.descr += description + protectionCalc.descr + modifiedDmg.descr + result.amnt + " " + dmgType + " DMG (" + hitLocation + "). ";
		return result;
	}

	else
	{
		result.descr += description + protectionCalc.descr + "No DMG.";
		return result
	}
}

function pickDmgType(dmgTypes)
{
	var arr = Object.keys(dmgTypes);
	return arr[Math.floor((Math.random() * arr.length))];
}

function getDmgScore(weapon, dmgTypeApplied, isShieldHit, atckr, dfndr)
{
	var total = applyResistances(weapon, dmgTypeApplied, dfndr);

	if (isShieldHit && weapon[ids.PROPS][ids.AN] == null && weapon[ids.PROPS][ids.NO_SHIELDS] == null)
	{
		var shieldProt = dfndr.getTtlShieldProt();
		total -= (weapon[ids.PROPS][ids.AP] == null) ? shieldProt : Math.floor(shieldProt * 0.5);
	}

	if (weapon[ids.PROPS][ids.NO_STR] == null)
	{
		total += atckr.getTtlStr();
	}

	return total.lowerCap(0);
}

function applyResistances(weapon, dmgType, victim)
{
	var res = victim.getTtlRes(dmgType);

	if (res != null && isNaN(res) == false && res > 0)
	{
		var finalRes = (weapon[ids.PROPS][ids.STUN]) ? res * 2 : res;
		return weapon[ids.DMG] - finalRes;
	}

	else return weapon[ids.DMG];
}

function calcProt (roll, weapon, dfndr, hitLoc, dmgType)
{
	var result = {amnt: 0, descr: ""};
	result.amnt += dfndr.getTtlProt(hitLoc);

	if (weapon[ids.PROPS][ids.AN])
	{
		result.amnt = 0;
		return result;
	}

	if (dmgType == ids.PIERCE)
	{
		result.amnt = Math.floor(result.amnt * 0.8);
		result.descr += "-20% PRT. ";
	}

	if (weapon[ids.PROPS][ids.AP])
	{
		result.amnt = Math.floor(result.amnt * 0.5);
		result.descr += "AP -50% PRT. ";
	}

	if (isCritical(dfndr, roll))	//A critical reduces protection by half after the rest of the calculations on it are done
	{
		result.amnt = Math.floor(result.amnt/2);
		result.descr += "CRIT, -50% final PRT. ";
	}

	result.amnt += roll;
	return result;
}

function modDmg(victim, damage, dmgType, hitLoc, isStun = false)
{
	var result = {amnt: damage, descr: ""};
	var maxLimbDmg = Math.floor(victim[ids.MAX_HP] * limbDmgCap).lowerCap(1);

	if (dmgType == ids.BLUNT && (hitLoc.includes(ids.HEAD) || hitLoc.includes(ids.EYE)))
	{
		result.amnt = Math.floor(damage * 1.5);
		result.descr += "+50% DMG. ";
	}

	else if (dmgType == ids.SLASH)
	{
		result.amnt = Math.floor(damage * 1.25);
		result.descr += "+25% DMG. ";
	}

	if ((dmgType == ids.BLUNT || dmgType == ids.PIERCE || dmgType == ids.SLASH) && victim[ids.PROPS]["RES_" + dmgType.toUpperCase()])
	{
		result.amnt = Math.floor(result.amnt * 0.5).lowerCap(1);
		result.descr += "-50% DMG. ";
	}

	if ((hitLoc.includes(ids.ARM) || hitLoc.includes(ids.LEG) || hitLoc.includes(ids.WING)) && damage > maxLimbDmg && isStun == false && dmgType != ids.STUN && dmgType != ids.POISON)
	{
		result.amnt = maxLimbDmg;
		result.descr += "Limb caps DMG. ";
	}

	return result;
}

//Calculates the hit location and returns the string of the part name
function getHitLocation(wpnLength, atckrSize, victim)
{
	var form = victim.getForm();
	var arr = [];
	var maxHeight = wpnLength + atckrSize;

  for (var part in form[ids.PARTS])
  {
    var weight = 0;

		if (victim[ids.AFFL]["lost " + part])
		{
			weight = partSizes[part].area * (form[ids.PARTS][part] - victim[ids.AFFL]["lost " + part]);
		}

		else if (victim[ids.AFFL]["lost all " + part + "s"] || maxHeight < victim[ids.SIZE] + partSizes[part].height)
		{
			weight = 0;
		}

		else
		{
			weight = partSizes[part].area * form[ids.PARTS][part];
		}

    for (var i = 0; i < weight; i++)
    {
      arr.push(part);
    }
  }

  return arr[Math.floor((Math.random() * arr.length))];
}

//Checks whether an attack is critical or not based on the victim's fatigue
//prot roll and other conditions that might immobilize him
//returns a bool
function isCritical(dfndr, protDRN)
{
	//Immobilized, will later check for other effects
	if (dfndr[ids.STATUS][ids.UNCONSCIOUS] || dfndr[ids.STATUS][ids.PARALYZED] || dfndr[ids.STATUS][ids.WEBBED])
	{
		if (protDRN <= 4)
		{
			return true;
		}

		else return false;
	}

	else
	{
		if (protDRN <= 2)
		{
			return true;
		}

		else return false;
	}
}

function assignRoundXP(character, xp, battle)
{
	if (battle == null)
	{
		return;
	}

	if (character.id == battle.challenger.id)
	{
		battle.challengerXP += xp;
	}

	else if (character.id == battle.offender.id)
	{
		battle.offenderXP += xp;
	}

	else
	{
		rw.log("Something went wrong, no fitting candidate for counting XP could be found.");
	}
}

function adjustXP(xpEarned, character, originalHP, oppLvl)
{
	var multiplier = ((xpAdjMult * oppLvl) + xpAdjCons) / ((xpAdjMult * ((2 * character[ids.LVL]) - oppLvl)) + xpAdjCons);

	if (multiplier > xpAdjHighCap)
	{
		multiplier = xpAdjHighCap;
	}

	else if (multiplier < xpAdjLowCap)
	{
		multiplier = xpAdjLowCap;
	}

	return Math.floor(((xpEarned * multiplier) * Math.pow(xpAdjLvlMult, character[ids.LVL])));
}

//Finds the total attacks of a group of weapons and arranges them
//in an ordered manner into an array
function getAttacks(wpns)
{
	var arr = [];

	for (var i = 0; i < wpns.length; i++)
	{
		for (var j = 0; j < wpns[i][ids.NBR_ATKS]; j++)
		{
			arr.push(wpns[i]);
		}
	}

	return arr;
}

function rollDescr(str1, roll1, roll2, str2, result = "", resultStr = "", space1 = 25, rollSpace1 = 2, space2 = 5, spaceRoll2 = 7)
{
	return str1.width(space1) + roll1.toString().width(rollSpace1) + " vs " + roll2.toString().width(spaceRoll2) + str2.width(space2) + " | " + result + resultStr;
}
