import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Badge } from '@astryxdesign/core/Badge';
import site from '../data/profile.json';
import profile from '../data/site.json';
import certifications from '../data/certifications.json';
import education from '../data/education.json';

export function About() {
  return (
    <Section id="about" variant="transparent" padding={0}>
      <VStack gap={6} paddingBlock={8}>
        <HStack gap={2} vAlign="center">
          <Text type="label" color="accent">
            01 / about
          </Text>
        </HStack>
        <Heading level={2} type="display-3">
          Behind the agents
        </Heading>

        <Grid columns={{ minWidth: 260, max: 3 }} gap={6}>
          <VStack gap={3} hAlign="start">
            <Avatar src="/assets/firas.jpg" name={profile.name} size="xl" />
            <Text type="label">{profile.name}</Text>
            <Text type="supporting">
              {profile.role} · {profile.location}
            </Text>
            <HStack gap={2} wrap="wrap">
              {profile.languages.map((lang) => (
                <Badge key={lang} variant="neutral" label={lang} />
              ))}
            </HStack>
          </VStack>

          <VStack gap={4} maxWidth={640}>
            {site.about.map((paragraph) => (
              <Text key={paragraph} type="body" size="lg" color="secondary" as="p">
                {paragraph}
              </Text>
            ))}

            <VStack gap={1}>
              {education.map((ed) => (
                <HStack key={ed.institution} gap={2} wrap="wrap" vAlign="center">
                  <Text type="label">{ed.degree}</Text>
                  <Text type="supporting">
                    · {ed.institution} · {ed.dateRange}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Grid>

        <Collapsible
          trigger={
            <Text type="label">{`${certifications.total} certifications`}</Text>
          }
          defaultIsOpen={false}
        >
          <VStack paddingBlock={3}>
            <Grid columns={{ minWidth: 240 }} gap={2}>
              {certifications.list.map((cert) => (
                <VStack key={cert.name} gap={0.5}>
                  <Text type="body" size="sm">
                    {cert.name}
                  </Text>
                  <Text type="supporting" size="xsm">
                    {cert.issuer}
                  </Text>
                </VStack>
              ))}
            </Grid>
          </VStack>
        </Collapsible>
      </VStack>
    </Section>
  );
}
