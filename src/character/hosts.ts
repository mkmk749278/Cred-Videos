import type {HostConfig} from './RaviHost';

/**
 * Ravi's direction per module (index 0..12). Cue strings are exact narration phrases.
 * The bridge window (title card) is added automatically by SceneShell for bridge modules.
 */
export const HOSTS: Record<number, HostConfig> = {
  1: {
    stress: ['crime', 'fear', 'contract', 'civil', 'arrest', 'cheating'],
    beats: [
      {at: 0, pose: 'down', mood: 'neutral'},
      {at: 'So, debt is not', pose: 'palm', mood: 'explaining'},
      {at: 'make you feel like a criminal', pose: 'crossed', mood: 'worried', tilt: -3},
      {at: 'Fear', pose: 'scratch', mood: 'confused', prop: 'question', tilt: 5},
      {at: 'just a contract', pose: 'chin', mood: 'thinking', prop: 'bulb'},
      {at: 'no rule to arrest you', pose: 'thumbsUp', mood: 'relieved', prop: 'sparkle'},
      {at: 'Police are not', pose: 'point', mood: 'angry', prop: 'anger'},
    ],
    windows: [
      {from: 'Fear', to: {phrase: 'Scary, right', offset: 30}, dock: 'right'},
      {from: 'Indian criminal law', to: {phrase: "couldn't pay", offset: 40}, dock: 'right'},
    ],
  },
};
