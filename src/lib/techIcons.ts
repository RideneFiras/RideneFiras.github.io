const ICONS: Record<string, string> = {
  python: 'python', fastapi: 'fastapi', react: 'react', 'next.js': 'nextdotjs',
  typescript: 'typescript', postgresql: 'postgresql', pgvector: 'postgresql',
  supabase: 'supabase', twilio: 'twilio', stripe: 'stripe', redis: 'redis',
  docker: 'docker', langchain: 'langchain', 'anthropic claude': 'anthropic',
  'claude code': 'claude', gemini: 'googlegemini', n8n: 'n8n', notion: 'notion',
  'notion mcp': 'notion', github: 'github', 'git/github': 'github', 'github cli': 'github',
  'github actions': 'githubactions', 'github models (gpt-4o-mini)': 'github',
  elasticsearch: 'elasticsearch', kibana: 'kibana', tensorflow: 'tensorflow',
  pytorch: 'pytorch', 'scikit-learn': 'scikitlearn', mlflow: 'mlflow',
  opencv: 'opencv', tailwindcss: 'tailwindcss', telegram: 'telegram',
  railway: 'railway', vercel: 'vercel', gradio: 'gradio', odoo: 'odoo',
  'java (spring boot)': 'spring', 'js (node.js)': 'nodedotjs', pandas: 'pandas',
  make: 'make', 'google maps api': 'googlemaps', render: 'render',
};

export function techIconSlug(name: string): string | undefined {
  return ICONS[name.trim().toLowerCase()];
}

export function splitStack(stack: string): string[] {
  return stack.split(',').map((s) => s.trim()).filter(Boolean);
}
