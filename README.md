# 🚗 Car Game

A **3D car racing game** built using **Three.js** and **Vite**. The game features customizable cars, dynamic road generation, interactive obstacles, and an immersive gaming experience.

## 🌟 Features

- **Realistic 3D graphics** powered by Three.js
- **Customizable cars** with different designs
- **Infinite road generation** for continuous gameplay
- **Dynamic obstacles** like rocks, barriers, and trees
- **Interactive controls** for keyboard and mobile devices
- **Pause menu** and car selection feature
- **Light effects** for headlights and brake lights

## 🎮 Gameplay

- **Arrow Keys / WASD**: Control the car's movement
- **Spacebar**: Pause/Resume the game
- **Escape**: Open the game menu
- **Mouse Click / Touch**: Interact with the UI

## 📦 Installation

### Prerequisites
Ensure you have **Node.js (>=18)** installed.

### Steps to run locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/car-game.git
   cd car-game
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser and go to:
   ```
   http://localhost:5173
   ```

## 🚀 Build & Deployment

To build the project for production:
```sh
npm run build
```

To deploy the project (e.g., GitHub Pages):
```sh
npm run deploy
```

## 🛠 Project Structure

```
src/
│── main.js         # Game initialization
│── scene.js        # Manages the 3D scene and lighting
│── renderer.js     # Handles rendering and screen updates
│── car.js          # Car creation and controls
│── road.js         # Road generation logic
│── environment.js  # Handles trees, rocks, and grass
│── controls.js     # Keyboard and mobile input handling
│── menu.js         # UI menus for game control
│── utils.js        # Utility functions
```

## 🧪 Testing

Run unit tests with:
```sh
npm test
```

## 📜 License

This project is licensed under the **Apache 2.0 License**.

## 🎨 Credits

Developed with **Three.js** and **Vite**.
