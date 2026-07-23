import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { techIconSlug } from '../lib/techIcons';

export function TechChipRow({ stack }: { stack: string[] }) {
  return (
    <HStack gap={3} wrap="wrap">
      {stack.map((name) => {
        const slug = techIconSlug(name);
        return (
          <HStack key={name} gap={1} vAlign="center">
            {slug ? (
              <img className="tech-icon" src={`/assets/icons/${slug}.svg`} alt="" aria-hidden="true" />
            ) : null}
            <Text type="supporting" size="sm">
              {name}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
}
