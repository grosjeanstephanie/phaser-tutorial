var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
  );
  this.load.spritesheet('firework',
      'assets/firework.png',
      { frameWidth: 800/15, frameHeight: 38 }
  );
  this.load.audio('coinsound', 'assets/coinsound.mp3');
  this.load.audio('gameoversound', 'assets/gameoversound.mp3');

}
let platforms;
let player;
let cursors;
let stars;
let score = 0;
let scoreText;
let gameOverText;
let gameOver = false;
let bombs;
let firework;

function create() {
  this.add.image(400, 300, 'sky');
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });
  this.anims.create({
    key: 'yes',
    frames: this.anims.generateFrameNumbers('firework', { start: 0, end: 14 }),
    frameRate: 10,
    repeat: -1
});
  this.physics.add.collider(player, platforms);
  cursors = this.input.keyboard.createCursorKeys();
  YKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
  stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  });
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function update() {
  if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
  }
  if (YKey.isDown && gameOver)  {
      this.scene.restart();
      console.log("y")
  }
}
function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText('Score: ' + score);
  if (score === 20) {
    for(let i=0; i<20; i++) {
      let x = Phaser.Math.Between(0, 800);
      let y = Phaser.Math.Between(0, 600);
      firework = this.physics.add.sprite(x, y, 'firework');
      firework.anims.play('yes',true);
    }
      this.physics.pause();
      gameOverText = this.add.text(200, 200, 'YOU WIN \n PRESS Y TO RESTART', { fontSize: '50px', fill: '#000' });
      gameOver = true;
     //add sound here
     //const 
  }

  if (stars.countActive(true) === 0) {
      stars.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

  }

   const soundStar = this.sound.add("coinsound");
  soundStar.play();
}
function hitBomb(player, bomb) {
  this.physics.pause();
  gameOverText = this.add.text(200, 200, 'GAME OVER \n PRESS Y TO RESTART', { fontSize: '50px', fill: '#000' });
  //this.scene.restart();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;

  const soundGameOver = this.sound.add("gameoversound");
  soundGameOver.play();
  score = 0;
}