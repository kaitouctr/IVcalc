//! SPDX-License-Identifier: AGPL-3.0-only
/*
 *  This file is a part of IVcalc.
 *  Copyright 2024 Luong Truong
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, version 3.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';

export type Stat =
  | 'HP'
  | 'Attack'
  | 'Defense'
  | 'SpAttack'
  | 'SpDefense'
  | 'Speed';

interface BaseStats {
  HP: number;
  Attack: number;
  Defense: number;
  SpAttack: number;
  SpDefense: number;
  Speed: number;
}

export interface StatLevel {
  Level: number;
  HP: number;
  Attack: number;
  Defense: number;
  SpAttack: number;
  SpDefense: number;
  Speed: number;
  HPEV: number;
  AttackEV: number;
  DefenseEV: number;
  SpAttackEV: number;
  SpDefenseEV: number;
  SpeedEV: number;
}

interface Characteristic {
  Stat: Stat;
  IVs: number[];
}

interface NatureModifiers {
  Attack: 0.9 | 1.0 | 1.1;
  Defense: 0.9 | 1.0 | 1.1;
  Speed: 0.9 | 1.0 | 1.1;
  SpAttack: 0.9 | 1.0 | 1.1;
  SpDefense: 0.9 | 1.0 | 1.1;
}

const Natures = Object.freeze({
  Hardy: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Lonely: {
    Attack: 1.1,
    Defense: 0.9,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Brave: {
    Attack: 1.1,
    Defense: 1.0,
    Speed: 0.9,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Adamant: {
    Attack: 1.1,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 0.9,
    SpDefense: 1.0,
  },
  Naughty: {
    Attack: 1.1,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 0.9,
  },
  Bold: {
    Attack: 0.9,
    Defense: 1.1,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Docile: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Relaxed: {
    Attack: 1.0,
    Defense: 1.1,
    Speed: 0.9,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Impish: {
    Attack: 1.0,
    Defense: 1.1,
    Speed: 1.0,
    SpAttack: 0.9,
    SpDefense: 1.0,
  },
  Lax: { Attack: 1.0, Defense: 1.1, Speed: 1.0, SpAttack: 1.0, SpDefense: 0.9 },
  Timid: {
    Attack: 0.9,
    Defense: 1.0,
    Speed: 1.1,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Hasty: {
    Attack: 1.0,
    Defense: 0.9,
    Speed: 1.1,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Serious: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Jolly: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.1,
    SpAttack: 0.9,
    SpDefense: 1.0,
  },
  Naive: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.1,
    SpAttack: 1.0,
    SpDefense: 0.9,
  },
  Modest: {
    Attack: 0.9,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.1,
    SpDefense: 1.0,
  },
  Mild: {
    Attack: 1.0,
    Defense: 0.9,
    Speed: 1.0,
    SpAttack: 1.1,
    SpDefense: 1.0,
  },
  Quiet: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 0.9,
    SpAttack: 1.1,
    SpDefense: 1.0,
  },
  Bashful: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
  Rash: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.1,
    SpDefense: 0.9,
  },
  Calm: {
    Attack: 0.9,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.1,
  },
  Gentle: {
    Attack: 1.0,
    Defense: 0.9,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.1,
  },
  Sassy: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 0.9,
    SpAttack: 1.0,
    SpDefense: 1.1,
  },
  Careful: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 0.9,
    SpDefense: 1.1,
  },
  Quirky: {
    Attack: 1.0,
    Defense: 1.0,
    Speed: 1.0,
    SpAttack: 1.0,
    SpDefense: 1.0,
  },
});

const Characteristics = Object.freeze({
  'Loves to eat': { Stat: 'HP', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Proud of its power': { Stat: 'Attack', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Sturdy body': { Stat: 'Defense', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Likes to run': { Stat: 'Speed', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Highly curious': { Stat: 'SpAttack', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Strong willed': { Stat: 'SpDefense', IVs: [0, 5, 10, 15, 20, 25, 30] },
  'Takes plenty of siestas': { Stat: 'HP', IVs: [1, 6, 11, 16, 21, 26, 31] },
  'Likes to thrash about': { Stat: 'Attack', IVs: [1, 6, 11, 16, 21, 26, 31] },
  'Capable of taking hits': {
    Stat: 'Defense',
    IVs: [1, 6, 11, 16, 21, 26, 31],
  },
  'Alert to sounds': { Stat: 'Speed', IVs: [1, 6, 11, 16, 21, 26, 31] },
  'Mischievous': { Stat: 'SpAttack', IVs: [1, 6, 11, 16, 21, 26, 31] },
  'Somewhat vain': { Stat: 'SpDefense', IVs: [1, 6, 11, 16, 21, 26, 31] },
  'Nods off a lot': { Stat: 'HP', IVs: [2, 7, 12, 17, 22, 27] },
  'A little quick tempered': { Stat: 'Attack', IVs: [2, 7, 12, 17, 22, 27] },
  'Highly persistent': { Stat: 'Defense', IVs: [2, 7, 12, 17, 22, 27] },
  'Impetuous and silly': { Stat: 'Speed', IVs: [2, 7, 12, 17, 22, 27] },
  'Thoroughly cunning': { Stat: 'SpAttack', IVs: [2, 7, 12, 17, 22, 27] },
  'Strongly defiant': { Stat: 'SpDefense', IVs: [2, 7, 12, 17, 22, 27] },
  'Scatters things often': { Stat: 'HP', IVs: [3, 8, 13, 18, 23, 28] },
  'Likes to fight': { Stat: 'Attack', IVs: [3, 8, 13, 18, 23, 28] },
  'Good endurance': { Stat: 'Defense', IVs: [3, 8, 13, 18, 23, 28] },
  'Somewhat of a clown': { Stat: 'Speed', IVs: [3, 8, 13, 18, 23, 28] },
  'Often lost in thought': { Stat: 'SpAttack', IVs: [3, 8, 13, 18, 23, 28] },
  'Hates to lose': { Stat: 'SpDefense', IVs: [3, 8, 13, 18, 23, 28] },
  'Likes to relax': { Stat: 'HP', IVs: [4, 9, 14, 19, 24, 29] },
  'Quick tempered': { Stat: 'Attack', IVs: [4, 9, 14, 19, 24, 29] },
  'Good perseverance': { Stat: 'Defense', IVs: [4, 9, 14, 19, 24, 29] },
  'Quick to flee': { Stat: 'Speed', IVs: [4, 9, 14, 19, 24, 29] },
  'Very finicky': { Stat: 'SpAttack', IVs: [4, 9, 14, 19, 24, 29] },
  'Somewhat stubborn': { Stat: 'SpDefense', IVs: [4, 9, 14, 19, 24, 29] },
});

function hpFormula(baseStat: number, iv: number, ev: number, level: number) {
  return (
    Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) +
    level +
    10
  );
}

function otherStatFormula(
  baseStat: number,
  iv: number,
  ev: number,
  level: number,
  nature: number,
) {
  return Math.floor(
    (Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5) *
      nature,
  );
}

function narrowHPIVRange(
  baseStat: number,
  ev: number,
  level: number,
  stat: number,
  ivRange: number[],
) {
  return ivRange.filter(iv => hpFormula(baseStat, iv, ev, level) === stat);
}

function narrowIVRange(
  baseStat: number,
  ev: number,
  level: number,
  nature: number,
  stat: number,
  ivRange: number[],
) {
  return ivRange.filter(
    iv => otherStatFormula(baseStat, iv, ev, level, nature) === stat,
  );
}

function narrowByHiddenPower(
  hpIVRange: number[],
  atkIVRange: number[],
  defIVRange: number[],
  speIVRange: number[],
  spaIVRange: number[],
  spdIVRange: number[],
  targetHPType: string,
) {
  const HiddenPowerTypes = {
    Fighting: 0,
    Flying: 1,
    Poison: 2,
    Ground: 3,
    Rock: 4,
    Bug: 5,
    Ghost: 6,
    Steel: 7,
    Fire: 8,
    Water: 9,
    Grass: 10,
    Electric: 11,
    Psychic: 12,
    Ice: 13,
    Dragon: 14,
    Dark: 15,
  };
  const hpRange: Set<number> = new Set();
  const atkRange: Set<number> = new Set();
  const defRange: Set<number> = new Set();
  const speRange: Set<number> = new Set();
  const spaRange: Set<number> = new Set();
  const spdRange: Set<number> = new Set();

  // In here, ivLSBs is the binary number formed from
  // hpLSB + 2 * atkLSB + 4 * defLSB + 8 * speLSB + 16 * spaLSB + 32 * spdLSB
  // in the hidden power formula
  // 4.2 is calculated from 1 / (15 / 63) which is the remaining part of the
  // equation after removing ivLSBs from it
  // Based off https://math.stackexchange.com/a/1683536
  
  const lowerBound = Math.ceil(4.2 * HiddenPowerTypes[targetHPType]);
  // upper limit of ivLSBs + 1
  let upperBound = Math.ceil(4.2 * (HiddenPowerTypes[targetHPType] + 1));
  // Enforce upper limit of 63
  upperBound = upperBound <= 64 ? upperBound : 64
  for (
    let ivLSBs = lowerBound;
    ivLSBs < upperBound;
    ivLSBs++
  ) {
    hpRange.add(ivLSBs & 1);
    atkRange.add((ivLSBs >> 1) & 1);
    defRange.add((ivLSBs >> 2) & 1);
    speRange.add((ivLSBs >> 3) & 1);
    spaRange.add((ivLSBs >> 4) & 1);
    spdRange.add((ivLSBs >> 5) & 1);
  }
  return [
    hpIVRange.filter(iv => hpRange.has(iv & 1)),
    atkIVRange.filter(iv => atkRange.has(iv & 1)),
    defIVRange.filter(iv => defRange.has(iv & 1)),
    speIVRange.filter(iv => speRange.has(iv & 1)),
    spaIVRange.filter(iv => spaRange.has(iv & 1)),
    spdIVRange.filter(iv => spdRange.has(iv & 1)),
  ];
}

function getNextLevel(
  stat: Stat,
  baseStat: number,
  ivRange: number[],
  ev: number,
  lastStatLevel: number,
  nature: number,
) {
  // Protect against infinite loops in zero-length arrays
  if (!(ivRange.length > 0)) {
    return null;
  } else if (!(ivRange.length > 1)) {
    return lastStatLevel;
  }
  // Assuming EVs won't change is a lot easier to program,
  // and leads to less unexpected results
  let level = lastStatLevel;
  const calcFormula = stat === 'HP' ? hpFormula : otherStatFormula;
  do {
    level += 1;
  } while (
    ivRange
      .map(iv => calcFormula(baseStat, iv, ev, level, nature))
      .every((result, _, arr) => result === arr[0])
  );
  return level;
}

export function calculateIVs(
  baseStats: BaseStats,
  statLevels: StatLevel[],
  natureInput: string,
  characteristicInput: string,
  hiddenPower: string,
): [
  number[],
  number[],
  number[],
  number[],
  number[],
  number[],
  number,
  number,
  number,
  number,
  number,
  number,
] {
  const hpIVRange = [...Array(32).keys()];
  const atkIVRange = [...Array(32).keys()];
  const defIVRange = [...Array(32).keys()];
  const spaIVRange = [...Array(32).keys()];
  const spdIVRange = [...Array(32).keys()];
  const speIVRange = [...Array(32).keys()];
  const checkIVMembership = (arr: number[], l: number[]) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!l.includes(arr[i])) {
        arr.splice(i, 1);
      }
    }
  };
  const natureModifier: NatureModifiers = Natures[natureInput];
  for (const statLevel of statLevels) {
    const results = [
      narrowHPIVRange(
        baseStats.HP,
        statLevel.HPEV,
        statLevel.Level,
        statLevel.HP,
        hpIVRange,
      ),
      narrowIVRange(
        baseStats.Attack,
        statLevel.AttackEV,
        statLevel.Level,
        natureModifier.Attack,
        statLevel.Attack,
        atkIVRange,
      ),
      narrowIVRange(
        baseStats.Defense,
        statLevel.DefenseEV,
        statLevel.Level,
        natureModifier.Defense,
        statLevel.Defense,
        defIVRange,
      ),
      narrowIVRange(
        baseStats.SpAttack,
        statLevel.SpAttackEV,
        statLevel.Level,
        natureModifier.SpAttack,
        statLevel.SpAttack,
        spaIVRange,
      ),
      narrowIVRange(
        baseStats.SpDefense,
        statLevel.SpDefenseEV,
        statLevel.Level,
        natureModifier.SpDefense,
        statLevel.SpDefense,
        spdIVRange,
      ),
      narrowIVRange(
        baseStats.Speed,
        statLevel.SpeedEV,
        statLevel.Level,
        natureModifier.Speed,
        statLevel.Speed,
        speIVRange,
      ),
    ];
    checkIVMembership(hpIVRange, results[0]);
    checkIVMembership(atkIVRange, results[1]);
    checkIVMembership(defIVRange, results[2]);
    checkIVMembership(spaIVRange, results[3]);
    checkIVMembership(spdIVRange, results[4]);
    checkIVMembership(speIVRange, results[5]);
  }
  if (hiddenPower !== null) {
    const results = narrowByHiddenPower(
      hpIVRange,
      atkIVRange,
      defIVRange,
      speIVRange,
      spaIVRange,
      spdIVRange,
      hiddenPower,
    );
    checkIVMembership(hpIVRange, results[0]);
    checkIVMembership(atkIVRange, results[1]);
    checkIVMembership(defIVRange, results[2]);
    checkIVMembership(speIVRange, results[3]);
    checkIVMembership(spaIVRange, results[4]);
    checkIVMembership(spdIVRange, results[5]);
  }
  if (characteristicInput !== null && characteristicInput in Characteristics) {
    let highestIV = [
      ...hpIVRange,
      ...atkIVRange,
      ...defIVRange,
      ...spaIVRange,
      ...spdIVRange,
      ...speIVRange,
    ].reduce((prev, value) => Math.max(prev, value));
    const characteristic: Characteristic = Characteristics[characteristicInput];
    const charIVRange = characteristic.IVs.filter(value => value <= highestIV);
    highestIV = charIVRange[charIVRange.length - 1];
    for (const ivRange of [
      hpIVRange,
      atkIVRange,
      defIVRange,
      spaIVRange,
      spdIVRange,
      speIVRange,
    ]) {
      for (let i = ivRange.length - 1; i >= 0; i--) {
        if (ivRange[i] > highestIV) {
          ivRange.splice(i, 1);
        }
      }
    }
    switch (characteristic.Stat) {
      case 'HP':
        checkIVMembership(hpIVRange, charIVRange);
        break;
      case 'Attack':
        checkIVMembership(atkIVRange, charIVRange);
        break;
      case 'Defense':
        checkIVMembership(defIVRange, charIVRange);
        break;
      case 'SpAttack':
        checkIVMembership(spaIVRange, charIVRange);
        break;
      case 'SpDefense':
        checkIVMembership(spdIVRange, charIVRange);
        break;
      case 'Speed':
        checkIVMembership(speIVRange, charIVRange);
        break;
    }
  }
  const nextHPLevel = getNextLevel(
    'HP',
    baseStats.HP,
    hpIVRange,
    statLevels[statLevels.length - 1].HPEV,
    statLevels[statLevels.length - 1].Level,
    null,
  );
  const nextAtkLevel = getNextLevel(
    'Attack',
    baseStats.Attack,
    atkIVRange,
    statLevels[statLevels.length - 1].AttackEV,
    statLevels[statLevels.length - 1].Level,
    natureModifier.Attack,
  );
  const nextDefLevel = getNextLevel(
    'HP',
    baseStats.Defense,
    defIVRange,
    statLevels[statLevels.length - 1].DefenseEV,
    statLevels[statLevels.length - 1].Level,
    natureModifier.Defense,
  );
  const nextSpALevel = getNextLevel(
    'HP',
    baseStats.SpAttack,
    spaIVRange,
    statLevels[statLevels.length - 1].SpAttackEV,
    statLevels[statLevels.length - 1].Level,
    natureModifier.SpAttack,
  );
  const nextSpDLevel = getNextLevel(
    'HP',
    baseStats.SpDefense,
    spdIVRange,
    statLevels[statLevels.length - 1].SpDefenseEV,
    statLevels[statLevels.length - 1].Level,
    natureModifier.SpDefense,
  );
  const nextSpeLevel = getNextLevel(
    'HP',
    baseStats.Speed,
    speIVRange,
    statLevels[statLevels.length - 1].SpeedEV,
    statLevels[statLevels.length - 1].Level,
    natureModifier.Speed,
  );
  return [
    hpIVRange,
    atkIVRange,
    defIVRange,
    spaIVRange,
    spdIVRange,
    speIVRange,
    nextHPLevel,
    nextAtkLevel,
    nextDefLevel,
    nextSpALevel,
    nextSpDLevel,
    nextSpeLevel,
  ];
}
