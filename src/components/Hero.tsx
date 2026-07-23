import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import site from '../data/profile.json';
import profile from '../data/site.json';

export function Hero() {
  return (
    <Section variant="transparent" padding={0}>
      <VStack gap={5} paddingBlock={10} maxWidth={880}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge variant="success" label={profile.status.availability} />
          <Text type="supporting">{site.hero.eyebrow}</Text>
        </HStack>
        <Heading level={1} type="display-1">
          {site.hero.headline}
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
