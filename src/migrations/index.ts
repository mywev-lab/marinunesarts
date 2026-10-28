import * as migration_20261028_204502_initial from './20261028_204502_initial';
import * as migration_20261028_214849_storage_fields from './20261028_214849_storage_fields';

export const migrations = [
  {
    up: migration_20261028_204502_initial.up,
    down: migration_20261028_204502_initial.down,
    name: '20261028_204502_initial',
  },
  {
    up: migration_20261028_214849_storage_fields.up,
    down: migration_20261028_214849_storage_fields.down,
    name: '20261028_214849_storage_fields'
  },
];
