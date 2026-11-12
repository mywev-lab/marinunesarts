import * as migration_20261028_204502_initial from './20261028_204502_initial';
import * as migration_20261028_214849_storage_fields from './20261028_214849_storage_fields';
import * as migration_20261108_210522_produtos_prints from './20261108_210522_produtos_prints';
import * as migration_20261108_220000_efugio_atelier from './20261108_220000_efugio_atelier';
import * as migration_20261109_150000_dominio_efugio from './20261109_150000_dominio_efugio';
import * as migration_20261110_200000_dominio_sem_www from './20261110_200000_dominio_sem_www';
import * as migration_20261110_204856_aviso_cookies from './20261110_204856_aviso_cookies';
import * as migration_20261112_152441_idiomas_pt_en from './20261112_152441_idiomas_pt_en';
import * as migration_20261112_160000_conteudo_en from './20261112_160000_conteudo_en';
import * as migration_20261112_190000_prints_de_todas_as_obras from './20261112_190000_prints_de_todas_as_obras';

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
    name: '20261108_210522_produtos_prints',
  },
  {
    up: migration_20261108_220000_efugio_atelier.up,
    down: migration_20261108_220000_efugio_atelier.down,
    name: '20261108_220000_efugio_atelier',
  },
  {
    up: migration_20261109_150000_dominio_efugio.up,
    down: migration_20261109_150000_dominio_efugio.down,
    name: '20261109_150000_dominio_efugio',
  },
  {
    up: migration_20261110_200000_dominio_sem_www.up,
    down: migration_20261110_200000_dominio_sem_www.down,
    name: '20261110_200000_dominio_sem_www',
  },
  {
    up: migration_20261110_204856_aviso_cookies.up,
    down: migration_20261110_204856_aviso_cookies.down,
    name: '20261110_204856_aviso_cookies',
  },
  {
    up: migration_20261112_152441_idiomas_pt_en.up,
    down: migration_20261112_152441_idiomas_pt_en.down,
    name: '20261112_152441_idiomas_pt_en',
  },
  {
    up: migration_20261112_160000_conteudo_en.up,
    down: migration_20261112_160000_conteudo_en.down,
    name: '20261112_160000_conteudo_en',
  },
  {
    up: migration_20261112_190000_prints_de_todas_as_obras.up,
    down: migration_20261112_190000_prints_de_todas_as_obras.down,
    name: '20261112_190000_prints_de_todas_as_obras',
  },
];
