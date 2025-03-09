import { NS } from "@ns"

export enum CurrentTurn {
  Inactive = 1,
  Black = 2,
  White = 3,
}

export function getCurrentTurn(ns : NS) : CurrentTurn {
  const turnString = ns.go.getCurrentPlayer()
  if (turnString === "White") {
    return CurrentTurn.White
  } else if (turnString === "Black") {
    return CurrentTurn.Black
  } else {
    return CurrentTurn.Inactive
  }
}
