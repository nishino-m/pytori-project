<template>
  <div class="shiritori-container">
    <!-- 戻るボタン -->
    <div class="back-button-container">
      <button @click="goBack" class="back-button">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">現在のランキング表に戻る</span>
      </button>
    </div>

    <h1 class="title">Pythonしりとり開始！</h1>
    <h2 class="repository-name">{{ repositoryName }}</h2>
    <ul class="turn-list">
      <li v-for="turn in turns" :key="turn.no" class="turn-item">
        <div class="turn-label">
          🎮 Turn {{ turn.no }}
          <span v-if="turn.label" class="sub-label">({{ turn.label }})</span>
        </div>
        <div class="turn-row">
          <span class="arrow">≫</span>
          <span class="word">しりとりワード：{{ turn.word }}</span>
        </div>
        <div>  
          <p class="status">✅OK!</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

interface ShiritoriItem {
  repository_name: string
  status: number
  current_word: string
  merged_on: string
}

const route = useRoute()
const router = useRouter()
const repositoryName = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const shiritoriItems = ref<ShiritoriItem[]>([])

onMounted(async () => {
  try {
    const res = await axios.get<ShiritoriItem[]>(API_ENDPOINTS.repositorySummary(repositoryName))
    shiritoriItems.value = res.data
  } catch (err) {
    console.error('データ取得エラー', err)
    // APIエラーが発生した場合のモックデータ
    shiritoriItems.value = [
      {
        repository_name: repositoryName,
        status: 1,
        current_word: 'python',
        merged_on: new Date().toISOString()
      },
      {
        repository_name: repositoryName,
        status: 1,
        current_word: 'numpy',
        merged_on: new Date().toISOString()
      }
    ]
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

const goBack = () => {
  router.push({ name: 'Ranking' })
}
</script>

<style scoped>
.shiritori-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.back-button-container {
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.back-button:active {
  transform: translateY(0);
}

.back-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

.back-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.title {
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.repository-name {
  color: #4a5568;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  padding: 10px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.turn-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.turn-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.turn-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
}

.turn-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.turn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.arrow {
  color: #667eea;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 8px 0;
}

.word {
  font-size: 1.3rem;
  color: #4a5568;
  font-weight: 600;
  margin: 8px 0;
}

.status {
  color: #38a169;
  font-weight: 600;
  margin: 8px 0 0 0;
  font-size: 1rem;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .shiritori-container {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .repository-name {
    font-size: 1.2rem;
  }
  
  .back-button {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .turn-item {
    padding: 16px;
  }
}
</style>
