import PropTypes from 'prop-types'; // <-- Importer PropTypes

const FRUITS = ['🍎', '🍌', '🍓', '🍊', '🍇']; // Available fruits

function FruitSelector({ selectedFruit, onSelectFruit, onStartGame }) {
  return (
    <div className="fruit-selector">
      <h2>Choisis ton fruit :</h2>
      <div className="fruit-options">
        {FRUITS.map((fruit) => (
          <button
            key={fruit}
            onClick={() => onSelectFruit(fruit)}
            className={selectedFruit === fruit ? 'selected' : ''}
            aria-label={`Choisir ${fruit}`} // For accessibility
          >
            {fruit}
          </button>
        ))}
      </div>
      <button
        className="start-button"
        onClick={onStartGame}
        disabled={!selectedFruit} // Disable if no fruit is selected
      >
        Commencer à jouer
      </button>
    </div>
  );
}

// --- PropTypes Validation ---
FruitSelector.propTypes = {
  selectedFruit: PropTypes.string,
  onSelectFruit: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
};
// --- Fin PropTypes ---

export default FruitSelector;