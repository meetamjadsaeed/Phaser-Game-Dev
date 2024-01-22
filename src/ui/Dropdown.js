import Phaser from "phaser";

export default class Dropdown extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options, defaultOption) {
    super(scene, x, y);
    scene.add.existing(this);

    this.options = options;
    this.selectedOption = defaultOption || options[0];
    this.isOpen = false;

    this.createDropdown();
  }

  createDropdown() {
    // Create the dropdown button
    this.button = scene.add.rectangle(0, 0, 200, 40, 0x808080);
    this.button.setOrigin(0);
    this.add(this.button);

    // Create the text for the selected option
    this.optionText = scene.add.text(10, 10, this.selectedOption, {
      fontSize: "16px",
      fill: "#000",
    });
    this.add(this.optionText);

    // Create the dropdown list
    this.list = scene.add.container(0, 40);

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const listItem = scene.add.text(10, i * 30, option, {
        fontSize: "16px",
        fill: "#000",
      });

      listItem.setInteractive();
      listItem.on("pointerdown", () => {
        this.selectedOption = option;
        this.optionText.setText(option);
        this.closeDropdown();
      });

      this.list.add(listItem);
    }

    this.list.setVisible(false);
    this.add(this.list);

    // Set up click event on the button
    this.button.setInteractive();
    this.button.on("pointerdown", () => {
      this.toggleDropdown();
    });

    // Close the dropdown when clicking outside of it
    scene.input.on("pointerdown", (pointer) => {
      if (this.isOpen && !this.getBounds().contains(pointer.x, pointer.y)) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.list.setVisible(this.isOpen);
  }

  closeDropdown() {
    this.isOpen = false;
    this.list.setVisible(false);
  }
}
