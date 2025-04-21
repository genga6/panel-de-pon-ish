cd /workspaces/panel-de-pon-ish/frontend
pnpm create vite@latest . -- --template react-swc-ts
pnpm install
pnpm add -D tailwindcss @tailwindcss/vite
pnpm approve-builds
pnpm rebuild
echo -e "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > src/index.css
