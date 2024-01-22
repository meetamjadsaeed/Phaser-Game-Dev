import Phaser from "phaser";
import ScoreLabel from "../ui/ScoreLabel";
import BombSpawner from "../actions/BombSpawner";
import Dropdown from "../ui/Dropdown";

const CLIMBERS_KEY = "ground";
const CLIMBERS_SRC = "assets/supporters/dinasaur-climb3-removebg.png";

const BACKGROUND_KEY = "sky";
const BACKGROUND_SRC = "assets/backgrounds/pngimg-building.png";

const MAIN_CHARACTER_KEY = "dude";
const MAIN_CHARACTER_SRC = "assets/actors/dude.png";

const TARGET_OBJECT_KEY = "star";
const TARGET_OBJECT_SRC = "assets/rewards/cartoon-male.png";

const BOMB_OBSTACLE_KEY = "bomb";
const BOMB_OBSTACLE_SRC = "assets/obstacles/bomb.png";

const EAT_REWARD_SOUND_KEY = "eatRewardSound";
const EAT_REWARD_SOUND_SRC = "assets/sounds/eat-reward.wav";

const OUT_SOUND_KEY = "outSound";
const OUT_SOUND_SRC = "assets/sounds/outSound.wav";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.cursors = undefined;
    this.ScoreLabel = undefined;
    this.stars = undefined;
    this.bombSpawner = undefined;
    this.gameOver = false;
    this.gameStarted = false;
  }

  preload() {
    this.load.image(BACKGROUND_KEY, BACKGROUND_SRC);
    this.load.image(CLIMBERS_KEY, CLIMBERS_SRC);
    this.load.image(TARGET_OBJECT_KEY, TARGET_OBJECT_SRC);
    this.load.image(BOMB_OBSTACLE_KEY, BOMB_OBSTACLE_SRC);

    this.load.spritesheet(MAIN_CHARACTER_KEY, MAIN_CHARACTER_SRC, {
      frameWidth: 32,
      frameHeight: 48,
    });

    // sounds
    // Load the EAT REWARD sound
    this.load.audio(EAT_REWARD_SOUND_KEY, EAT_REWARD_SOUND_SRC);

    // Load the OUT sound
    this.load.audio(OUT_SOUND_KEY, OUT_SOUND_SRC);
  }

  create() {
    this.add.image(400, 300, BACKGROUND_KEY);
    // Uncomment the line below if you want to add an image of the star
    // this.add.image(400, 300, "star");

    const platforms = this.createPlatforms();
    this.player = this.createPlayer();

    this.stars = this.createStars();

    this.ScoreLabel = this.createScoreLabel(16, 16, 0);

    this.bombSpawner = new BombSpawner(this, BOMB_OBSTACLE_KEY);
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

    // Create the Start Game button
    this.createStartButton();
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

    // Play the hit sound when the character hits a star
    this.playEatSound();
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);

    this.add.existing(label);

    return label;
  }

  createStars() {
    const targetObjects = this.physics.add.group({
      key: TARGET_OBJECT_KEY,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    targetObjects.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    return targetObjects;
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

    // Play the hit sound when the character hits an obstacle
    this.playOutSound();
  }

  createPlatforms() {
    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 768, CLIMBERS_KEY).setScale(2).refreshBody();

    platforms.create(600, 400, CLIMBERS_KEY);
    platforms.create(50, 250, CLIMBERS_KEY);
    platforms.create(750, 220, CLIMBERS_KEY);

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

  startGame() {
    this.gameStarted = true;
    this.scene.start("game-scene");
  }

  createStartButton() {
    if (!this.gameStarted && !this.gameOver) {
      const startButton = this.add
        .text(400, 300, "Start Game", {
          fontSize: "32px",
          fill: "#fff",
          backgroundColor: "#333",
          padding: {
            x: 16,
            y: 8,
          },
          align: "center",
        })
        .setOrigin(0.5)
        .setInteractive();

      startButton.on("pointerdown", () => {
        this.startGame();

        // // skin change dropdown
        this.changeBackgroundSkin();
      });

      this.startButton = startButton;
    } else {
      if (this.startButton) {
        this.startButton.destroy();
      }
    }
  }

  playEatSound() {
    this.sound.play(EAT_REWARD_SOUND_KEY);
  }

  playOutSound() {
    this.sound.play(OUT_SOUND_KEY);
  }

  changeBackgroundSkin() {
    const backgroundOptions = ["Background 1", "Background 2", "Background 3"];
    const backgroundDropdown = new Dropdown(
      this,
      100,
      100,
      backgroundOptions,
      "Background 1"
    );

    backgroundDropdown.setPosition(100, 100);

    // Add the dropdown to the scene
    this.add.existing(backgroundDropdown);

    // Add an event listener to handle changes to the background skin
    backgroundDropdown.on("change", (selectedOption) => {
      // Handle background skin change here based on selectedOption
      console.log(`Selected background: ${selectedOption}`);
    });
  }
}
