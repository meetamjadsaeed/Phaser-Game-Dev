import Phaser from "phaser";

export default class BombSpawner {
  constructor(scene, bombKey = "bomb") {
    this.scene = scene;
    this.key = bombKey;

    // Initialize the group in the constructor
    this._group = this.scene.physics.add.group();
  }

  get group() {
    return this._group;
  }

  spawn(playerX = 0) {
    // Spawn up to 10 bombs
    const numberOfBombs = Phaser.Math.Between(1, 10);

    for (let i = 0; i < numberOfBombs; i++) {
      const x =
        playerX < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.group.create(x, 16, this.key);
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

      // Add some debugging output
      console.log("Bomb spawned at x:", x);
      console.log("Bomb velocity:", bomb.body.velocity);
    }

    return this.group.getChildren()[this.group.getChildren().length - 1];
  }
}
