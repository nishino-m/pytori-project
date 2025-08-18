<template>
  <div class="ranking-container">
    <RankingDate />
    <div class="chart-container">
      <Bar v-if="items.length" :data="chartData" :options="chartOptions" />
      <div class="chart-hint">※グラフをクリックしてください</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RankingDate from '@/components/RankingDate.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import { type ChartData, type ChartOptions } from 'chart.js'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config/api'

type RepoSummary = {
  repository_name: string
  status: number
  current_word: string
  merged_on: string
}

type ProcessedRepoSummary = {
  repository_name: string
  shiritori_count: number
  last_word: string
  last_merged: string
}

const router = useRouter()
const items = ref<ProcessedRepoSummary[]>([])

const fetchSummary = async () => {
  try {
    const res = await axios.get<RepoSummary[]>(API_ENDPOINTS.summary)   
    const repoCounts = res.data.reduce((acc, item) => {
      if (!acc[item.repository_name]) {
        acc[item.repository_name] = {
          repository_name: item.repository_name,
          shiritori_count: 0,
          last_word: item.current_word,
          last_merged: item.merged_on
        }
      }
      acc[item.repository_name].shiritori_count++
      return acc
    }, {} as Record<string, any>)
    
    items.value = Object.values(repoCounts).sort((a, b) => b.shiritori_count - a.shiritori_count)
  } catch (err) {
    console.error('API取得エラー:', err)
  }
}

onMounted(fetchSummary)

const chartData = computed<ChartData<'bar'>>(() => {
  const max = Math.max(...items.value.map(i => i.shiritori_count))

  let prevScore: number | null = null
  let rank = 1
  let displayRank = 1

  const labels = items.value.map((item, idx) => {
    if (item.shiritori_count !== prevScore) {
      displayRank = rank
    }
    const crown = item.shiritori_count === max ? '👑 ' : ''
    const label = `${crown}${displayRank}位 ${item.repository_name}`
    prevScore = item.shiritori_count
    rank++
    return label
  })

  return {
    labels,
    datasets: [
      {
        label: 'しりとり回数',
        data: items.value.map(i => i.shiritori_count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }
})

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { 
      display: true, 
      text: '順位（リポジトリ別）',
      font: {
        size: window.innerWidth < 768 ? 14 : 16
      }
    },
  },
  onClick: (_, elements) => {
    if (!elements.length) return
    const idx = elements[0].index
    const item = items.value[idx]
    router.push({ name: 'Shiritori', params: { id: item.repository_name } })
  },
  onHover: (_evt, elements, chart) => {
    const canvas = chart.canvas as HTMLCanvasElement
    canvas.style.cursor = elements.length ? 'pointer' : 'default'
  },
  scales: {
    x: {
      beginAtZero: true,
      title: { 
        display: true, 
        text: 'しりとり回数',
        font: {
          size: window.innerWidth < 768 ? 12 : 14
        }
      },
      ticks: { 
        stepSize: 1, 
        precision: 0,
        font: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      },
    },
    y: {
      title: { display: false },
      ticks: {
        font: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      }
    },
  },
} satisfies ChartOptions<'bar'>
</script>

<style scoped>
.ranking-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--gap);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  height: min(60vh, 400px);
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 6px 12px rgba(0, 0, 0, 0.12);
}

.chart-hint {
  margin-top: 30px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .ranking-container {
    padding: calc(var(--gap) * 0.8);
  }
  
  .chart-container {
    height: min(55vh, 350px);
    padding: 14px;
  }
}

@media (max-width: 768px) {
  .ranking-container {
    padding: calc(var(--gap) * 0.6);
  }
  
  .chart-container {
    height: min(50vh, 300px);
    padding: 12px;
    border-radius: 6px;
  }
  
  .chart-hint {
    margin-top: 20px;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .ranking-container {
    padding: calc(var(--gap) * 0.5);
  }
  
  .chart-container {
    height: min(45vh, 250px);
    padding: 10px;
    border-radius: 4px;
  }
  
  .chart-hint {
    margin-top: 16px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .ranking-container {
    padding: 12px;
  }
  
  .chart-container {
    height: min(40vh, 200px);
    padding: 8px;
  }
  
  .chart-hint {
    margin-top: 12px;
    font-size: 0.75rem;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .chart-container {
    height: min(70vh, 300px);
  }
  
  .chart-hint {
    margin-top: 16px;
  }
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .chart-container {
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 3px 6px rgba(0, 0, 0, 0.15);
  }
}
</style>
