<template>
  <div class="shiritori-container">
    <h1 class="title">Pythonしりとり開始！</h1>
    <h2 class="repository-name">{{ repositoryName }}</h2>
    <ul class="turn-list">
      <li v-for="turn in turns" :key="turn.no" class="turn-item">
        <div class="turn-label">
          🎮 Turn {{ turn.no }}
          <span v-if="turn.label" class="sub-label">({{ turn.label }})</span>
        </div>
        <span class="arrow">≫</span>
        <span class="word">しりとりワード：{{ turn.word }}</span>
        <div>  
          <p class="status">✅OK!</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

interface ShiritoriItem {
  repository_name: string
  status: number
  current_word: string
  merged_on: string
}

const route = useRoute()
const repositoryName = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const shiritoriItems = ref<ShiritoriItem[]>([])

onMounted(async () => {
  try {
    const res = await axios.get<ShiritoriItem[]>(API_ENDPOINTS.repositorySummary(repositoryName))
    shiritoriItems.value = res.data
  } catch (err) {
    console.error('データ取得エラー', err)
  }
})

const sortedItems = computed(() =>
  shiritoriItems.value
    .slice()
    .sort((a: ShiritoriItem, b: ShiritoriItem) => new Date(a.merged_on).getTime() - new Date(b.merged_on).getTime())
)

const turns = computed(() =>
  sortedItems.value.map((item: ShiritoriItem, idx: number, arr: ShiritoriItem[]) => ({
    no: idx + 1,
    label: idx === 0 ? '最初' : `前: ${arr[idx - 1].current_word}`,
    word: item.current_word
  }))
)
</script>
