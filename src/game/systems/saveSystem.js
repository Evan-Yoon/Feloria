/**
 * saveSystem.js - Handles local storage serialization for game state.
 */
export const saveSystem = {
    saveGame: (data) => {
        localStorage.setItem('feloria_save', JSON.stringify(data));
    },
    loadGame: () => {
        const data = localStorage.getItem('feloria_save');
        return data ? JSON.parse(data) : null;
    }
};
