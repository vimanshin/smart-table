import './fonts/ys-display/fonts.css';
import './style.css';

import { initData } from './data.js';
import { processFormData } from './lib/utils.js';

import { initTable } from './components/table.js';
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

// API для получения данных с сервера
const api = initData();

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
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса

  // result = applySearching(result, state, action); // общий поиск идёт
  // первым: отсекает больше всего
  // result = applyFiltering(result, state, action); // фильтруем до
  // сортировки: сортировать меньше
  // result = applySorting(result, state, action); // сортируем
  // отфильтрованный набор
  // result = applyPagination(result, state, action); // пагинация
  // применяется последней

  const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами
  sampleTable.render(items);
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
// const applyFiltering = initFiltering(sampleTable.filter.elements, {
//  searchBySeller: indexes.sellers,
// });

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

async function init() {
  const indexes = await api.getIndexes();
}

init().then(render);
