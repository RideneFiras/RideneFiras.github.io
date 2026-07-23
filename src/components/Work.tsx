import { useMemo, useState } from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { TechChipRow } from './TechChip';
import projects from '../data/projects.json';
import { splitStack } from '../lib/techIcons';

const TAG_ORDER = ['agents', 'voice', 'automation', 'ml', 'product'] as const;
const TAG_LABELS: Record<string, string> = {
  agents: 'agents',
  voice: 'voice & chat',
  automation: 'automation',
  ml: 'ml & data',
  product: 'product',
};

export function Work() {
  const [tag, setTag] = useState('all');

  const availableTags = useMemo(() => {
    const present = new Set(projects.flatMap((p) => p.tags));
    return TAG_ORDER.filter((t) => present.has(t));
  }, []);

  const filtered = useMemo(
    () => (tag === 'all' ? projects : projects.filter((p) => p.tags.includes(tag))),
    [tag],
  );

  return (
    <Section id="work" variant="transparent" padding={0}>
      <VStack gap={6} paddingBlock={8}>
        <Text type="label" color="accent">
          02 / work
        </Text>
        <Heading level={2} type="display-3">
          Everything I've shipped
        </Heading>

        <SegmentedControl label="Filter projects by category" value={tag} onChange={setTag}>
          <SegmentedControlItem value="all" label="all" />
          {availableTags.map((t) => (
            <SegmentedControlItem key={t} value={t} label={TAG_LABELS[t] ?? t} />
          ))}
        </SegmentedControl>

        <Grid columns={{ minWidth: 340 }} gap={4}>
          {filtered.map((p) => (
            <Card key={p.id} variant="default" padding={5}>
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text type="supporting" size="sm">
                    {p.domain}
                  </Text>
                  <Heading level={3}>{p.title}</Heading>
                </VStack>
                <Text type="body" color="secondary">
                  {p.oneliner}
                </Text>
                <VStack gap={1}>
                  {p.bullets.map((b) => (
                    <Text key={b} type="body" size="sm" as="p">
                      · {b}
                    </Text>
                  ))}
                </VStack>
                <TechChipRow stack={splitStack(p.stack)} />
                {(p.github || p.demo) && (
                  <HStack gap={4}>
                    {p.github && (
                      <Link href={p.github} isExternalLink isStandalone>
                        Source
                      </Link>
                    )}
                    {p.demo && (
                      <Link href={p.demo} isExternalLink isStandalone>
                        Demo
                      </Link>
                    )}
                  </HStack>
                )}
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Section>
  );
}
