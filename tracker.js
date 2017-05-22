
const fs = require("fs");
const event = require("../../MrHound/Current/emitter.js");
const rw = require("../../MrHound/Current/reader_writer.js");

module.exports =
{
  pvpRanking: {},
  pveRanking: {},

  init: function()
  {
    setTimeout(update, msToNextMinute());
    return this;
  }
}

function msToNextHour()
{
  var d = new Date();
  d.setHours(d.getHours() + 1);
  d.setMinutes(0);
  d.setSeconds(0);

  return d.getTime() - Date.now();
}

function msToNextMinute()
{
  var d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  d.setSeconds(0);
  return d.getTime() - Date.now();
}

function update()
{
  var d = new Date();

  if (d.getMinutes() == 0)
  {
    event.e.emit("hour");
  }

  if (d.getSeconds() == 0)
  {
    event.e.emit("minute");
  }

  setTimeout(update, msToNextMinute());
}
