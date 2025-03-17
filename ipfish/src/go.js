/** @param {NS} ns */
export async function main(ns) {

    for (const script of ns.ps()) {
      if (script.pid === ns.pid) {
        ;
      }
      else if (script.filename === "go.js") { ns.kill(script.pid) }
    }
  
    const getRandomOpponent = () => {
      const opponents = ["Slum Snakes", "The Black Hand", "Tetrads", "Daedalus", "Illuminati"];
      const randomIndex = Math.floor(Math.random() * opponents.length);
      return opponents[randomIndex] ?? [];
    };
  
    const boardSize = ns.args[0] ?? 13
    ns.go.resetBoardState(getRandomOpponent(), boardSize)
  
  let result
  do {
    let board = createBoard(ns)

    result = await getMove(ns, board, "black", 40, result?.type)
    
    // Log opponent's next move, once it happens
    await ns.go.opponentNextTurn();
    if (result?.type == "gameOver") {
      ns.go.resetBoardState(getRandomOpponent(), boardSize)
    }
    // Keep looping
  // eslint-disable-next-line no-constant-condition
  } while (true);
}



/*
Creates a board in line with the board type for the go code
*/
export function createBoard(ns) {

  const color = ns.go.getBoardState()
  const board = Array.from({ length: color.length }, (_, x) =>
    Array.from({ length: color.length }, (_, y) => {
      if (color[x][y] != "#") {
        let pointState = { color: null, chain: "", liberties: null, x, y }
        if (color[x][y] === "O") { pointState.color = "white" }
        else if (color[x][y] === "X") { pointState.color = "black" }
        else if (color[x][y] === ".") { pointState.color = "empty" }
        return pointState
      }
      else { return null }
    })
  )
  updateChains(ns, board)
  return board

}

/**
 * Finds all groups of connected stones on the board, and updates the points in them with their
 * chain information and liberties.
 * Updates a board in-place.
 */
//export function updateChains(board: Board, resetChains = true): void
export function updateChains(ns, board, resetChains = true) {
  if (resetChains) clearChains(ns, board);

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const point = board[x][y];
      // If the current point is already analyzed, skip it
      if (!point || point.chain !== "") continue;

      const chainMembers = findAdjacentPointsInChain(ns, board, x, y);
      const libertiesForChain = findLibertiesForChain(ns, board, chainMembers);
      const id = `${point.x},${point.y}`;

      chainMembers.forEach((member) => {
        member.chain = id;
        member.liberties = libertiesForChain;
      });
    }
  }
}

/**
 * Removes the chain data from all points on a board, in preparation for being recalculated later
 * Updates the board in-place
 */
//function clearChains(board: Board): void
function clearChains(ns, board) {
  for (const column of board) {
    for (const point of column) {
      if (!point) continue;
      point.chain = "";
      point.liberties = null;
    }
  }
}


/**
 * Finds all the pieces in the current continuous group, or 'chain'
 *
 * Iteratively traverse the adjacent pieces of the same color to find all the pieces in the same chain,
 * which are the pieces connected directly via a path consisting only of only up/down/left/right
 */
//export function findAdjacentPointsInChain(board: Board, x: number, y: number)
export function findAdjacentPointsInChain(ns, board, x, y) {
  const point = board[x][y];
  if (!point) {
    return [];
  }
  const checkedPoints = [];
  const adjacentPoints = [point];
  const pointsToCheckNeighbors = [point];

  while (pointsToCheckNeighbors.length) {
    const currentPoint = pointsToCheckNeighbors.pop();
    if (!currentPoint) {
      break;
    }

    checkedPoints.push(currentPoint);
    const neighbors = findNeighbors(ns, board, currentPoint.x, currentPoint.y);

    [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(isNotNullish).forEach((neighbor) => {
      if (neighbor && neighbor.color === currentPoint.color && !contains(ns, checkedPoints, neighbor)) {
        adjacentPoints.push(neighbor);
        pointsToCheckNeighbors.push(neighbor);
      }
      checkedPoints.push(neighbor);
    });
  }

  return adjacentPoints;
}

//export function findNeighbors(board: Board, x: number, y: number): Neighbor
export function findNeighbors(ns, board, x, y) {
  return {
    north: board[x]?.[y + 1],
    east: board[x + 1]?.[y],
    south: board[x]?.[y - 1],
    west: board[x - 1]?.[y],
  };
}

export function isNotNullish(argument) {
  return argument != null;
}

export function contains(ns, arr, point) {
  return !!arr.find((p) => p && p.x === point.x && p.y === point.y);
}


/**
 * Find all empty points adjacent to any piece in a given chain
 */
//export function findLibertiesForChain(board: Board, chain: PointState[]): PointState[]
export function findLibertiesForChain(ns, board, chain) {
  return getAllNeighbors(ns, board, chain).filter((neighbor) => neighbor && neighbor.color === "empty");
}

/**
 * Gets all points adjacent to the given point
 */
export function getAllNeighbors(ns, board, chain) {
  const allNeighbors = chain.reduce((chainNeighbors, point) => {
    getArrayFromNeighbor(ns, findNeighbors(ns, board, point.x, point.y))
      .filter((neighborPoint) => !isPointInChain(ns, neighborPoint, chain))
      .forEach((neighborPoint) => chainNeighbors.add(neighborPoint));
    return chainNeighbors;
  }, new Set());
  return [...allNeighbors];
}

//export function getArrayFromNeighbor(neighborObject: Neighbor): PointState[]
export function getArrayFromNeighbor(ns, neighborObject) {
  return [neighborObject.north, neighborObject.east, neighborObject.south, neighborObject.west].filter(isNotNullish);
}


/**
 * Determines if chain has a point that matches the given coordinates
 */
//export function isPointInChain(point: PointState, chain: PointState[])
export function isPointInChain(ns, point, chain) {
  return !!chain.find((chainPoint) => chainPoint.x === point.x && chainPoint.y === point.y);
}


/*
  Basic GO AIs, each with some personality and weaknesses

  The AIs are aware of chains of connected pieces, their liberties, and their eyes.
  They know how to lok for moves that capture or threaten capture, moves that create eyes, and moves that take
     away liberties from their opponent, as well as some pattern matching on strong move ideas.

  They do not know about larger jump moves, nor about frameworks on the board. Also, they each have a tendancy to
     over-focus on a different type of move, giving each AI a different playstyle and weakness to exploit.
 */

/**
 * Finds an array of potential moves based on the current board state, then chooses one
 * based on the given opponent's personality and preferences. If no preference is given by the AI,
 * will choose one from the reasonable moves at random.
 *
 * @returns a promise that will resolve with a move (or pass) from the designated AI opponent.
 */
/*export async function getMove(
  boardState: BoardState,
  player: GoColor,
  opponent: GoOpponent,
  useOfflineCycles = true,
  rngOverride?: number,
): Promise<Play & { type: GoPlayType.move | GoPlayType.pass }>*/
export async function getMove(
  ns,
  boardState,
  player,
  sleepMs,
  opponentMove
) {
  //await waitCycle(useOfflineCycles);
  await ns.sleep(sleepMs)
  //const rng = new WHRNG(rngOverride || Player.totalPlaytime);
  //const smart = isSmart(opponent, rng.random());
  const smart = true;
  const moves = getMoveOptions(ns, boardState, player, smart, opponentMove);

  const priorityMoves = await getPriorityMove(ns, moves);
  const validPriorityMoves = priorityMoves.filter((move) => evaluateIfMoveIsValid(ns,move.x, move.y) && move.score > 0)
  if (validPriorityMoves.length > 0) {
    validPriorityMoves.sort((a,b) => b.score - a.score) 
    //  .filter((point) => evaluateIfMoveIsValid(ns,point.x, point.y));
    return await ns.go.makeMove(validPriorityMoves[0].x, validPriorityMoves[0].y)
  }
  else { return await ns.go.passTurn() };
}


/**
 * Gets a group of reasonable moves based on the current board state, to be passed to the factions' AI to decide on
 */
//function getMoveOptions(boardState: BoardState, player: GoColor, rng: number, smart = true)
function getMoveOptions(ns, board, player, smart = true, opponentMove) {
  const availableSpaces = findDisputedTerritory(ns, board, player, smart);
  const contestedPoints = getDisputedTerritoryMoves(ns, board, availableSpaces);
  const expansionMoves = getExpansionMoveArray(ns, board, availableSpaces);

  // If the player is passing, and all territory is surrounded by a single color: do not suggest moves that
  // needlessly extend the game, unless they actually can change the score
  const endGameAvailable = !contestedPoints.length && opponentMove === "pass";

  const moveOptionGetters = {
    surround: () => getSurroundMove(ns, board, player, availableSpaces, smart) ?? [],
    defend: () => getDefendMove(ns, board, player, availableSpaces) ?? [],
    pattern: async () => {
      const array = endGameAvailable ? null : await findAnyMatchedPatterns(ns, board, player, availableSpaces, smart);
      return array ? array : [];
    },
    eyeMove: () => (endGameAvailable ? null : getEyeCreationMove(ns, board, player, availableSpaces) ?? []),
    eyeBlock2: () => (endGameAvailable ? null : getEyeBlockingMove2(ns, board, player, availableSpaces) ?? []),
    eyeBlock1: () => (endGameAvailable ? null : getEyeBlockingMove1(ns, board, player, availableSpaces) ?? []),
    corner: () => {
      const array = getCornerMove(ns, board);
      return array ? array : [];
    },
    jump: () => getJumpMove(ns, board, player, availableSpaces, expansionMoves) ?? [],
    expansion: () => getExpansionMove(ns, board, availableSpaces, expansionMoves) ?? [],
    endGameAvailable: endGameAvailable
  };

  return moveOptionGetters;
}

/**
 * Any empty space fully encircled by the opponent is not worth playing in, unless one of its borders explicitly has a weakness
 *
 * Specifically, ignore any empty space encircled by the opponent, unless one of the chains that is on the exterior:
 *   * does not have too many more liberties
 *   * has been fully encircled on the outside by the current player
 *   * Only has liberties remaining inside the abovementioned empty space
 *
 * In which case, only the liberties of that one weak chain are worth considering. Other parts of that fully-encircled
 * enemy space, and other similar spaces, should be ignored, otherwise the game drags on too long
 */
//export function findDisputedTerritory(boardState: BoardState, player: GoColor, excludeFriendlyEyes?: boolean)
export function findDisputedTerritory(ns, board, player, excludeFriendlyEyes) {
  let validMoves = getAllValidMoves(ns, board, player)
  if (excludeFriendlyEyes) {
    const friendlyEyes = getAllEyes(ns, board, player)
      .filter((eye) => eye.length >= 2)
      .flat()
      .flat();
    validMoves = validMoves.filter((point) => !contains(ns, friendlyEyes, point));
  }
  const opponent = player === "white" ? "black" : "white";
  const chains = getAllChains(ns, board);
  const emptySpacesToAnalyze = getAllPotentialEyes(ns, board, chains, opponent);
  const nodesInsideEyeSpacesToAnalyze = emptySpacesToAnalyze.map((space) => space.chain).flat();

  const playableNodesInsideOfEnemySpace = emptySpacesToAnalyze.reduce((playableNodes, space) => {
    // Look for any opponent chains on the border of the empty space, to see if it has a weakness
    const attackableLiberties = space.neighbors
      .map((neighborChain) => {
        const liberties = neighborChain[0].liberties ?? [];

        // Ignore border chains with too many liberties, they can't effectively be attacked
        if (liberties.length > 4) {
          return [];
        }

        // Get all opponent chains that make up the border of the opponent-controlled space
        const neighborChains = getAllNeighboringChains(ns, board, neighborChain, chains);

        // Ignore border chains that do not touch the current player's pieces somewhere, as they are likely fully interior
        // to the empty space in question, or only share a border with the edge of the board and the space, or are not yet
        // surrounded on the exterior and ready to be attacked within
        if (!neighborChains.find((chain) => chain?.[0]?.color === player)) {
          return [];
        }

        const libertiesInsideOfSpaceToAnalyze = liberties
          .filter(isNotNullish)
          .filter((point) => contains(ns, space.chain, point));

        // If the chain has any liberties outside the empty space being analyzed, it is not yet fully surrounded,
        // and should not be attacked yet
        if (libertiesInsideOfSpaceToAnalyze.length !== liberties.length) {
          return [];
        }

        // If the enemy chain is fully surrounded on the outside of the space by the current player, then its liberties
        // inside the empty space is worth considering for an attack
        return libertiesInsideOfSpaceToAnalyze;
      })
      .flat();

    return [...playableNodes, ...attackableLiberties];
  }, []);

  // Return only valid moves that are not inside enemy surrounded empty spaces, or ones that are explicitly next to an enemy chain that can be attacked
  return validMoves.filter(
    (move) => !contains(ns, nodesInsideEyeSpacesToAnalyze, move) || contains(ns, playableNodesInsideOfEnemySpace, move),
  );
}

/**
 * Returns a list of points that are valid moves for the given player
 */
//export function getAllValidMoves(boardState: BoardState, player: GoColor)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAllValidMoves(ns, board, player) {
  return getEmptySpaces(ns, board).filter(
    (point) => evaluateIfMoveIsValid(ns, point.x, point.y) === true,
  );
}

/**
 * Finds all empty spaces on the board.
 */
//export function getEmptySpaces(board: Board): PointState[]
export function getEmptySpaces(ns, board) {
  const emptySpaces = [];

  board.forEach((column) => {
    column.forEach((point) => {
      if (point && point.color === "empty") {
        emptySpaces.push(point);
      }
    });
  });

  return emptySpaces;
}

/**
fuck it, doing our own thing here
 */
//export function evaluateIfMoveIsValid(boardState: BoardState, x: number, y: number, player: GoColor, shortcut = true)
export function evaluateIfMoveIsValid(ns, x, y) {
  const validMoves = ns.go.analysis.getValidMoves()
  return validMoves[x][y]
}


/**
 * Get a list of all eyes, grouped by the chain they are adjacent to
 */
//export function getAllEyes(board: Board, player: GoColor, eyesObject?: { [s: string]: PointState[][] })
export function getAllEyes(ns, board, player, eyesObject) {
  const eyes = eyesObject ?? getAllEyesByChainId(ns, board, player);
  return Object.keys(eyes).map((key) => eyes[key]);
}

/**
  Find all empty point groups where either:
  * all of its immediate surrounding player-controlled points are in the same continuous chain, or
  * it is completely surrounded by some single larger chain and the edge of the board

  Eyes are important, because a chain of pieces cannot be captured if it fully surrounds two or more eyes.
 */
//export function getAllEyesByChainId(board: Board, player: GoColor)
export function getAllEyesByChainId(ns, board, player) {
  const allChains = getAllChains(ns, board);
  const eyeCandidates = getAllPotentialEyes(ns, board, allChains, player);
  const eyes = {}; //eyes: { [s: string]: PointState[][] } = {};

  eyeCandidates.forEach((candidate) => {
    if (candidate.neighbors.length === 0) {
      return;
    }

    // If only one chain surrounds the empty space, it is a true eye
    if (candidate.neighbors.length === 1) {
      const neighborChainID = candidate.neighbors[0][0].chain;
      eyes[neighborChainID] = eyes[neighborChainID] || [];
      eyes[neighborChainID].push(candidate.chain);
      return;
    }

    // If any chain fully encircles the empty space (even if there are other chains encircled as well), the eye is true
    const neighborsEncirclingEye = findNeighboringChainsThatFullyEncircleEmptySpace(
      ns,
      board,
      candidate.chain,
      candidate.neighbors,
      allChains,
    );
    neighborsEncirclingEye.forEach((neighborChain) => {
      const neighborChainID = neighborChain[0].chain;
      eyes[neighborChainID] = eyes[neighborChainID] || [];
      eyes[neighborChainID].push(candidate.chain);
    });
  });

  return eyes;
}

/**
 * Finds all groups of connected pieces, or empty space groups
 */
//export function getAllChains(board: Board): PointState[][]
export function getAllChains(ns, board) {
  const chains = {};

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const point = board[x]?.[y];
      // If the current chain is already analyzed, skip it
      if (!point || point.chain === "") {
        continue;
      }

      chains[point.chain] = chains[point.chain] || [];
      chains[point.chain].push(point);
    }
  }
  return Object.keys(chains).map((key) => chains[key]);
}


/**
 *  For each chain bordering an eye candidate:
 *    remove all other neighboring chains. (replace with empty points)
 *    check if the eye candidate is a simple true eye now
 *       If so, the original candidate is a true eye.
 */
/*function findNeighboringChainsThatFullyEncircleEmptySpace(
  board: Board,
  candidateChain: PointState[],
  neighborChainList: PointState[][],
  allChains: PointState[][],
)*/
function findNeighboringChainsThatFullyEncircleEmptySpace(
  ns,
  board,
  candidateChain,
  neighborChainList,
  allChains,
) {
  const boardMax = board[0].length - 1;
  const candidateSpread = findFurthestPointsOfChain(ns, candidateChain);
  return neighborChainList.filter((neighborChain, index) => {
    // If the chain does not go far enough to surround the eye in question, don't bother building an eval board
    const neighborSpread = findFurthestPointsOfChain(ns, neighborChain);

    const couldWrapNorth =
      neighborSpread.north > candidateSpread.north ||
      (candidateSpread.north === boardMax && neighborSpread.north === boardMax);
    const couldWrapEast =
      neighborSpread.east > candidateSpread.east ||
      (candidateSpread.east === boardMax && neighborSpread.east === boardMax);
    const couldWrapSouth =
      neighborSpread.south < candidateSpread.south || (candidateSpread.south === 0 && neighborSpread.south === 0);
    const couldWrapWest =
      neighborSpread.west < candidateSpread.west || (candidateSpread.west === 0 && neighborSpread.west === 0);

    if (!couldWrapNorth || !couldWrapEast || !couldWrapSouth || !couldWrapWest) {
      return false;
    }

    const evaluationBoard = getBoardCopy(ns, board);
    const examplePoint = candidateChain[0];
    const otherChainNeighborPoints = removePointAtIndex(ns, neighborChainList, index).flat().filter(isNotNullish);
    otherChainNeighborPoints.forEach((point) => {
      const pointToEdit = evaluationBoard[point.x]?.[point.y];
      if (pointToEdit) {
        pointToEdit.color = "empty";
      }
    });
    updateChains(ns, evaluationBoard);
    const newChains = getAllChains(ns, evaluationBoard);
    const newChainID = evaluationBoard[examplePoint.x]?.[examplePoint.y]?.chain;
    const chain = newChains.find((chain) => chain[0].chain === newChainID) || [];
    const newNeighborChains = getAllNeighboringChains(ns, board, chain, allChains);

    return newNeighborChains.length === 1;
  });
}

/**
 * Determine the furthest that a chain extends in each of the cardinal directions
 */
//function findFurthestPointsOfChain(chain: PointState[])
function findFurthestPointsOfChain(ns, chain) {
  return chain.reduce(
    (directions, point) => {
      if (point.y > directions.north) {
        directions.north = point.y;
      }
      if (point.y < directions.south) {
        directions.south = point.y;
      }
      if (point.x > directions.east) {
        directions.east = point.x;
      }
      if (point.x < directions.west) {
        directions.west = point.x;
      }

      return directions;
    },
    {
      north: chain[0].y,
      east: chain[0].x,
      south: chain[0].y,
      west: chain[0].x,
    },
  );
}


/** Make a deep copy of a board */
//export function getBoardCopy(board: Board): Board
export function getBoardCopy(ns, board) {
  // eslint-disable-next-line no-undef
  return structuredClone(board);
}


/**
 * Removes an element from an array at the given index
 */
//function removePointAtIndex(arr: PointState[][], index: number)
function removePointAtIndex(ns, arr, index) {
  const newArr = [...arr];
  newArr.splice(index, 1);
  return newArr;
}


/**
 * Get all player chains that are adjacent / touching the current chain
 */
//export function getAllNeighboringChains(board: Board, chain: PointState[], allChains: PointState[][])
export function getAllNeighboringChains(ns, board, chain, allChains) {
  const playerNeighbors = getPlayerNeighbors(ns, board, chain);

  const neighboringChains = playerNeighbors.reduce(
    (neighborChains, neighbor) =>
      neighborChains.add(allChains.find((chain) => chain[0].chain === neighbor.chain) || []),
    new Set(),
  );

  return [...neighboringChains];
}

/**
 * Gets all points that have player pieces adjacent to the given point
 */
//export function getPlayerNeighbors(board: Board, chain: PointState[])
export function getPlayerNeighbors(ns, board, chain) {
  return getAllNeighbors(ns, board, chain).filter((neighbor) => neighbor && neighbor.color !== "empty");
}


/**
  Find all empty spaces completely surrounded by a single player color.
  For each player chain number, add any empty space chains that are completely surrounded by a single player's color to
   an array at that chain number's index.
 */
//export function getAllPotentialEyes(board: Board, allChains: PointState[][], player: GoColor, _maxSize?: number)
export function getAllPotentialEyes(ns, board, allChains, player, _maxSize) {
  const nodeCount = board.map((row) => row.filter((p) => p)).flat().length;
  const maxSize = _maxSize ?? Math.min(nodeCount * 0.4, 11);
  const emptyPointChains = allChains.filter((chain) => chain[0].color === "empty");
  const eyeCandidates = [];

  emptyPointChains
    .filter((chain) => chain.length <= maxSize)
    .forEach((chain) => {
      const neighboringChains = getAllNeighboringChains(ns, board, chain, allChains);

      const hasWhitePieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.color === "white",
      );
      const hasBlackPieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.color === "black",
      );

      // Record the neighbor chains of the eye candidate empty chain, if all of its neighbors are the same color piece
      if (
        (hasWhitePieceNeighbor && !hasBlackPieceNeighbor && player === "white") ||
        (!hasWhitePieceNeighbor && hasBlackPieceNeighbor && player === "black")
      ) {
        eyeCandidates.push({
          neighbors: neighboringChains,
          chain: chain,
          id: chain[0].chain,
        });
      }
    });

  return eyeCandidates;
}


//function getDisputedTerritoryMoves(board: Board, availableSpaces: PointState[], maxChainSize = 99)
function getDisputedTerritoryMoves(ns, board, availableSpaces, maxChainSize = 99) {
  const chains = getAllChains(ns, board).filter((chain) => chain.length <= maxChainSize);

  return availableSpaces.filter((space) => {
    const chain = chains.find((chain) => chain[0].chain === space.chain) ?? [];
    const playerNeighbors = getAllNeighboringChains(ns, board, chain, chains);
    const hasWhitePieceNeighbor = playerNeighbors.find((neighborChain) => neighborChain[0]?.color === "white");
    const hasBlackPieceNeighbor = playerNeighbors.find((neighborChain) => neighborChain[0]?.color === "black");

    return hasWhitePieceNeighbor && hasBlackPieceNeighbor;
  });
}

/**
 * Finds a move in an open area to expand influence and later build on
 */
//export function getExpansionMoveArray(board: Board, availableSpaces: PointState[]): Move[]
export function getExpansionMoveArray(ns, board, availableSpaces) {
  // Look for any empty spaces fully surrounded by empty spaces to expand into
  const emptySpaces = availableSpaces.filter((space) => {
    const neighbors = findNeighbors(ns, board, space.x, space.y);
    return (
      [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(
        (point) => point && point.color === "empty",
      ).length === 4
    );
  });

  // Once no such empty areas exist anymore, instead expand into any disputed territory
  // to gain a few more points in endgame
  const disputedSpaces = emptySpaces.length ? [] : getDisputedTerritoryMoves(ns, board, availableSpaces, 1);

  const moveOptions = [...emptySpaces, ...disputedSpaces];

  return moveOptions.map((point) => {
    return {
      point: point,
      newLibertyCount: -1,
      oldLibertyCount: -1,
    };
  });
}


/**
 * Finds all moves that would create an eye for the given player.
 *
 * An "eye" is empty point(s) completely surrounded by a single player's connected pieces.
 * If a chain has multiple eyes, it cannot be captured by the opponent (since they can only fill one eye at a time,
 *  and suiciding your own pieces is not legal unless it captures the opponents' first)
 */
//function getEyeCreationMoves(board: Board, player: GoColor, availableSpaces: PointState[], maxLiberties = 99)
function getEyeCreationMoves(ns, board, player, availableSpaces, maxLiberties = 99) {
  const allEyes = getAllEyesByChainId(ns, board, player);
  const currentEyes = getAllEyes(ns, board, player, allEyes);

  const currentLivingGroupIDs = Object.keys(allEyes).filter((chainId) => allEyes[chainId].length >= 2);
  const currentLivingGroupsCount = currentLivingGroupIDs.length;
  const currentEyeCount = currentEyes.filter((eye) => eye.length).length;

  const chains = getAllChains(ns, board);
  const friendlyLiberties = chains
    .filter((chain) => chain[0].color === player)
    .filter((chain) => chain.length > 1)
    .filter((chain) => chain[0].liberties && chain[0].liberties?.length <= maxLiberties)
    .filter((chain) => !currentLivingGroupIDs.includes(chain[0].chain))
    .map((chain) => chain[0].liberties)
    .flat()
    .filter(isNotNullish)
    .filter((point) =>
      availableSpaces.find((availablePoint) => availablePoint.x === point.x && availablePoint.y === point.y),
    )
    .filter((point) => {
      const neighbors = findNeighbors(ns, board, point.x, point.y);
      const neighborhood = [neighbors.north, neighbors.east, neighbors.south, neighbors.west];
      return (
        neighborhood.filter((point) => !point || point?.color === player).length >= 2 &&
        neighborhood.some((point) => point?.color === "empty")
      );
    });

  const eyeCreationMoves = friendlyLiberties.reduce((moveOptions, point) => {
    const evaluationBoard = evaluateMoveResult(ns, board, point.x, point.y, player);
    const newEyes = getAllEyes(ns, evaluationBoard, player);
    const newLivingGroupsCount = newEyes.filter((eye) => eye.length >= 2).length;
    const newEyeCount = newEyes.filter((eye) => eye.length).length;
    const weakestEnemyChain = findEnemyNeighborChainWithFewestLiberties(
      ns,
      board,
      point.x,
      point.y,
      player
    );
    if (
      newLivingGroupsCount > currentLivingGroupsCount ||
      (newEyeCount > currentEyeCount && newLivingGroupsCount === currentLivingGroupsCount)
    ) {
      moveOptions.push({
        point: point,
        chainLength: weakestEnemyChain.length,
        createsLife: newLivingGroupsCount > currentLivingGroupsCount,
      });
    }
    return moveOptions;
  }, []);

  return eyeCreationMoves.sort((moveA, moveB) => +moveB.createsLife - +moveA.createsLife);
}

//function getEyeCreationMove(board: Board, player: GoColor, availableSpaces: PointState[])
function getEyeCreationMove(ns, board, player, availableSpaces) {
  return getEyeCreationMoves(ns, board, player, availableSpaces);
}

/**
 * Create a new evaluation board and play out the results of the given move on the new board
 * @returns the evaluation board
 */
//export function evaluateMoveResult(board: Board, x: number, y: number, player: GoColor, resetChains = false): Board
export function evaluateMoveResult(ns, board, x, y, player, resetChains = false) {
  const evaluationBoard = getBoardCopy(ns, board);
  const point = evaluationBoard[x]?.[y];
  if (!point) return board;

  point.color = player;

  const neighbors = getArrayFromNeighbor(ns, findNeighbors(ns, board, x, y));
  const chainIdsToUpdate = [point.chain, ...neighbors.map((point) => point.chain)];
  resetChainsById(ns, evaluationBoard, chainIdsToUpdate);
  updateCaptures(ns, evaluationBoard, player, resetChains);
  return evaluationBoard;
}

/**
  Clear the chain and liberty data of all points in the given chains
 */
//const resetChainsById = (board: Board, chainIds: string[])
const resetChainsById = (ns, board, chainIds) => {
  for (const column of board) {
    for (const point of column) {
      if (!point || !chainIds.includes(point.chain)) continue;
      point.chain = "";
      point.liberties = [];
    }
  }
};


/**
 * Assign each point on the board a chain ID, and link its list of 'liberties' (which are empty spaces
 * adjacent to some point on the chain including the current point).
 *
 * Then, remove any chains with no liberties.
 * Modifies the board in place.
 */
//export function updateCaptures(board: Board, playerWhoMoved: GoColor, resetChains = true): void
export function updateCaptures(ns, board, playerWhoMoved, resetChains = true) {
  updateChains(ns, board, resetChains);
  const chains = getAllChains(ns, board);

  const chainsToCapture = findAllCapturedChains(ns, chains, playerWhoMoved);
  if (!chainsToCapture?.length) {
    return;
  }

  chainsToCapture?.forEach((chain) => captureChain(ns, chain));
  updateChains(ns, board);
}

/**
 * Find any group of stones with no liberties (who therefore are to be removed from the board)
 */
//export function findAllCapturedChains(chainList: PointState[][], playerWhoMoved: GoColor)
export function findAllCapturedChains(ns, chainList, playerWhoMoved) {
  const opposingPlayer = playerWhoMoved === "white" ? "black" : "white";
  const enemyChainsToCapture = findCapturedChainOfColor(ns, chainList, opposingPlayer);

  if (enemyChainsToCapture.length) {
    return enemyChainsToCapture;
  }

  const friendlyChainsToCapture = findCapturedChainOfColor(ns, chainList, playerWhoMoved);
  if (friendlyChainsToCapture.length) {
    return friendlyChainsToCapture;
  }
}

//function findCapturedChainOfColor(chainList: PointState[][], playerColor: GoColor)
function findCapturedChainOfColor(ns, chainList, playerColor) {
  return chainList.filter((chain) => chain?.[0].color === playerColor && chain?.[0].liberties?.length === 0);
}


/**
 * Removes a chain from the board, after being captured
 */
//function captureChain(chain: PointState[])
function captureChain(ns, chain) {
  chain.forEach((point) => {
    point.color = "empty";
    point.chain = "";
    point.liberties = [];
  });
}


/**
 * If there is only one move that would create two eyes for the opponent, it should be blocked if possible
 */
//function getEyeBlockingMove(board: Board, player: GoColor, availablePoints: PointState[])
function getEyeBlockingMove2(ns, board, player, availablePoints) {
  const opposingPlayer = player === "white" ? "black" : "white";
  const opponentEyeMoves = getEyeCreationMoves(ns, board, opposingPlayer, availablePoints, 5);
  const twoEyeMoves = opponentEyeMoves.filter((move) => move.createsLife);

  return twoEyeMoves;
}

/**
 * If there is only one move that would create two eyes for the opponent, it should be blocked if possible
 */
//function getEyeBlockingMove(board: Board, player: GoColor, availablePoints: PointState[])
function getEyeBlockingMove1(ns, board, player, availablePoints) {
  const opposingPlayer = player === "white" ? "black" : "white";
  const opponentEyeMoves = getEyeCreationMoves(ns, board, opposingPlayer, availablePoints, 5);
  const oneEyeMoves = opponentEyeMoves.filter((move) => !move.createsLife);

  return oneEyeMoves;
}


export const threeByThreePatterns = [
  // 3x3 piece patterns; X,O are color pieces; x,o are any state except the opposite color piece;
  // " " is off the edge of the board; "?" is any state (even off the board)
  [
    "XOX", // hane pattern - enclosing hane
    "...",
    "???",
  ],
  [
    "XO.", // hane pattern - non-cutting hane
    "...",
    "?.?",
  ],
  [
    "XO?", // hane pattern - magari
    "X..",
    "o.?",
  ],
  [
    ".O.", // generic pattern - katatsuke or diagonal attachment; similar to magari
    "X..",
    "...",
  ],
  [
    "XO?", // cut1 pattern (kiri] - unprotected cut
    "O.x",
    "?x?",
  ],
  [
    "XO?", // cut1 pattern (kiri] - peeped cut
    "O.X",
    "???",
  ],
  [
    "?X?", // cut2 pattern (de]
    "O.O",
    "xxx",
  ],
  [
    "OX?", // cut keima
    "x.O",
    "???",
  ],
  [
    "X.?", // side pattern - chase
    "O.?",
    "   ",
  ],
  [
    "OX?", // side pattern - block side cut
    "X.O",
    "   ",
  ],
  [
    "?X?", // side pattern - block side connection
    "o.O",
    "   ",
  ],
  [
    "?XO", // side pattern - sagari
    "o.o",
    "   ",
  ],
  [
    "?OX", // side pattern - cut
    "X.O",
    "   ",
  ],
];

/**
 * Searches the board for any point that matches the expanded pattern set
 */
/*export async function findAnyMatchedPatterns(
  board: Board,
  player: GoColor,
  availableSpaces: PointState[],
  smart = true,
  rng: number,
)*/
export async function findAnyMatchedPatterns(
  ns,
  board,
  player,
  availableSpaces,
  smart = true,
) {
  const boardSize = board[0].length;
  const patterns = expandAllThreeByThreePatterns();
  const moves = [];
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const neighborhood = getNeighborhood(ns, board, x, y);
      const matchedPattern = patterns.find((pattern) => checkMatch(ns, neighborhood, pattern, player));

      if (
        matchedPattern &&
        availableSpaces.find((availablePoint) => availablePoint.x === x && availablePoint.y === y) &&
        (!smart || findEffectiveLibertiesOfNewMove(ns, board, x, y, player).length > 1)
      ) {
        moves.push(board[x][y]);
      }
    }
    await ns.sleep(10);
  }
  return moves || [];
}

/**
 * Finds all variations of the pattern list, by expanding it using rotation and mirroring
 */
function expandAllThreeByThreePatterns() {
  const rotatedPatterns = [
    ...threeByThreePatterns,
    ...threeByThreePatterns.map(rotate90Degrees),
    ...threeByThreePatterns.map(rotate90Degrees).map(rotate90Degrees),
    ...threeByThreePatterns.map(rotate90Degrees).map(rotate90Degrees).map(rotate90Degrees),
  ];
  const mirroredPatterns = [...rotatedPatterns, ...rotatedPatterns.map(verticalMirror)];
  return [...mirroredPatterns, ...mirroredPatterns.map(horizontalMirror)];
}

function rotate90Degrees(pattern) {
  return [
    `${pattern[2][0]}${pattern[1][0]}${pattern[0][0]}`,
    `${pattern[2][1]}${pattern[1][1]}${pattern[0][1]}`,
    `${pattern[2][2]}${pattern[1][2]}${pattern[0][2]}`,
  ];
}

function verticalMirror(pattern) {
  return [pattern[2], pattern[1], pattern[0]];
}

function horizontalMirror(pattern) {
  return [
    pattern[0].split("").reverse().join(),
    pattern[1].split("").reverse().join(),
    pattern[2].split("").reverse().join(),
  ];
}
/**
 * Gets the 8 points adjacent and diagonally adjacent to the given point
 */
//function getNeighborhood(board: Board, x: number, y: number)
function getNeighborhood(ns, board, x, y) {
  return [
    [board[x - 1]?.[y - 1], board[x - 1]?.[y], board[x - 1]?.[y + 1]],
    [board[x]?.[y - 1], board[x]?.[y], board[x]?.[y + 1]],
    [board[x + 1]?.[y - 1], board[x + 1]?.[y], board[x + 1]?.[y + 1]],
  ];
}

/**
  Returns false if any point does not match the pattern, and true if it matches fully.
 */
//function checkMatch(neighborhood: (PointState | null)[][], pattern: string[], player: GoColor)
function checkMatch(ns, neighborhood, pattern, player) {
  const patternArr = pattern.join("").split("");
  const neighborhoodArray = neighborhood.flat();
  return patternArr.every((str, index) => matches(ns, str, neighborhoodArray[index], player));
}

/**
 * @returns true if the given point matches the given string representation, false otherwise
 *
 * Capital X and O only match stones of that color
 * lowercase x and o match stones of that color, or empty space, or the edge of the board
 * a period "." only matches empty nodes
 * A space " " only matches the edge of the board
 * question mark "?" matches anything
 */
//function matches(stringPoint: string, point: PointState | null, player: GoColor)
function matches(ns, stringPoint, point, player) {
  const opponent = player === "white" ? "black" : "white";
  switch (stringPoint) {
    case "X": {
      return point?.color === player;
    }
    case "O": {
      return point?.color === opponent;
    }
    case "x": {
      return point?.color !== opponent;
    }
    case "o": {
      return point?.color !== player;
    }
    case ".": {
      return point?.color === "empty";
    }
    case " ": {
      return point === null;
    }
    case "?": {
      return true;
    }
  }
}

/**
 * For a potential move, determine what the liberty of the point would be if played, by looking at adjacent empty nodes
 * as well as the remaining liberties of neighboring friendly chains
 */
//export function findEffectiveLibertiesOfNewMove(board: Board, x: number, y: number, player: GoColor)
export function findEffectiveLibertiesOfNewMove(ns, board, x, y, player) {
  const friendlyChains = getAllChains(ns, board).filter((chain) => chain[0].color === player);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(ns, board, x, y, player);
  const neighborPoints = [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(isNotNullish);
  // Get all chains that the new move will connect to
  const allyNeighbors = neighborPoints.filter((neighbor) => neighbor.color === player);
  const allyNeighborChainLiberties = allyNeighbors
    .map((neighbor) => {
      const chain = friendlyChains.find((chain) => chain[0].chain === neighbor.chain);
      return chain?.[0]?.liberties ?? null;
    })
    .flat()
    .filter(isNotNullish);

  // Get all empty spaces that the new move connects to that aren't already part of friendly liberties
  const directLiberties = neighborPoints.filter((neighbor) => neighbor.color === "empty");

  const allLiberties = [...directLiberties, ...allyNeighborChainLiberties];

  // filter out duplicates, and starting point
  return allLiberties
    .filter(
      (liberty, index) =>
        allLiberties.findIndex((neighbor) => liberty.x === neighbor.x && liberty.y === neighbor.y) === index,
    )
    .filter((liberty) => liberty.x !== x || liberty.y !== y);
}


/**
 * Returns an object that includes which of the cardinal neighbors are either empty or contain the
 * current player's pieces. Used for making the connection map on the board
 */
/*
export function findAdjacentLibertiesAndAlliesForPoint(
  board: Board,
  x: number,
  y: number,
  _player?: GoColor,
): Neighbor*/
export function findAdjacentLibertiesAndAlliesForPoint(
  ns,
  board,
  x,
  y,
  _player,
) {
  const currentPoint = board[x]?.[y];
  const player = _player || (!currentPoint || currentPoint.color === "empty" ? undefined : currentPoint.color);
  const adjacentLiberties = findAdjacentLibertiesForPoint(ns, board, x, y);
  const neighbors = findNeighbors(ns, board, x, y);

  return {
    north: adjacentLiberties.north || neighbors.north?.color === player ? neighbors.north : null,
    east: adjacentLiberties.east || neighbors.east?.color === player ? neighbors.east : null,
    south: adjacentLiberties.south || neighbors.south?.color === player ? neighbors.south : null,
    west: adjacentLiberties.west || neighbors.west?.color === player ? neighbors.west : null,
  };
}

/**
 * Returns an object that includes which of the cardinal neighbors are empty
 * (adjacent 'liberties' of the current piece )
 */
//export function findAdjacentLibertiesForPoint(board: Board, x: number, y: number): Neighbor
export function findAdjacentLibertiesForPoint(ns, board, x, y) {
  const neighbors = findNeighbors(ns, board, x, y);

  const hasNorthLiberty = neighbors.north && neighbors.north.color === "empty";
  const hasEastLiberty = neighbors.east && neighbors.east.color === "empty";
  const hasSouthLiberty = neighbors.south && neighbors.south.color === "empty";
  const hasWestLiberty = neighbors.west && neighbors.west.color === "empty";

  return {
    north: hasNorthLiberty ? neighbors.north : null,
    east: hasEastLiberty ? neighbors.east : null,
    south: hasSouthLiberty ? neighbors.south : null,
    west: hasWestLiberty ? neighbors.west : null,
  };
}


/**
 * Finds all moves that increases the liberties of the player's pieces, making them harder to capture and occupy more space on the board.
 */
//function getLibertyGrowthMoves(board: Board, player: GoColor, availableSpaces: PointState[])
function getLibertyGrowthMoves(ns, board, player, availableSpaces) {
  const friendlyChains = getAllChains(ns, board).filter((chain) => chain[0].color === player);

  if (!friendlyChains.length) {
    return [];
  }

  // Get all liberties of friendly chains as potential growth move options
  const liberties = friendlyChains
    .map((chain) =>
      chain[0].liberties?.filter(isNotNullish).map((liberty) => ({
        libertyPoint: liberty,
        oldLibertyCount: chain[0].liberties?.length,
      })),
    )
    .flat()
    .filter(isNotNullish)
    .filter((liberty) =>
      availableSpaces.find((point) => liberty.libertyPoint.x === point.x && liberty.libertyPoint.y === point.y),
    );

  // Find a liberty where playing a piece increases the liberty of the chain (aka expands or defends the chain)
  return liberties
    .map((liberty) => {
      const move = liberty.libertyPoint;

      const newLibertyCount = findEffectiveLibertiesOfNewMove(ns, board, move.x, move.y, player).length;

      // Get the smallest liberty count of connected chains to represent the old state
      const oldLibertyCount = findMinLibertyCountOfAdjacentChains(ns, board, move.x, move.y, player);

      const chainLength = findEnemyNeighborChainWithFewestLiberties(ns, board, move.x, move.y, player).length


      return {
        point: move,
        chainLength: chainLength,
        oldLibertyCount: oldLibertyCount,
        newLibertyCount: newLibertyCount,
      };
    })
    .filter((move) => move.newLibertyCount > 1 && move.newLibertyCount >= move.oldLibertyCount);
}

/**
 * Find the number of open spaces that are connected to chains adjacent to a given point, and return the minimum
 */
//export function findMinLibertyCountOfAdjacentChains(board: Board, x: number, y: number, player: GoColor)
export function findMinLibertyCountOfAdjacentChains(ns, board, x, y, player) {
  const chain = findEnemyNeighborChainWithFewestLiberties(ns, board, x, y, player);
  return chain?.[0]?.liberties?.length ?? 99;
}

//export function findEnemyNeighborChainWithFewestLiberties(board: Board, x: number, y: number, player: GoColor)
export function findEnemyNeighborChainWithFewestLiberties(ns, board, x, y, player) {
  const chains = getAllChains(ns, board);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(ns, board, x, y, player);
  const friendlyNeighbors = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNullish)
    .filter((neighbor) => neighbor.color === player);

  const minimumLiberties = friendlyNeighbors.reduce(
    (min, neighbor) => Math.min(min, neighbor?.liberties?.length ?? 0),
    friendlyNeighbors?.[0]?.liberties?.length ?? 99,
  );

  const chainId = friendlyNeighbors.find((neighbor) => neighbor?.liberties?.length === minimumLiberties)?.chain;
  return chains.find((chain) => chain[0].chain === chainId);
}


/**
 * Select a move from the list of open-area moves
 */
//function getExpansionMove(board: Board, availableSpaces: PointState[], rng: number, moveArray?: Move[])
function getExpansionMove(ns, board, availableSpaces, moveArray) {
  const moveOptions = moveArray ?? getExpansionMoveArray(ns, board, availableSpaces);
  return moveOptions;
}


/**
 * Get a move in open space that is nearby a friendly piece
 */
//function getJumpMove(board: Board, player: GoColor, availableSpaces: PointState[], rng: number, moveArray?: Move[])
function getJumpMove(ns, board, player, availableSpaces, moveArray) {
  const moveOptions = (moveArray ?? getExpansionMoveArray(ns, board, availableSpaces)).filter(({ point }) =>
    [
      board[point.x]?.[point.y + 2],
      board[point.x + 2]?.[point.y],
      board[point.x]?.[point.y - 2],
      board[point.x - 2]?.[point.y],
    ].some((point) => point?.color === player),
  );

  return moveOptions;
}

/**
 * Find a move that specifically increases a chain's liberties from 1 to more than 1, preventing capture
 */
//function getDefendMove(board: Board, player: GoColor, availableSpaces: PointState[])
function getDefendMove(ns, board, player, availableSpaces) {
  const growthMoves = getLibertyGrowthMoves(ns, board, player, availableSpaces);
  const libertyIncreases =
    growthMoves?.filter((move) => move.newLibertyCount > move.oldLibertyCount) ?? [];

  return libertyIncreases;
}

/**
 * Find a move that reduces the opponent's liberties as much as possible,
 *   capturing (or making it easier to capture) their pieces
 */
//function getSurroundMove(board: Board, player: GoColor, availableSpaces: PointState[], smart = true)
function getSurroundMove(ns, board, player, availableSpaces, smart = true) {
  const opposingPlayer = player === "black" ? "white" : "black";
  const enemyChains = getAllChains(ns, board).filter((chain) => chain[0].color === opposingPlayer);

  if (!enemyChains.length || !availableSpaces.length) {
    return null;
  }

  const enemyLiberties = enemyChains
    .map((chain) => chain[0].liberties)
    .flat()
    .filter((liberty) => availableSpaces.find((point) => liberty?.x === point.x && liberty?.y === point.y))
    .filter(isNotNullish);

  const captureMoves = [];
  const atariMoves = [];
  const surroundMoves = [];

  enemyLiberties.forEach((move) => {
    const newLibertyCount = findEffectiveLibertiesOfNewMove(ns, board, move.x, move.y, player).length;

    const weakestEnemyChain = findEnemyNeighborChainWithFewestLiberties(
      ns,
      board,
      move.x,
      move.y,
      player === "black" ? "white" : "black",
    );
    const weakestEnemyChainLength = weakestEnemyChain?.length ?? 99;

    const enemyChainLibertyCount = weakestEnemyChain?.[0]?.liberties?.length ?? 99;

    const enemyLibertyGroups = [
      ...(weakestEnemyChain?.[0]?.liberties ?? []).reduce(
        (chainIDs, point) => chainIDs.add(point?.chain ?? ""),
        new Set(),
      ),
    ];

    // Do not suggest moves that do not capture anything and let your opponent immediately capture
    if (newLibertyCount <= 2 && enemyChainLibertyCount > 2) {
      return;
    }

    // If a neighboring enemy chain has only one liberty, the current move suggestion will capture
    if (enemyChainLibertyCount <= 1) {
      captureMoves.push({
        point: move,
        chainLength: weakestEnemyChainLength,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }

    // If the move puts the enemy chain in threat of capture, it forces the opponent to respond.
    // Only do this if your piece cannot be captured, or if the enemy group is surrounded and vulnerable to losing its only interior space
    else if (
      enemyChainLibertyCount === 2 &&
      (newLibertyCount >= 2 || (enemyLibertyGroups.length === 1 && weakestEnemyChainLength > 3) || !smart)
    ) {
      atariMoves.push({
        point: move,
        chainLength: weakestEnemyChainLength,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }

    // If the move will not immediately get re-captured, and limit's the opponent's liberties
    else if (newLibertyCount >= 2) {
      surroundMoves.push({
        point: move,
        chainLength: weakestEnemyChainLength,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }
  });
  return [...captureMoves, ...atariMoves, ...surroundMoves];
}


/**
 * Get a move that places a piece to influence (and later control) a corner
 */
//function getCornerMove(board: Board)
function getCornerMove(ns, board) {
  const boardEdge = board[0].length - 1;
  const cornerMax = boardEdge - 2;
  const corners = []
  if (isCornerAvailableForMove(ns, board, cornerMax, cornerMax, boardEdge, boardEdge)) {
    corners.push(board[cornerMax][cornerMax]);
  }
  if (isCornerAvailableForMove(ns, board, 0, cornerMax, 2, boardEdge)) {
    corners.push(board[2][cornerMax]);
  }
  if (isCornerAvailableForMove(ns, board, 0, 0, 2, 2)) {
    corners.push(board[2][2]);
  }
  if (isCornerAvailableForMove(ns, board, cornerMax, 0, boardEdge, 2)) {
    corners.push(board[cornerMax][2]);
  }

  return corners;
}

/**
 * Find all non-offline nodes in a given area
 */
//function findLiveNodesInArea(board: Board, x1: number, y1: number, x2: number, y2: number)
function findLiveNodesInArea(ns, board, x1, y1, x2, y2) {
  const foundPoints = [];
  board.forEach((column) =>
    column.forEach(
      (point) => point && point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2 && foundPoints.push(point),
    ),
  );
  return foundPoints;
}

/**
 * Determine if a corner is largely intact and currently empty, and thus a good target for corner takeover moves
 */
//function isCornerAvailableForMove(board: Board, x1: number, y1: number, x2: number, y2: number)
function isCornerAvailableForMove(ns, board, x1, y1, x2, y2) {
  const foundPoints = findLiveNodesInArea(ns, board, x1, y1, x2, y2);
  const foundPieces = foundPoints.filter((point) => point.color !== "empty");
  return foundPoints.length >= 7 ? foundPieces.length === 0 : false;
}


/**
 * First prioritizes capturing of opponent pieces.
 * Then, preventing capture of their own pieces.
 * Then, matching any of the predefined local patterns indicating a strong move
 * Then, creating "eyes" to solidify their control over the board
 * Then, finding opportunities to capture on their next move
 * Then, blocking the opponent's attempts to create eyes
 * Finally, will look for corner/jump/surround/other moves.
 */
async function getPriorityMove(ns, moves) {
  const scores = []
  const boardLength = ns.go.getBoardState().length
  for (let x = 0; x < boardLength; x++) {
    scores[x] = []
    for (let y = 0; y < boardLength; y++) {
      scores[x][y] = {x,y,score:0}
    }
  }

  const surrounds = moves.surround()
  if (surrounds?.length > 0) {
    for (const move of surrounds) {
      if (move.newLibertyCount === 0) { //capture move
        scores[move.point.x][move.point.y].score += 17.013 + move.chainLength / boardLength
      }
      else if (move.newLibertyCount === 1) {
        scores[move.point.x][move.point.y].score += 6.008 + move.chainLength / boardLength
      }
      else if (move.newLibertyCount === 2) {
        scores[move.point.x][move.point.y].score += 2.004 + move.chainLength / boardLength
      }
      else {
        scores[move.point.x][move.point.y].score += move.chainLength / boardLength
      }
    }
  }

  const defends = moves.defend()
  if (defends?.length > 0) {
    for (const move of defends) {
      if (move.oldLibertyCount === 1) { //defend capture
        scores[move.point.x][move.point.y].score += 16.012 + (move.newLibertyCount - move.oldLibertyCount) + move.chainLength / boardLength
      }
      else if (move.oldLibertyCount === 2) {
        scores[move.point.x][move.point.y].score += 0.503 + (move.newLibertyCount - move.oldLibertyCount) + move.chainLength / boardLength
      }
      else if (!moves.endGameAvailable) { //growth
        scores[move.point.x][move.point.y].score += 0.001 + (move.newLibertyCount - move.oldLibertyCount) / 4 + move.chainLength / boardLength
      }

    }
  }

  const patterns = await moves.pattern()
  if (patterns?.length > 0) {
    for (const point of patterns) {
      scores[point.x][point.y].score += 8.011
    }
  }

  const eyeMoves = moves.eyeMove()
  if (eyeMoves?.length > 0) {
    for (const move of eyeMoves) {
      scores[move.point.x][move.point.y].score += 7.01 + move.chainLength / boardLength
    }
  }

  const eyeBlock2s = moves.eyeBlock2()
  const eyeBlock1s = moves.eyeBlock1()

  if (eyeBlock2s?.length > 0) {
    let baseScore
    if (eyeBlock2s?.length  % 2 === 1) { baseScore = 7.009 }
    else if ((eyeBlock2s?.length + eyeBlock1s?.length)  % 2 === 1) { baseScore = 6.009 }
    else { baseScore = 2.509 }
    for (const move of eyeBlock2s) {
      scores[move.point.x][move.point.y].score += baseScore + move.chainLength / boardLength
    }
  }

  if (eyeBlock1s?.length > 0) {
    let baseScore
    if ((eyeBlock2s?.length + eyeBlock1s?.length) % 2 === 1) { baseScore = 6.007 }
    else { baseScore = 1.507 }
    for (const move of eyeBlock1s) {
      scores[move.point.x][move.point.y].score += baseScore + move.chainLength / boardLength
    }
  }

  const corners = moves.corner()
  if (corners?.length > 0) {
    for (const point of corners) {
      scores[point.x][point.y].score += 3.006
    }
  }

  const jumps = moves.jump()
  if (jumps?.length > 0) {
    for (const move of jumps) {
      scores[move.point.x][move.point.y].score += 3.005
    }
  }

  const expansions = moves.expansion()
  if (expansions?.length > 0) {
    for (const move of expansions) {
      if (scores[move.point.x][move.point.y].score === 0) { scores[move.point.x][move.point.y].score += 1.502 }
    }
  }


  for (let x = 0; x < boardLength; x++) {
    for (let y = 0; y < boardLength; y++) {
      if (scores[x][y].score > 0) {
        scores[x][y].score += Math.random() * 0.001
      }
    }
  }

  const result = [].concat(...scores);

  return result;
}
