import * as migration_20261008_181219_initial from './20261008_181219_initial'

export const migrations = [
  {
    up: migration_20261008_181219_initial.up,
    down: migration_20261008_181219_initial.down,
    name: '20261008_181219_initial',
  },
]
