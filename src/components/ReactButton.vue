<template>
  <div v-if="error">error loading button</div>
  <div v-else ref="root">loading button...</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount, onUpdated } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'

const props = defineProps<{ text?: string }>()

async function fetchButton() {
  const Button = (await import('provider/Button')).default as ({ text }: { text?: string }) => JSX.Element
  return Button
}

const root = ref<HTMLDivElement | null>(null)
const error = ref<boolean>(false)
const ButtonComponent = ref<(({ text }: { text?: string }) => JSX.Element) | null>(null)

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
  .catch((err: unknown) => {
    error.value = true
    throw err
  })
</script>
