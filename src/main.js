import Phaser from "phaser";

import HelloWorldScene from "./scenes/HelloWorldScene";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [GameScene, HelloWorldScene],
  debugger: true,
};

export default new Phaser.Game(config);
