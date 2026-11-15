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
import * as migration_20261114_120000_sobre_novo_texto from './20261114_120000_sobre_novo_texto';
import * as migration_20261114_130000_inicio_resumo_sobre from './20261114_130000_inicio_resumo_sobre';
import * as migration_20261114_194348_filtro_releituras from './20261114_194348_filtro_releituras';
import * as migration_20261114_200000_releituras from './20261114_200000_releituras';
import * as migration_20261114_210000_roda_gigante from './20261114_210000_roda_gigante';
import * as migration_20261115_120000_inicio_colecoes from './20261115_120000_inicio_colecoes';

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
  {
    up: migration_20261114_120000_sobre_novo_texto.up,
    down: migration_20261114_120000_sobre_novo_texto.down,
    name: '20261114_120000_sobre_novo_texto',
  },
  {
    up: migration_20261114_130000_inicio_resumo_sobre.up,
    down: migration_20261114_130000_inicio_resumo_sobre.down,
    name: '20261114_130000_inicio_resumo_sobre',
  },
  {
    up: migration_20261114_194348_filtro_releituras.up,
    down: migration_20261114_194348_filtro_releituras.down,
    name: '20261114_194348_filtro_releituras',
  },
  {
    up: migration_20261114_200000_releituras.up,
    down: migration_20261114_200000_releituras.down,
    name: '20261114_200000_releituras',
  },
  {
    up: migration_20261114_210000_roda_gigante.up,
    down: migration_20261114_210000_roda_gigante.down,
    name: '20261114_210000_roda_gigante',
  },
  {
    up: migration_20261115_120000_inicio_colecoes.up,
    down: migration_20261115_120000_inicio_colecoes.down,
    name: '20261115_120000_inicio_colecoes',
  },
];
