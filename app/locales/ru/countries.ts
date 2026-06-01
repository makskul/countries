export default {
  title: 'Все страны',
  subtitle: 'Выбери страну и узнай отзывы людей твоей национальности',
  viewingAs: 'Смотрю как:',
  filters: {
    search: 'Поиск страны...',
    allRegions: 'Все регионы',
    allCategories: 'Любая категория',
    found: 'Найдено {count} стран',
    sort: { popular: 'Популярные', ratingDesc: 'Лучший рейтинг', ratingAsc: 'Худший рейтинг', reviewsDesc: 'Больше отзывов', recent: 'Недавно добавленные' },
    regions: { all: 'Все регионы', europe: 'Европа', asia: 'Азия', americas: 'Америка', africa: 'Африка', oceania: 'Океания' },
  },
  card: { reviews: '{count} отзывов', hasReviews: 'Есть отзывы для вас', noReviews: 'Нет отзывов для вашей нац.' },
  empty: { message: 'Нет стран по вашему запросу — попробуй изменить фильтры', reset: 'Сбросить фильтры' },
  dialog: { title: 'Сначала выбери национальность', subtitle: 'Чтобы видеть отфильтрованные отзывы, укажи свою национальность.' },
}
