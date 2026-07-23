import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import site from '../data/profile.json';
import profile from '../data/site.json';

function HighlightedHeadline({ text, highlight }: { text: string; highlight: string }) {
  const i = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="accent-text">{text.slice(i, i + highlight.length)}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

export function Hero() {
  return (
    <Section variant="transparent" padding={0}>
      <VStack gap={5} paddingBlock={10} maxWidth={880} style={{ position: 'relative' }}>
        <div className="hero-grid-bg" aria-hidden="true" />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge variant="success" label={profile.status.availability} />
          <Text type="code" size="sm" color="secondary">
            {site.hero.eyebrow}
          </Text>
        </HStack>
        <Heading level={1} type="display-1" textWrap="balance">
          <HighlightedHeadline text={site.hero.headline} highlight="agent systems" />
        </Heading>
        <Text type="large" color="secondary">
          {site.hero.sub}
        </Text>
        <HStack gap={3} wrap="wrap">
          <Button label="See the work" variant="primary" size="lg" href="#work" />
          <Button
            label="Resume (PDF)"
            variant="secondary"
            size="lg"
            href={`/${profile.resume}`}
            target="_blank"
            rel="noopener"
          />
          <Button label="Get in touch" variant="ghost" size="lg" href="#contact" />
        </HStack>
      </VStack>
    </Section>
  );
}
