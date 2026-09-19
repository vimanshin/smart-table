import { getPages } from '../lib/utils.js';

// Сколько кнопок страниц показываем одновременно
const VISIBLE_PAGES = 5;

// Функция: настраивает пагинацию — режет данные на страницы и рисует навигацию
// Принимает: элементы шаблона pagination по data-name и колбэк отрисовки одной кнопки страницы
// Возвращает: функцию, которая при каждой перерисовке отдаёт строки текущей страницы
export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage
) => {
  // Сохраняем заготовку кнопки из разметки как шаблон и убираем оригинал,
  // чтобы контейнер страниц стал пустым — дальше он заполняется только нашими копиями
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  return (data, state, action) => {
    const rowsPerPage = state.rowsPerPage;
    const pageCount = Math.ceil(data.length / rowsPerPage);
    let page = state.page;

    // Нажатая кнопка приходит в action. При первой отрисовке и при change его нет
    if (action)
      switch (action.name) {
        case 'prev':
          page = Math.max(1, page - 1);
          break;
        case 'next':
          page = Math.min(pageCount, page + 1);
          break;
        case 'first':
          page = 1;
          break;
        case 'last':
          page = pageCount;
          break;
      }

    // Страховка от выхода за границы: данных могло стать меньше после фильтра или поиска
    page = Math.max(1, Math.min(pageCount, page));

    // Сколько строк пропускаем до начала текущей страницы
    const skip = (page - 1) * rowsPerPage;

    // Считаем, какие номера страниц показать вокруг текущей, и перерисовываем кнопки
    const visiblePages = getPages(page, pageCount, VISIBLE_PAGES);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const pageElement = pageTemplate.cloneNode(true);
        return createPage(pageElement, pageNumber, pageNumber === page);
      })
    );

    // Статус: человеческая нумерация строк с единицы, при пустой выборке — нули
    fromRow.textContent = data.length === 0 ? 0 : skip + 1;
    toRow.textContent = Math.min(skip + rowsPerPage, data.length);
    totalRows.textContent = data.length;

    return data.slice(skip, skip + rowsPerPage);
  };
};
