import * as migration_20261008_181219_initial from './20261008_181219_initial';
import * as migration_20261017_093450_press_card_visibility from './20261017_093450_press_card_visibility';
import * as migration_20261017_094813_people_drag_order from './20261017_094813_people_drag_order';
import * as migration_20261021_090136_media_storage_prefix from './20261021_090136_media_storage_prefix';

export const migrations = [
  {
    up: migration_20261008_181219_initial.up,
    down: migration_20261008_181219_initial.down,
    name: '20261008_181219_initial',
  },
  {
    up: migration_20261017_093450_press_card_visibility.up,
    down: migration_20261017_093450_press_card_visibility.down,
    name: '20261017_093450_press_card_visibility',
  },
  {
    up: migration_20261017_094813_people_drag_order.up,
    down: migration_20261017_094813_people_drag_order.down,
    name: '20261017_094813_people_drag_order',
  },
  {
    up: migration_20261021_090136_media_storage_prefix.up,
    down: migration_20261021_090136_media_storage_prefix.down,
    name: '20261021_090136_media_storage_prefix'
  },
];
