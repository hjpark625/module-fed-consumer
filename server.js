const express = require('express')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const app = express()

const distPath = path.join(__dirname, 'dist')
const indexHtmlPath = path.join(distPath, 'index.html')

if (!fs.existsSync(distPath) || !fs.existsSync(indexHtmlPath)) {
  console.error(
    chalk.red(
      `The ${chalk.yellow('dist')} folder or ${chalk.yellow('index.html')} doesn't exist. Please run ${chalk.blue('pnpm run build')} first.`
    )
  )
  process.exit(1)
}

app.use(express.static(distPath))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.listen(3001, () => {
  console.log('Server is running on port 3001')
})
