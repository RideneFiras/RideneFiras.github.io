import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { Card } from '@astryxdesign/core/Card';
import { TechChipRow } from './TechChip';
import experience from '../data/experience.json';
import skills from '../data/skills.json';
import { splitStack } from '../lib/techIcons';

export function Experience() {
  return (
    <Section id="experience" variant="transparent" padding={0}>
      <VStack gap={6} paddingBlock={8}>
        <Text type="label" color="accent">
          03 / experience
        </Text>
        <Heading level={2} type="display-3">
          Where I've shipped
        </Heading>

        <VStack gap={0} maxWidth={760}>
          {experience.map((xp, i) => (
            <VStack key={xp.id} gap={3} paddingBlock={5}>
              <VStack gap={1}>
                <Text type="label" size="lg">
                  {xp.title}
                </Text>
                <Text type="supporting">
                  {xp.org} · {xp.dateRange}
                </Text>
              </VStack>
              <VStack gap={1}>
                {xp.bullets.map((b) => (
                  <Text key={b} type="body" size="sm" color="secondary" as="p">
                    · {b}
                  </Text>
                ))}
              </VStack>
              <TechChipRow stack={splitStack(xp.stack)} />
              {i < experience.length - 1 && <Divider />}
            </VStack>
          ))}
        </VStack>

        <Grid columns={{ minWidth: 240 }} gap={4}>
          {skills.map((group) => (
            <Card key={group.category} variant="muted" padding={4}>
              <VStack gap={2}>
                <Text type="label">{group.category}</Text>
                <Text type="supporting" size="sm">
                  {group.items}
                </Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Section>
  );
}
