import * as migration_20261028_204502_initial from './20261028_204502_initial';
import * as migration_20261028_214849_storage_fields from './20261028_214849_storage_fields';
import * as migration_20261108_210522_produtos_prints from './20261108_210522_produtos_prints';
import * as migration_20261108_220000_efugio_atelier from './20261108_220000_efugio_atelier';

export const migrations = [
  {
    up: migration_20261028_204502_initial.up,
    down: migration_20261028_204502_initial.down,
    name: '20261028_204502_initial',
  },
  {
    up: migration_20261028_214849_storage_fields.up,
    down: migration_20261028_214849_storage_fields.down,
    name: '20261028_214849_storage_fields',
  },
  {
    up: migration_20261108_210522_produtos_prints.up,
    down: migration_20261108_210522_produtos_prints.down,
    name: '20261108_210522_produtos_prints'
  },
  {
    up: migration_20261108_220000_efugio_atelier.up,
    down: migration_20261108_220000_efugio_atelier.down,
    name: '20261108_220000_efugio_atelier',
  },
];
