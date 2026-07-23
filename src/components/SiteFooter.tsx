import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import profile from '../data/site.json';

export function SiteFooter() {
  return (
    <HStack
      gap={4}
      wrap="wrap"
      hAlign="between"
      vAlign="center"
      paddingBlock={5}
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <Text type="supporting" size="sm">
        © {new Date().getFullYear()} {profile.name}
      </Text>
      <Text type="supporting" size="sm">
        built by hand (and a few agents)
      </Text>
      <Link href="https://github.com/RideneFiras/RideneFiras.github.io" isExternalLink isStandalone>
        view source
      </Link>
    </HStack>
  );
}
