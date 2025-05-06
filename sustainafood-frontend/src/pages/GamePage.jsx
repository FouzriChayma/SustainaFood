import React, { useState } from 'react';
import FruitSelector from '../components/game/FruitSelector'; // Ajustez le chemin si nécessaire
import GameArea from '../components/game/GameArea';         // Ajustez le chemin si nécessaire
import GameOver from '../components/game/GameOver';         // Ajustez le chemin si nécessaire
import '../assets/styles/Game.css'; // Ajustez le chemin si nécessaire

// Define possible game states
const GAME_STATES = {
  SELECTING: 'selecting',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
};

function GamePage() {
  const [gameState, setGameState] = useState(GAME_STATES.SELECTING);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [finalScore, setFinalScore] = useState(0);

  const handleSelectFruit = (fruit) => {
    setSelectedFruit(fruit);
  };

  const handleStartGame = () => {
    if (selectedFruit) {
      setGameState(GAME_STATES.PLAYING);
      setFinalScore(0); // Reset score for new game
    }
  };

  const handleGameOver = (score) => {
    setFinalScore(score);
    setGameState(GAME_STATES.GAME_OVER);
  };

  const handleRestart = () => {
    setGameState(GAME_STATES.SELECTING);
  };

  // Render different components based on game state
  const renderContent = () => {
    switch (gameState) {
      case GAME_STATES.PLAYING:
        return <GameArea fruitType={selectedFruit} onGameOver={handleGameOver} />;
      case GAME_STATES.GAME_OVER:
        return <GameOver score={finalScore} onRestart={handleRestart} />;
      case GAME_STATES.SELECTING:
      default:
        return (
          <FruitSelector
            selectedFruit={selectedFruit}
            onSelectFruit={handleSelectFruit}
            onStartGame={handleStartGame}
          />
        );
    }
  };

  return (
    <div className="app-container game-page-container"> {/* Utilise app-container pour le style global */}
      <h1>Sauve le Fruit !</h1>
      {renderContent()}
    </div>
  );
}

export default GamePage;