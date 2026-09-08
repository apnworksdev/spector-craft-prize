import * as migration_20260907_134303 from './20260907_134303';
import * as migration_20260908_113451_terms_and_privacy from './20260908_113451_terms_and_privacy';

export const migrations = [
  {
    up: migration_20260907_134303.up,
    down: migration_20260907_134303.down,
    name: '20260907_134303',
  },
  {
    up: migration_20260908_113451_terms_and_privacy.up,
    down: migration_20260908_113451_terms_and_privacy.down,
    name: '20260908_113451_terms_and_privacy'
  },
];
