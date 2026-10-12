import { getPages } from '../lib/utils.js';

// Сколько кнопок страниц показываем одновременно
const VISIBLE_PAGES = 5;

// Функция: настраивает пагинацию — готовит параметры страницы для запроса и рисует навигацию по ответу
// Принимает: элементы шаблона pagination по data-name и колбэк отрисовки одной кнопки страницы
// Возвращает: объект с applyPagination (до запроса) и updatePagination (после запроса)
export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage
) => {
  // Сохраняем заготовку кнопки из разметки как шаблон и убираем оригинал,
  // чтобы контейнер страниц стал пустым — дальше он заполняется только нашими копиями
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  // сколько страниц было при прошлой отрисовке — нужно кнопкам next и last
  let pageCount;

  // добавляем в query параметры страницы
  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
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

    // если ничего не нашлось, pageCount = 0 — а страницы с номером меньше 1 не бывает
    if (page < 1) page = 1;

    return Object.assign({}, query, {
      limit,
      page,
    });
  };

  // перерисовываем кнопки страниц и статус по ответу сервера
  const updatePagination = (total, { page, limit }) => {
    pageCount = Math.ceil(total / limit);

    // Считаем, какие номера страниц показать вокруг текущей, и перерисовываем кнопки
    const visiblePages = getPages(page, pageCount, VISIBLE_PAGES);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const pageElement = pageTemplate.cloneNode(true);
        return createPage(pageElement, pageNumber, pageNumber === page);
      })
    );

    // Сколько строк пропущено до начала текущей страницы
    const skip = (page - 1) * limit;

    // Статус: человеческая нумерация строк с единицы, при пустой выборке — нули
    fromRow.textContent = total === 0 ? 0 : skip + 1;
    toRow.textContent = Math.min(skip + limit, total);
    totalRows.textContent = total;
  };

  return {
    updatePagination,
    applyPagination,
  };
};
