<template>
  <q-page class="flex flex-center">
    <div style="font-size: 24px; text-align: center;">
      {{ backendMessage }}
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const backendMessage = ref('Loading...')

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/status')
    backendMessage.value = response.data
  } catch {
    backendMessage.value = 'Failed to load backend message'
  }
})
</script>
