import { sortMap } from '../lib/sort.js';

// Функция: настраивает сортировку таблицы по колонкам-заголовкам
// Принимает: массив кнопок сортировки (элементы с data-field и data-value)
// Возвращает: функцию, которая добавляет параметр сортировки в query
export function initSorting(columns) {
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === 'sort') {
      // Клик по заголовку переключает состояние по кругу: none -> up -> down -> none
      action.dataset.value = sortMap[action.dataset.value];
      field = action.dataset.field;
      order = action.dataset.value;

      // Сортируем только по одному полю, поэтому остальные кнопки гасим
      columns.forEach((column) => {
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = 'none';
        }
      });
    } else {
      // Перерисовка без клика по заголовку: читаем активную колонку из разметки
      columns.forEach((column) => {
        if (column.dataset.value !== 'none') {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    // сервер ждёт сортировку в виде field:order, а состояние none он не понимает
    const sort = field && order !== 'none' ? `${field}:${order}` : null;

    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
