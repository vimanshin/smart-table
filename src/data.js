const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
  // переменные для кеширования данных
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  // приводим записи с сервера к виду, который нужен таблице
  const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
  }));

  // получаем продавцов и покупателей, запрашиваем только один раз
  const getIndexes = async () => {
    if (!sellers || !customers) {
      [sellers, customers] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then(res => res.json()),
        fetch(`${BASE_URL}/customers`).then(res => res.json()),
      ]);
    }

    return { sellers, customers };
  }

  // получаем записи о продажах по параметрам запроса
  const getRecords = async (query, isUpdated = false) => {
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    // параметры не поменялись — отдаём то, что уже получили
    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items)
    };

    return lastResult;
  };

  return {
    getIndexes,
    getRecords
  };
}
