export function useNationality() {
  const store = useUserStore()

  onMounted(() => {
    store.loadFromStorage()
  })

  return {
    nationality: computed(() => store.nationality),
    setNationality: store.setNationality.bind(store),
  }
}
