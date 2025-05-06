import PropTypes from 'prop-types'; // <-- Importer PropTypes

function GameOver({ score, onRestart }) {
  return (
    <div className="game-over">
      <h2>😭 Game Over! 😭</h2>
      <p>Ton score final : {score}</p>
      <button className="restart-button" onClick={onRestart}>
        Rejouer
      </button>
    </div>
  );
}

// --- PropTypes Validation ---
GameOver.propTypes = {
  score: PropTypes.number.isRequired,
  onRestart: PropTypes.func.isRequired,
};
// --- Fin PropTypes ---

export default GameOver;