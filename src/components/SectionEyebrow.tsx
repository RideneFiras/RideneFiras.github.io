import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

export function SectionEyebrow({ children }: { children: string }) {
  return (
    <HStack gap={2} vAlign="center">
      <span
        aria-hidden="true"
        style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-accent)', flex: 'none' }}
      />
      <Text type="code" size="sm" color="accent">
        {children}
      </Text>
    </HStack>
  );
}
