
export type SoundEvent = 
  | 'game-start'
  | 'game-end'
  | 'capture'
  | 'castle'
  | 'move'
  | 'move-check'
  | 'promote'
  | 'illegal';

const soundMap: Record<SoundEvent, string> = {
    'game-start': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3',
    'game-end': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
    'capture': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
    'castle': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3',
    'move': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
    'move-check': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
    'promote': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3',
    'illegal': 'http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3',
};


export function playSound(event: SoundEvent) {
  try {
    const audio = new Audio(soundMap[event]);
    audio.play().catch(error => {
      // Autoplay was prevented.
      console.warn(`Could not play sound for event '${event}':`, error);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}
