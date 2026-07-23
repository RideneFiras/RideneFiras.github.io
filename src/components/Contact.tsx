import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { SectionEyebrow } from './SectionEyebrow';
import profile from '../data/site.json';

export function Contact() {
  return (
    <Section id="contact" variant="transparent" padding={0}>
      <VStack gap={6} paddingBlock={10} hAlign="center" vAlign="center">
        <SectionEyebrow>04 / contact</SectionEyebrow>
        <Heading level={2} type="display-1" justify="center">
          <span className="accent-text">Let's build.</span>
        </Heading>
        <HStack gap={3} wrap="wrap" hAlign="center">
          <Button label="Email me" variant="primary" size="lg" href={`mailto:${profile.links.email}`} />
          <Button
            label="GitHub"
            variant="secondary"
            size="lg"
            href={profile.links.github}
            target="_blank"
            rel="noopener"
          />
          <Button
            label="LinkedIn"
            variant="secondary"
            size="lg"
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener"
          />
          <Button
            label="YouTube"
            variant="secondary"
            size="lg"
            href={profile.links.youtube}
            target="_blank"
            rel="noopener"
          />
        </HStack>
      </VStack>
    </Section>
  );
}
