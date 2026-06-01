export default {
  breadcrumb: 'Write a review',
  steps: { about: 'About you', ratings: 'Ratings', done: 'Done' },
  fields: { country: 'Country you are reviewing *', nationality: 'Your nationality *' },
  ratings: { title: 'Rate by category', subtitle: 'At least one category is required. Others are optional.', expand: '+ Rate', collapse: 'Collapse', placeholder: 'Tell us more — optional...', charCount: '{count} / 500', stars: { 1: 'Terrible', 2: 'Bad', 3: 'Average', 4: 'Good', 5: 'Excellent' } },
  actions: { submit: 'Submit review →', submitting: 'Submitting...', cancel: 'Cancel', anonymous: 'Review is anonymous — your name is not published' },
  tips: { title: 'Tips', list: ['Be specific — "4 months" is better than "a long time"', "You don't need to fill all categories", "Your review is anonymous — your name won't appear", 'Review will appear after quick moderation'] },
  preview: { title: '👁 Preview', noCountry: 'No country selected', empty: 'Start rating →' },
  stats: { title: '{count} reviews about {country}', subtitle: 'Already {natCount} reviews from {nationality}. Your experience is valuable.' },
  success: { title: 'Review submitted!', subtitle: 'Redirecting to country page...' },
  dialog: { title: 'Select nationality first', subtitle: 'To see filtered reviews, tell us your nationality.' },
}
