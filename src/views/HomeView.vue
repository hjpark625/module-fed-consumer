<template>
  <div>
    <h1>Home</h1>
    <p>Welcome to the Home page!</p>
    <p>{{ message }}</p>
    <react-button v-if="showButton" :text="message" />
  </div>
</template>

<script lang="ts" setup>
import ReactButton from '@/components/ReactButton.vue'
import { ref } from 'vue'

const message = ref('Hello Vue3')
const showButton = ref(true)
</script>
