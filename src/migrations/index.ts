import * as migration_20261008_181219_initial from './20261008_181219_initial';
import * as migration_20261017_093450_press_card_visibility from './20261017_093450_press_card_visibility';

export const migrations = [
  {
    up: migration_20261008_181219_initial.up,
    down: migration_20261008_181219_initial.down,
    name: '20261008_181219_initial',
  },
  {
    up: migration_20261017_093450_press_card_visibility.up,
    down: migration_20261017_093450_press_card_visibility.down,
    name: '20261017_093450_press_card_visibility'
  },
];
