import './fonts/ys-display/fonts.css';
import './style.css';

import { data as sourceData } from './data/dataset_1.js';

import { initData } from './data.js';
import { processFormData } from './lib/utils.js';

import { initTable } from './components/table.js';
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';

// Исходные данные используемые в render()
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  // Поля формы всегда строки — числовые настройки приводим к числам один раз, здесь
  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);

  return { ...state, rowsPerPage, page };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let result = [...data]; // копируем для последующего изменения

  result = applySorting(result, state, action); // сортируем весь набор данных
  result = applyPagination(result, state, action); // пагинация применяется последней

  sampleTable.render(result);
}

const sampleTable = initTable(
  {
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['header'],
    after: ['pagination'],
  },
  render
);
// Сортировка: передаём массив кнопок-заголовков, чтобы модуль мог
// переключать активную и сбрасывать остальные
const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// Пагинация: первым аргументом — элементы из шаблона, вторым — как заполнить одну кнопку страницы
const applyPagination = initPagination(
  sampleTable.pagination.elements,
  // Колбэк рисует одну кнопку страницы: number в input и в подпись
  (el, page, isCurrent) => {
    const input = el.querySelector('input');
    const label = el.querySelector('span');
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();
