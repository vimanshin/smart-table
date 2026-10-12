// Функция: настраивает фильтрацию таблицы по полям строки фильтров
// Принимает: elements — элементы шаблона filter по data-name
// Возвращает: объект с updateIndexes (заполнить списки) и applyFiltering (собрать параметры фильтра)
export function initFiltering(elements) {
  // заполняем выпадающие списки, когда справочники пришли с сервера
  const updateIndexes = (elements, indexes) => {
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
  };

  // добавляем в query параметры фильтра из заполненных полей
  const applyFiltering = (query, state, action) => {
    // Кнопка очистки лежит рядом с полем ввода внутри общего label
    if (action && action.name === 'clear') {
      const input = action.parentElement.querySelector('input');
      input.value = '';
    }

    const filter = {};
    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        // берём только поля ввода и списки, в которых что-то есть
        if (
          ['INPUT', 'SELECT'].includes(elements[key].tagName) &&
          elements[key].value
        ) {
          filter[`filter[${elements[key].name}]`] = elements[key].value;
        }
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
