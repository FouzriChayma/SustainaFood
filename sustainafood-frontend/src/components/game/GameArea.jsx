import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// --- Constantes ---
const GAME_WIDTH = 600;
const GAME_HEIGHT = 300;
const FRUIT_SIZE = 32;
const TRASH_SIZE = 32;
const GROUND_HEIGHT = 10;
const FRUIT_X_POSITION = 50;
const JUMP_HEIGHT = 250; // Hauteur de saut
const JUMP_DURATION = 320;//ms pour monter
const GRAVITY_DURATION = 350; // ms pour descendre
const TRASH_SPEED = 5;
const TRASH_SPAWN_INTERVAL_MIN = 1500;
const TRASH_SPAWN_INTERVAL_MAX = 3000;
const GAME_LOOP_INTERVAL = 50; // ~20 FPS

function GameArea({ fruitType, onGameOver }) {
  const [fruitY, setFruitY] = useState(GROUND_HEIGHT);
  const [isJumping, setIsJumping] = useState(false);
  const [trashItems, setTrashItems] = useState([]);
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef(null);
  const gameLoopIntervalRef = useRef(null);
  const trashSpawnTimeoutRef = useRef(null);
  const nextTrashId = useRef(0);
  const jumpTimeoutRef = useRef(null);
  const fallTimeoutRef = useRef(null);

  // --- Logique du jeu ---

  // Fonction pour faire apparaître une poubelle (mémorisée)
  const spawnTrash = useCallback(() => {
    const newTrash = {
      id: nextTrashId.current++,
      x: GAME_WIDTH,
    };
    // Utilisation de la forme fonctionnelle pour garantir l'accès à l'état le plus récent
    setTrashItems((prevTrash) => [...prevTrash, newTrash]);

    const nextSpawnTime =
      Math.random() * (TRASH_SPAWN_INTERVAL_MAX - TRASH_SPAWN_INTERVAL_MIN) +
      TRASH_SPAWN_INTERVAL_MIN;
    trashSpawnTimeoutRef.current = setTimeout(spawnTrash, nextSpawnTime);
  }, []); // Aucune dépendance externe qui change

  // Fonction pour le saut (mémorisée)
  const jump = useCallback(() => {
    // Vérifie si déjà en train de sauter *avant* de faire quoi que ce soit
    if (isJumping) {
        // console.log("Already jumping, ignoring jump request");
        return;
    }

    // console.log("Jump initiated");
    setIsJumping(true);
    setFruitY(GROUND_HEIGHT + JUMP_HEIGHT);

    // Nettoie les timers précédents pour éviter les conflits
    if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);

    // Timeout pour commencer à tomber
    jumpTimeoutRef.current = setTimeout(() => {
        // console.log("Starting fall - setting Y to GROUND_HEIGHT");
      setFruitY(GROUND_HEIGHT);
      // Timeout pour marquer la fin du saut APRES le début de la chute
      fallTimeoutRef.current = setTimeout(() => {
        // console.log("Fall finished - setting isJumping to false");
        setIsJumping(false); // Permet de sauter à nouveau
        fallTimeoutRef.current = null;
      }, GRAVITY_DURATION);
      jumpTimeoutRef.current = null;
    }, JUMP_DURATION);
  }, [isJumping]); // Dépend de l'état isJumping

  // --- Boucle de jeu principale ---
  useEffect(() => {
    // Démarre l'apparition des poubelles au montage
    trashSpawnTimeoutRef.current = setTimeout(spawnTrash, TRASH_SPAWN_INTERVAL_MIN);

    // Démarre la boucle de jeu
    gameLoopIntervalRef.current = setInterval(() => {
      // 1. Déplacer les poubelles & mettre à jour le score
      setTrashItems((prevTrash) =>
        prevTrash
          .map((trash) => ({ ...trash, x: trash.x - TRASH_SPEED }))
          .filter((trash) => {
            if (trash.x < -TRASH_SIZE) {
              setScore((s) => s + 1); // Utiliser la forme fonctionnelle
              return false; // Supprime la poubelle
            }
            return true;
          })
      );

      // 2. Détection de collision (avec l'état le plus récent)
      // Utilise la forme fonctionnelle de setState pour accéder à l'état le plus récent
      // de fruitY et trashItems au moment de l'exécution de l'intervalle.
      // Note: isJumping est lu depuis la portée extérieure, mais comme il n'est plus
      // une dépendance de ce useEffect, sa valeur capturée ici peut être légèrement
      // décalée, mais c'est généralement acceptable pour cette logique. Si ce n'est pas
      // le cas, des refs pourraient être utilisées pour isJumping aussi.
      setFruitY(currentFruitY => {
            const fruitRect = {
                x: FRUIT_X_POSITION,
                y: GAME_HEIGHT - (currentFruitY + FRUIT_SIZE), // Y depuis le haut
                width: FRUIT_SIZE,
                height: FRUIT_SIZE,
            };

            setTrashItems(currentTrashItems => {
                for (const trash of currentTrashItems) {
                    const trashRect = {
                        x: trash.x,
                        y: GAME_HEIGHT - (GROUND_HEIGHT + TRASH_SIZE), // Y depuis le haut
                        width: TRASH_SIZE,
                        height: TRASH_SIZE,
                    };

                    // --- MODIFICATION CLÉ ---
                    // Vérifie la collision SEULEMENT si le fruit n'est PAS en train de sauter
                    if (
                        !isJumping && // <-- AJOUT DE CETTE CONDITION
                        fruitRect.x < trashRect.x + trashRect.width &&
                        fruitRect.x + fruitRect.width > trashRect.x &&
                        fruitRect.y < trashRect.y + trashRect.height &&
                        fruitRect.y + fruitRect.height > trashRect.y
                    ) {
                        console.log("Collision detected!");
                        // Arrêter tous les timers et intervalles
                        clearInterval(gameLoopIntervalRef.current);
                        clearTimeout(trashSpawnTimeoutRef.current);
                        clearTimeout(jumpTimeoutRef.current);
                        clearTimeout(fallTimeoutRef.current);
                        // Appeler onGameOver avec le score actuel
                        onGameOver(score);
                        // Pas besoin de retourner ici car onGameOver change l'état du jeu
                        return currentTrashItems; // Retourner l'état actuel pour setState
                    }
                    // --- FIN DE LA MODIFICATION ---
                }
                return currentTrashItems; // Retourner l'état si pas de collision
            });
            return currentFruitY; // Retourner l'état courant pour setFruitY
        });
    }, GAME_LOOP_INTERVAL);

    // --- Nettoyage au démontage ---
    return () => {
      clearInterval(gameLoopIntervalRef.current);
      if (trashSpawnTimeoutRef.current) clearTimeout(trashSpawnTimeoutRef.current);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
      if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
    };
    // --- MODIFICATION DES DÉPENDANCES ---
    // On ne dépend que de ce qui est nécessaire pour que la boucle *fonctionne*
    // et des callbacks externes. 'isJumping' et 'score' sont lus à l'intérieur
    // mais ne nécessitent pas de recréer l'intervalle à chaque changement.
  }, [onGameOver, score, spawnTrash]); // Retiré : jump, isJumping
  // --- FIN DE LA MODIFICATION DES DÉPENDANCES ---

  // --- Écouteur d'événement pour le saut ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [jump]); // Dépend de la fonction jump

  // --- Rendu du composant ---
  return (
    <div
      ref={gameAreaRef}
      className="game-area"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0}
    >
      <div className="score-display">Score: {score}</div>

      <div
        className="fruit"
        style={{
          left: `${FRUIT_X_POSITION}px`,
          bottom: `${fruitY}px`,
          width: `${FRUIT_SIZE}px`,
          height: `${FRUIT_SIZE}px`,
        }}
      >
        {fruitType}
      </div>

      {trashItems.map((trash) => (
        <div
          key={trash.id}
          className="trash"
          style={{
            left: `${trash.x}px`,
            bottom: `${GROUND_HEIGHT}px`,
            width: `${TRASH_SIZE}px`,
            height: `${TRASH_SIZE}px`,
          }}
        >
          🗑️
        </div>
      ))}
    </div>
  );
}

// --- Définition des PropTypes ---
GameArea.propTypes = {
  fruitType: PropTypes.string.isRequired,
  onGameOver: PropTypes.func.isRequired,
};
// --- Fin des PropTypes ---

export default GameArea;