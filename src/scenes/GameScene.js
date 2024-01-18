import Phaser from "phaser";

import ScoreLabel from "../ui/ScoreLabel";
import BombSpawner from "../actions/BombSpawner";

const GROUND_KEY = "ground";

const BACKGROUND_KEY = "sky";
const BACKGROUND_SRC = "assets/sky.png";

const MAIN_CHARACTER_KEY = "dude";
const MAIN_CHARACTER_SRC = "assets/dude.png";

const TARGET_OBJECT_KEY = "star";
const TARGET_OBJECT_SRC = "assets/cartoon-male.png";

const BOMB_KEY = "bomb";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.cursors = undefined;
    this.ScoreLabel = undefined;
    this.stars = undefined;
    this.bombSpawner = undefined;
    this.gameOver = false;
  }

  preload() {
    this.load.image(BACKGROUND_KEY, BACKGROUND_SRC);
    this.load.image(GROUND_KEY, "assets/platform.png");
    this.load.image(TARGET_OBJECT_KEY, TARGET_OBJECT_SRC);
    this.load.image(BOMB_KEY, "assets/bomb.png");

    this.load.spritesheet(MAIN_CHARACTER_KEY, MAIN_CHARACTER_SRC, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, BACKGROUND_KEY);
    // this.add.image(400, 300, "star");

    const platforms = this.createPlatforms();
    this.player = this.createPlayer();

    this.stars = this.createStars();

    this.ScoreLabel = this.createScoreLabel(16, 16, 0);

    this.bombSpawner = new BombSpawner(this, BOMB_KEY);
    const bombsGroup = this.bombSpawner.group;

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.stars, platforms);
    this.physics.add.collider(bombsGroup, platforms);

    this.physics.add.collider(
      this.player,
      bombsGroup,
      this.hitBomb,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    this.ScoreLabel.add(10);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        child.enableBody(true, child.x, 0, true, true);
      });

      this.bombSpawner.spawn(player.x);
    }
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);

    this.add.existing(label);

    return label;
  }

  createStars() {
    const stars = this.physics.add.group({
      key: TARGET_OBJECT_KEY,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    return stars;
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    this.gameOver = true;
  }

  createPlatforms() {
    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody();

    platforms.create(600, 400, GROUND_KEY);
    platforms.create(50, 250, GROUND_KEY);
    platforms.create(750, 220, GROUND_KEY);

    return platforms;
  }

  createPlayer() {
    const player = this.physics.add.sprite(100, 450, MAIN_CHARACTER_KEY);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(MAIN_CHARACTER_KEY, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: MAIN_CHARACTER_KEY, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(MAIN_CHARACTER_KEY, {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    return player;
  }
}
