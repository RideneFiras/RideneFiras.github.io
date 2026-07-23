const MARQUEE: Array<[string, string | null]> = [
  ['Python', 'python'], ['FastAPI', 'fastapi'], ['LangChain', 'langchain'],
  ['Claude Code', 'claude'], ['CrewAI', null], ['OpenAI', null],
  ['React', 'react'], ['Next.js', 'nextdotjs'], ['TypeScript', 'typescript'],
  ['PostgreSQL', 'postgresql'], ['Supabase', 'supabase'], ['Docker', 'docker'],
  ['n8n', 'n8n'], ['Redis', 'redis'], ['PyTorch', 'pytorch'],
  ['TensorFlow', 'tensorflow'], ['MLflow', 'mlflow'], ['Elasticsearch', 'elasticsearch'],
];

function Item({ name, slug }: { name: string; slug: string | null }) {
  return (
    <span className="marquee-item">
      {slug ? <img className="tech-icon" src={`/assets/icons/${slug}.svg`} alt="" aria-hidden="true" /> : null}
      {name}
    </span>
  );
}

export function TechMarquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {MARQUEE.map(([name, slug]) => (
          <Item key={`a-${name}`} name={name} slug={slug} />
        ))}
        {MARQUEE.map(([name, slug]) => (
          <Item key={`b-${name}`} name={name} slug={slug} />
        ))}
      </div>
    </div>
  );
}
