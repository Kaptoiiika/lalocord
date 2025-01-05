import { create, StateCreator } from "zustand"
import {  TicTacToeSchema } from "../types/TicTacToe"
import { checkFieldIsWinnig, createNewBoard } from "../utils/TicTacToeUtilts"


const store: StateCreator<TicTacToeSchema> = (set, get) => ({
  board: createNewBoard(),
  activePlayer: "cross",
  currentPlayer: "cross",
  isMultiplayer: false,

  doPlayerMove(fieldId,ceilId, player) {
    const { board, currentPlayer,isMultiplayer } = get()
    if (fieldId > 8 || ceilId > 8) return
    if (board[fieldId][ceilId] !== null) return

    const newBoard = [...board]
    newBoard[fieldId][ceilId] = player
    const newActivePlayer = player === "circle" ? "cross" : "circle"
    
    if(checkFieldIsWinnig(newBoard[fieldId])) {
      console.log(`winner ${player}`)
      newBoard[fieldId][9] = player
    }
    
    set((state) => ({
      ...state,
      board: newBoard,
      activePlayer: newActivePlayer,
      currentPlayer: isMultiplayer ? currentPlayer : newActivePlayer
    }))
  },

  startGame(isMultiplayer = false) {
    set((state) => ({
      ...state,
      board: createNewBoard(),
      activePlayer: "cross",
      currentPlayer: "cross",
      isMultiplayer: isMultiplayer,
    }))
  },
})

export const useTicTacToeStore = create(store)
