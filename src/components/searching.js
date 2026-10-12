// Функция: настраивает поиск сразу по нескольким полям строки
// Принимает: имя поля формы, из которого берётся поисковый запрос
// Возвращает: функцию, которая добавляет поисковый запрос в query
export function initSearching(searchField) {
  return (query, state, action) => {
    // если в поле поиска что-то введено, передаём это серверу
    return state[searchField]
      ? Object.assign({}, query, { search: state[searchField] })
      : query;
  };
}
