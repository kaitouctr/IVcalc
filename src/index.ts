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

import Papa from 'papaparse';
import { StatLevel, calculateIVs } from './calc';

// Type/interface declarations

interface MonEntry {
  Number: number;
  Name: string;
  Form: string;
  HP: number;
  Attack: number;
  Defense: number;
  SpAttack: number;
  SpDefense: number;
  Speed: number;
}

// HTML Elements declarations

const mainForm = document.getElementById('mainForm') as HTMLFormElement;
const mainFormItems = mainForm.elements;
const genSelect = mainFormItems['generationSelector'] as HTMLSelectElement;
const monSelect = mainFormItems['monSelector'] as HTMLInputElement;
const monSelectList = document.getElementById('monList') as HTMLDataListElement;
const monFormSelect = mainFormItems['regionalSelector'] as HTMLSelectElement;
const charSelect = mainFormItems['characteristicSelector'] as HTMLSelectElement;
const hPowerSelect = mainFormItems['hiddenPowerSelector'] as HTMLSelectElement;
const statsInput = mainFormItems['levelStats'] as HTMLTextAreaElement;
const useEVsSwitch = mainFormItems['useEVsSwitch'] as HTMLInputElement;
const diffModeSwitch = mainFormItems['diffModeRadio'] as HTMLInputElement;

// Globals declarations

let monLookup: MonEntry[];

function createOption(
  value: string,
  targetList: HTMLSelectElement | HTMLDataListElement,
) {
  const option = document.createElement('option');
  option.value = value;
  option.innerText = value;
  targetList.appendChild(option);
}

function pullFromCSV(gen: string) {
  const csvRequest = (gen => {
    switch (gen) {
      case '3':
      case '4':
      case '5':
        return fetch('./assets/pkmn_g2-g5.csv');
      case '6':
        return fetch('./assets/pkmn_g6.csv');
      case '7':
        return fetch('./assets/pkmn_g7.csv');
      case '8':
        return fetch('./assets/pkmn_g8.csv');
      case '9':
        return fetch('./assets/pkmn_g9.csv');
    }
  })(gen);
  return csvRequest
    .then(request => request.text())
    .then(
      csv =>
        Papa.parse(csv, {
          header: true,
          complete: results =>
            console.log(`${results.data.length} entries parsed`),
          transformHeader: header => {
            switch (header) {
              case 'Sp.Attack':
                return 'SpAttack';
              case 'Sp.Defense':
                return 'SpDefense';
              default:
                return header;
            }
          },
          transform: (value, header) => {
            switch (header) {
              case 'Number':
              case 'HP':
              case 'Attack':
              case 'Defense':
              case 'SpAttack':
              case 'SpDefense':
              case 'Speed':
                return Number(value);
              case 'Name':
              case 'Form':
                return value;
            }
          },
        }) as Papa.ParseResult<MonEntry>,
    );
}

function updateFilterState(gen: string) {
  const resetSelectedOptions = (options: HTMLOptionsCollection) => {
    for (const option of options) {
      option.selected = option.defaultSelected;
    }
  };
  switch (gen) {
    case '3':
      charSelect.disabled = true;
      hPowerSelect.disabled = false;
      resetSelectedOptions(charSelect.options);
      break;
    case '4':
      charSelect.disabled = false;
      hPowerSelect.disabled = false;
      break;
    case '5':
      charSelect.disabled = false;
      hPowerSelect.disabled = false;
      break;
    case '6':
      charSelect.disabled = false;
      hPowerSelect.disabled = false;
      break;
    case '7':
      charSelect.disabled = false;
      hPowerSelect.disabled = false;
      break;
    case '8':
      charSelect.disabled = false;
      hPowerSelect.disabled = true;
      resetSelectedOptions(hPowerSelect.options);
      break;
    case '9':
      charSelect.disabled = false;
      hPowerSelect.disabled = true;
      resetSelectedOptions(hPowerSelect.options);
      break;
  }
}

function updateMonList(csvData: MonEntry[], gen: string) {
  for (let i = monSelectList.options.length - 1; i >= 0; i--) {
    monSelectList.removeChild(monSelectList.options[i]);
  }
  let nDexThreshold: number;
  switch (gen) {
    case '3':
      nDexThreshold = 386;
      break;
    case '4':
      nDexThreshold = 493;
      break;
    case '5':
      nDexThreshold = 649;
      break;
    case '6':
      nDexThreshold = 721;
      break;
    case '7':
      nDexThreshold = 809;
      break;
    case '8':
      nDexThreshold = 905;
      break;
    case '9':
      nDexThreshold = 1025;
      break;
  }
  monLookup = csvData.filter(
    entry => entry.Number >= 1 && entry.Number <= nDexThreshold,
  );
  for (const name of [...new Set(monLookup.map(entry => entry.Name))]) {
    createOption(name, monSelectList);
  }
}

function getCurrentMonForms(currentMon: string) {
  const defaultOption = (() => {
    const option = document.createElement('option');
    option.innerText = '–';
    option.value = '';
    option.defaultSelected = true;
    return option;
  })();
  for (let i = monFormSelect.options.length - 1; i >= 0; i--) {
    monFormSelect.remove(i);
  }
  const currentMonEntries = monLookup.filter(mon => mon.Name === currentMon);
  if (currentMonEntries.length > 1) {
    monFormSelect.disabled = false;
    const forms = currentMonEntries.map(entry => entry.Form);
    for (const form of forms) {
      if (form !== '') {
        createOption(form, monFormSelect);
      } else {
        monFormSelect.add(defaultOption);
      }
    }
  } else {
    monFormSelect.add(defaultOption);
    monFormSelect.disabled = true;
  }
}

function getSetMonBaseStats(currentMonName: string, currentMonForm: string) {
  const currentMon = monLookup.find(
    entry => entry.Name === currentMonName && entry.Form === currentMonForm,
  ) ?? {
    Number: null,
    Name: null,
    Form: null,
    HP: null,
    Attack: null,
    Defense: null,
    SpAttack: null,
    SpDefense: null,
    Speed: null,
  };
  const baseHP = mainFormItems['baseHP'] as HTMLInputElement,
    baseAtk = mainFormItems['baseAtk'] as HTMLInputElement,
    baseDef = mainFormItems['baseDef'] as HTMLInputElement,
    baseSpA = mainFormItems['baseSpA'] as HTMLInputElement,
    baseSpD = mainFormItems['baseSpD'] as HTMLInputElement,
    baseSpe = mainFormItems['baseSpe'] as HTMLInputElement,
    displayBaseHP = mainFormItems['displayBaseHP'] as HTMLOutputElement,
    displayBaseAtk = mainFormItems['displayBaseAtk'] as HTMLOutputElement,
    displayBaseDef = mainFormItems['displayBaseDef'] as HTMLOutputElement,
    displayBaseSpA = mainFormItems['displayBaseSpA'] as HTMLOutputElement,
    displayBaseSpD = mainFormItems['displayBaseSpD'] as HTMLOutputElement,
    displayBaseSpe = mainFormItems['displayBaseSpe'] as HTMLOutputElement;

  [baseHP.value, displayBaseHP.value] = Array(2).fill(
    String(currentMon.HP ?? ''),
  );
  [baseAtk.value, displayBaseAtk.value] = Array(2).fill(
    String(currentMon.Attack ?? ''),
  );
  [baseDef.value, displayBaseDef.value] = Array(2).fill(
    String(currentMon.Defense ?? ''),
  );
  [baseSpA.value, displayBaseSpA.value] = Array(2).fill(
    String(currentMon.SpAttack ?? ''),
  );
  [baseSpD.value, displayBaseSpD.value] = Array(2).fill(
    String(currentMon.SpDefense ?? ''),
  );
  [baseSpe.value, displayBaseSpe.value] = Array(2).fill(
    String(currentMon.Speed ?? ''),
  );
}

function fixDiffStatsInput() {
  statsInput.value = statsInput.value.replace(/(?<=^)\n/gm, '');
}

window.onload = () => {
  updateFilterState(genSelect.value);
  pullFromCSV(genSelect.value)
    .then(data => data.data)
    .then(data => {
      updateMonList(data, genSelect.value);
      getCurrentMonForms(monSelect.value);
    });
};

genSelect.addEventListener('change', function () {
  updateFilterState(this.value);
  pullFromCSV(this.value)
    .then(data => updateMonList(data.data, this.value))
    .then(() => {
      getCurrentMonForms(monSelect.value);
      getSetMonBaseStats(monSelect.value, monFormSelect.value);
    });
});

monSelect.addEventListener('change', function () {
  getCurrentMonForms(this.value);
  getSetMonBaseStats(this.value, monFormSelect.value);
});

monFormSelect.addEventListener('change', function () {
  getSetMonBaseStats(monSelect.value, this.value);
});

diffModeSwitch.addEventListener('change', fixDiffStatsInput);

statsInput.addEventListener('input', function () {
  this.value = this.value.replace(/[^0-9\s]+| {2,}| (?=\n)/, '');
  if (diffModeSwitch.checked) {
    fixDiffStatsInput();
  }
});

mainForm.onsubmit = () => false;

mainForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const params = new FormData(this),
    statLevels: StatLevel[] = [],
    statInput = (params.get('levelStats') as string)
      .split('\n')
      .map(level =>
        level.split(' ').map(stat => (stat !== '' ? Number(stat) : null)),
      );
  if (
    params.get('baseHP') === '' ||
    params.get('baseAtk') === '' ||
    params.get('baseDef') === '' ||
    params.get('baseSpA') === '' ||
    params.get('baseSpD') === '' ||
    params.get('baseSpe') === ''
  ) {
    alert(
      'You have not set a valid Pokémon! Please set one before proceeding.',
    );
    return;
  }
  let level = Number(params.get('initialLevel'));
  statLevels.push({
    Level: level,
    HP: Number(params.get('initialHP')),
    Attack: Number(params.get('initialAtk')),
    Defense: Number(params.get('initialDef')),
    SpAttack: Number(params.get('initialSpA')),
    SpDefense: Number(params.get('initialSpD')),
    Speed: Number(params.get('initialSpe')),
    HPEV: Number(params.get('initialHPEV') ?? 0),
    AttackEV: Number(params.get('initialAtkEV') ?? 0),
    DefenseEV: Number(params.get('initialDefEV') ?? 0),
    SpAttackEV: Number(params.get('initialSpAEV') ?? 0),
    SpDefenseEV: Number(params.get('initialSpDEV') ?? 0),
    SpeedEV: Number(params.get('initialSpeEV') ?? 0),
  });
  for (const statLevel of statInput) {
    level += 1;
    if (statLevel.length === 1 && statLevel.includes(null)) {
      continue;
    }
    if (statLevel.length !== (params.get('useEVs') ? 12 : 6)) {
      alert('Input is incorrectly formatted, please fix this.');
      return;
    }
    statLevels.push({
      Level: level,
      HP:
        params.get('calcMode') === 'exact'
          ? statLevel[0]
          : statLevels[statLevels.length - 1].HP + statLevel[0],
      Attack:
        params.get('calcMode') === 'exact'
          ? statLevel[1]
          : statLevels[statLevels.length - 1].Attack + statLevel[1],
      Defense:
        params.get('calcMode') === 'exact'
          ? statLevel[2]
          : statLevels[statLevels.length - 1].Defense + statLevel[2],
      SpAttack:
        params.get('calcMode') === 'exact'
          ? statLevel[3]
          : statLevels[statLevels.length - 1].SpAttack + statLevel[3],
      SpDefense:
        params.get('calcMode') === 'exact'
          ? statLevel[4]
          : statLevels[statLevels.length - 1].SpDefense + statLevel[4],
      Speed:
        params.get('calcMode') === 'exact'
          ? statLevel[5]
          : statLevels[statLevels.length - 1].Speed + statLevel[5],
      HPEV: statLevel[6] ?? 0,
      AttackEV: statLevel[7] ?? 0,
      DefenseEV: statLevel[8] ?? 0,
      SpAttackEV: statLevel[9] ?? 0,
      SpDefenseEV: statLevel[10] ?? 0,
      SpeedEV: statLevel[11] ?? 0,
    });
  }
  const [hpIV, atkIV, defIV, spaIV, spdIV, speIV] = calculateIVs(
    {
      HP: Number(params.get('baseHP')),
      Attack: Number(params.get('baseAtk')),
      Defense: Number(params.get('baseDef')),
      SpAttack: Number(params.get('baseSpA')),
      SpDefense: Number(params.get('baseSpD')),
      Speed: Number(params.get('baseSpe')),
    },
    statLevels,
    params.get('nature') as string,
    (params.get('characteristic') as string) ?? '',
    (params.get('hiddenPower') as string) ?? '',
  );
  (mainFormItems['hpIV'] as HTMLOutputElement).value =
    hpIV.length > 0 ? hpIV.join(', ') : 'Invalid';
  (mainFormItems['attackIV'] as HTMLOutputElement).value =
    atkIV.length > 0 ? atkIV.join(', ') : 'Invalid';
  (mainFormItems['defenseIV'] as HTMLOutputElement).value =
    defIV.length > 0 ? defIV.join(', ') : 'Invalid';
  (mainFormItems['spAttackIV'] as HTMLOutputElement).value =
    spaIV.length > 0 ? spaIV.join(', ') : 'Invalid';
  (mainFormItems['spDefenseIV'] as HTMLOutputElement).value =
    spdIV.length > 0 ? spdIV.join(', ') : 'Invalid';
  (mainFormItems['speedIV'] as HTMLOutputElement).value =
    speIV.length > 0 ? speIV.join(', ') : 'Invalid';
});

useEVsSwitch.addEventListener('change', function () {
  if (this.checked) {
    for (const element of document.querySelectorAll('.initialEVSettings')) {
      (element as HTMLElement).hidden = false;
      if (element.nodeName === 'INPUT') {
        (element as HTMLInputElement).disabled = false;
      }
    }
  }
  if (!this.checked) {
    for (const element of document.querySelectorAll('.initialEVSettings')) {
      (element as HTMLElement).hidden = true;
      if (element.nodeName === 'INPUT') {
        (element as HTMLInputElement).disabled = true;
      }
    }
  }
});
