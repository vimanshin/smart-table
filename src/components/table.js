import { cloneTemplate } from '../lib/utils.js';

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);

  // Шаблоны из before встают перед таблицей.
  // Массив разворачиваем, потому что каждый prepend ставит элемент в самое начало
  before.reverse().forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.prepend(root[subName].container);
  });

  // Шаблоны из after встают после таблицы — здесь порядок менять не нужно
  after.forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.append(root[subName].container);
  });

  // Любое изменение поля формы (select, input, чекбокс) — просим главный модуль перерисовать таблицу
  root.container.addEventListener('change', () => {
    onAction();
  });

  // Сброс формы: браузер очищает поля уже после события, поэтому читаем их следующим шагом
  root.container.addEventListener('reset', () => {
    setTimeout(onAction);
  });

  // Отправка формы: отменяем перезагрузку страницы и передаём кнопку, которой отправили
  root.container.addEventListener('submit', (e) => {
    e.preventDefault();
    onAction(e.submitter);
  });

  const render = (data) => {
    // Превращаем каждую строку данных в готовый DOM-элемент строки таблицы
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      // Заполняем только те поля, для которых в шаблоне есть элемент с таким data-name
      Object.keys(item).forEach((key) => {
        if (row.elements[key]) {
          row.elements[key].textContent = item[key];
        }
      });

      return row.container;
    });

    root.elements.rows.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
