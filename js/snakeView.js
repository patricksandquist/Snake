(function () {
  if (typeof Game === "undefined") {
    window.Game = {};
  }

  var View = Game.View = function ($el) {
    this.$el = $el;
    this.board = new Game.Board(30);
    this.setUpGrid();
    this.paused = false;
    this.started = false;
    this.step_delay = View.SLOW_DELAY;
    this.render();

    $(window).on("keydown", this.handleKeyEvent.bind(this));
    $(window).on("keyup", this.handleKeyUpEvent.bind(this));
  };

  View.KEYS = {
    38: "N",
    39: "E",
    40: "S",
    37: "W"
  };

  View.FAST_DELAY = 50;
  View.SLOW_DELAY = 100;

  View.prototype.handleKeyEvent = function (e) {
    if (!this.started && View.KEYS[e.keyCode]) {
      this.board.snake.initDir(View.KEYS[e.keyCode]);
      this.step();
      this.intervalId = window.setInterval(
        this.step.bind(this),
        this.step_delay
      );
      this.started = true;
    }

    if (e.keyCode == 32 && this.step_delay !== View.FAST_DELAY) {
      this.updateInterval(View.FAST_DELAY);
    }
    if (e.keyCode == 80) {
      // "P" pressed, pause/unpause the game
      this.paused = !this.paused;
      this.updateHeader();
    } else if (!this.paused && View.KEYS[e.keyCode]) {
      this.board.snake.turn(View.KEYS[e.keyCode]);
    }
  };

  View.prototype.updateInterval = function (step_delay) {
    window.clearInterval(this.intervalId);
    this.step_delay = step_delay;
    this.intervalId = window.setInterval(this.step.bind(this), step_delay);
  };

  View.prototype.handleKeyUpEvent = function (e) {
    if (e.keyCode == 32) {
      // "Space" pressed, lower speed
      this.updateInterval(View.SLOW_DELAY);
    }
  };

  View.prototype.step = function () {
    if (!this.paused) {
      if (this.step_delay == View.FAST_DELAY) {
        this.board.snake.move(true);
      } else {
        this.board.snake.move(false);
      }
      if (this.board.snake.dead) {
        alert("You lose!");
        window.clearInterval(this.intervalId);
      } else {
        this.render();
      }
    }
  };

  View.prototype.render = function () {
    this.updateHeader();
    this.updateClasses([this.board.apple.position], "apple");
    this.updateClasses(this.board.snake.segments, "snake");
  };

  View.prototype.updateHeader = function () {
    var $h2 = this.$el.find("h2");
    if (this.paused) {
      $h2.replaceWith("<h2>Paused. Press Space to resume</h2>");
    } else {
      $h2.replaceWith("<h2>" + this.board.snake.score + "</h2>");
    }
  };

  View.prototype.updateClasses = function (coords, className) {
    var $li = this.$el.find("li");
    $li.filter("." + className).removeClass();
    $li.empty();  // delete all children

    coords.forEach(function (coord) {
      var flatCoord = (coord.i * this.board.dim) + coord.j;
      $li.eq(flatCoord).addClass(className);
    }.bind(this));
    $("li.apple").replaceWith("<li class='apple'><i class='fa fa-birthday-cake'></i></li>");
  };

  View.prototype.setUpGrid = function () {
    var output = "<h2>" + this.board.snake.score + "</h2>";
    output += "<div class='snake-board'>";

    for (var i = 0; i < this.board.dim; i++) {
      output += "<ul>";
      for (var j = 0; j < this.board.dim; j++) {
        output += "<li></li>";
      }
      output += "</ul>";
    }
    output += "</div>";
    output += "<h3>(P) for pause. Hold (Space) to double your points!</h3>";

    this.$el.html(output);
  };
})();
