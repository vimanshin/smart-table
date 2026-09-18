import { createComparison, defaultRules } from '../lib/compare.js';

// Компаратор создаётся один раз на весь модуль: набор правил не меняется от рендера к рендеру
const compare = createComparison(defaultRules);

// Функция: настраивает фильтрацию таблицы по полям строки фильтров
// Принимает: elements — элементы шаблона filter по data-name; indexes — справочники для списков
// Возвращает: функцию, которая фильтрует данные при каждой перерисовке
export function initFiltering(elements, indexes) {
  // Списки заполняем один раз при инициализации, а не при каждом рендере
  Object.keys(indexes).forEach((elementName) => {
    elements[elementName].append(
      // Колбэк создаёт одну опцию: и значением, и подписью служит имя из справочника
      ...Object.values(indexes[elementName]).map((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        return option;
      })
    );
  });

  return (data, state, action) => {
    // Кнопка очистки лежит рядом с полем ввода внутри общего label
    if (action && action.name === 'clear') {
      const input = action.parentElement.querySelector('input');
      input.value = '';

      // Состояние уже собрано до очистки, поэтому чистим и его копию
      state[action.dataset.field] = '';
    }

    // Оставляем только те строки, которые подходят под все заполненные поля фильтра
    return data.filter((row) => compare(row, state));
  };
}
