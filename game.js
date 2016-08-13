var world = {};
function rint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var _ = require("lodash");
var colors = require('colors');
var startypes = ["Red Giant".red,"Normal".yellow,"White dwarf".white];
var planettypes = ["molten".red,"volcanic".yellow,"warm rocky".gray,"lifebearing".green,"cold rocky".cyan,"frozen".blue];

function mkstar(depth) {
  var star = {};
  star.depth = depth;
  star.type = startypes[rint(0,2)];
  star.planets = mkplanets();
  return star;
}
function mkstars(depth) {
  var stars = new Array();
  for (i = depth*2; i >0; i--) {
    var star = {};
    star.depth = depth;
    star.type = startypes[rint(0,2)];
    star.planets = mkplanets();
    stars.push(star);
  }
  stars.forEach((element) => {
    if (typeof element == 'undefined') {
      console.log("undefined element");
      element = mkstar(depth);
    }
  })
  return stars;
}
function mkplanets() {
  var planets = new Array();
  for (i = rint(0,5); i > 0; i--) {
    var planet = {};
    planet.size = rint(1,5);
    planet.type = planettypes[rint(0,5)];
    planets.push(planet);
  }
  return planets;
}
  world.stars = [];
  world.stars.push([mkstar(0)]);
  world.stars.push(mkstars(1));
var net = require("net");
var server = net.createServer(function (socket) {
  socket.write("Welcome to the alpha of interplanetary.\r\n");
  socket.write(">")
  socket.gamedata = {};
  socket.gamedata.depth = 0;
  socket.gamedata.num = 0;
  socket.on('data',(data) => {
    console.log(data);
    var sdata = data.toString();
    sdata = sdata.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    sdata = sdata.replace(/\r?\n|\r/g, "");
    console.log(sdata);
    var cdata = sdata.split(" ");
    console.log(cdata);
    var cmd = cdata.shift();
    var rest = cdata.join(" ");
    console.log(cmd+"\n"+rest);
    switch (cmd.toLowerCase()) {
      case "look":
        if (!world.stars[socket.gamedata.depth]) {
          world.stars.push(mkstars(socket.gamedata.depth));
        }
        if ( !world.stars[socket.gamedata.depth][socket.gamedata.num]) {
          world.stars[socket.gamedata.depth].push(mkstar(socket.gamedata.depth));
        }

        socket.write("Star info:\r\n");
        socket.write("  "+world.stars[socket.gamedata.depth][socket.gamedata.num].type+"\r\n")
        socket.write("Planetary info:\r\n");
        var current = world.stars[socket.gamedata.depth][socket.gamedata.num];
        console.log(current);
        current.planets.forEach((element) => {
          socket.write("  "+element.type+", "+element.size+"\r\n");
          console.log(element.type+" "+element.size);
        })
        socket.write("End info feed\r\n");
        break;
      case "go":
        switch (cdata[0]) {
          case "up":
              if (!world.stars[socket.gamedata.depth]) {
                world.stars.push(mkstars(socket.gamedata.depth));
              }
              socket.gamedata.depth++;
            break;
          case "down":
              if (socket.gamedata.depth == 0) {
                socket.write("You cant go any farther\r\n".purple);
                return;
              }
              socket.gamedata.depth--;
            break;
          case "left":
              if (socket.gamedata.num == world.stars[socket.gamedata.depth].length) {
                socket.write("You cant go any farther\r\n".purple);
                return;
              }
              socket.gamedata.num++;
              break;
          case "right":
              if (socket.gamedata.num == 0) {
                socket.write("You cant go any farther\r\n".purple);
                return;
              }
              socket.gamedata.num--;
            break;
        }
        break;
      default:
        socket.write("Unknown command\r\n".purple);
        break;
      socket.write(">")
    }
  });
  socket.on('end',() => {
    console.log("Client disconnected");
    socket.destroy();
  })
  socket.on('error',(err) => {
    console.log(err);
  })
}).on('error', function (err) {
  console.log(err)

});
server.listen({
  port: 5318,
})
