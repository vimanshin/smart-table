import './fonts/ys-display/fonts.css';
import './style.css';

import { data as sourceData } from './data/dataset_1.js';

import { initData } from './data.js';
import { processFormData } from './lib/utils.js';

import { initTable } from './components/table.js';
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

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

  // В форме два поля totalFrom и totalTo, а в строке данных одно поле total.
  // Собираем из них массив [от, до] — только так правило arrayAsRange увидит диапазон
  const total = [state.totalFrom, state.totalTo];

  return { ...state, rowsPerPage, page, total };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let result = [...data]; // копируем для последующего изменения

  result = applySearching(result, state, action); // общий поиск идёт первым: отсекает больше всего
  result = applyFiltering(result, state, action); // фильтруем до сортировки: сортировать меньше
  result = applySorting(result, state, action); // сортируем отфильтрованный набор
  result = applyPagination(result, state, action); // пагинация применяется последней

  sampleTable.render(result);
}

const sampleTable = initTable(
  {
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination'],
  },
  render
);

// Поиск: передаём имя поля формы, чтобы модуль знал, откуда брать запрос
const applySearching = initSearching('search');

// Фильтрация: элементы строки фильтров и индексы, которыми заполняем выпадающие списки.
// Ключ searchBySeller совпадает с data-name select-а в шаблоне filter
const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

// Сортировка: передаём массив кнопок-заголовков, чтобы модуль мог
// переключать активную и сбрасывать остальные
const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

// Пагинация: первым аргументом — элементы из шаблона, вторым — как заполнить одну кнопку страницы
const applyPagination = initPagination(
  sampleTable.pagination.elements,
  // Колбэк рисует одну кнопку страницы: номер в input и в подпись
  (el, page, isCurrent) => {
    const input = el.querySelector('input');
    const label = el.querySelector('span');
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;

    // Шаблон клонируется вместе с aria-label исходной кнопки,
    // поэтому доступное имя нужно обновить под свой номер страницы
    el.setAttribute('aria-label', `Goto page ${page}`);

    return el;
  }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();
