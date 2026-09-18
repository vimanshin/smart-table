import { rules, createComparison } from '../lib/compare.js';

// Функция: настраивает поиск сразу по нескольким полям строки
// Принимает: имя поля формы, из которого берётся поисковый запрос
// Возвращает: функцию, которая отбирает подходящие строки при каждой перерисовке
export function initSearching(searchField) {
  // Стандартное правило нужно одно — пропустить пустой запрос.
  // Всю работу делает настроенное правило поиска по трём полям
  const compare = createComparison(
    ['skipEmptyTargetValues'],
    [
      rules.searchMultipleFields(
        searchField,
        ['date', 'customer', 'seller'],
        false
      ),
    ]
  );

  return (data, state, action) => {
    // Оставляем строки, в которых запрос нашёлся хотя бы в одном из полей
    return data.filter((row) => compare(row, state));
  };
}
