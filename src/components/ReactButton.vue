<template>
  <div v-if="error">error loading button</div>
  <div v-else ref="root">loading button</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount, onUpdated } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'

const props = defineProps<{ text: string }>()

const firstLoad = new Promise((resolve) => setTimeout(resolve, 1000))

async function fetchButton() {
  await firstLoad

  return (await import('provider/Button')).default
}

const root = ref(null)
const error = ref(false)
const ButtonComponent = ref(null)

function updateReactComponent() {
  if (!ButtonComponent.value || !!error.value) return

  const container = createRoot(root.value!)
  container.render(React.createElement(ButtonComponent.value, props))
}

function unmountReactComponent() {
  root.value && ReactDOM.unmountComponentAtNode(root.value)
}

onMounted(updateReactComponent)
onUpdated(updateReactComponent)
onBeforeMount(unmountReactComponent)

fetchButton()
  .then((button) => {
    ButtonComponent.value = button
    updateReactComponent()
  })
  .catch((err) => {
    console.log(err)
    error.value = err
  })
</script>
