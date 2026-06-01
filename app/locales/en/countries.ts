export default {
  title: 'All countries',
  subtitle: 'Choose a country and see reviews from people of your nationality',
  viewingAs: 'Viewing as:',
  filters: {
    search: 'Search country...',
    allRegions: 'All regions',
    allCategories: 'Any category',
    found: 'Found {count} countries',
    sort: { popular: 'Popular', ratingDesc: 'Best rating', ratingAsc: 'Worst rating', reviewsDesc: 'Most reviews', recent: 'Recently added' },
    regions: { all: 'All regions', europe: 'Europe', asia: 'Asia', americas: 'Americas', africa: 'Africa', oceania: 'Oceania' },
  },
  card: { reviews: '{count} reviews', hasReviews: 'Has reviews for you', noReviews: 'No reviews for your nationality' },
  empty: { message: 'No countries found — try changing filters', reset: 'Reset filters' },
  dialog: { title: 'Select nationality first', subtitle: 'To see filtered reviews, tell us your nationality.' },
}
