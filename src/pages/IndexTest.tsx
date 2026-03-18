import { HeaderVariants } from '@/components/blocks/homepage/Header';
import { HeroVariants } from '@/components/blocks/homepage/Hero';
import { FeaturesVariants } from '@/components/blocks/homepage/Features';
import { ServicesVariants } from '@/components/blocks/homepage/Services';
import { OpeningHoursVariants } from '@/components/blocks/homepage/OpeningHours';
import { ContactVariants } from '@/components/blocks/homepage/Contact';
import { FooterCTAVariants } from '@/components/blocks/homepage/FooterCTA';
import { FooterVariants } from '@/components/blocks/homepage/Footer';
import homepageBlocksConfig from '@/config/pages/homepage-config.json';

// Types pour les blocs
interface BlockConfig {
  type: string;
  variant: string;
  props: any;
  _comment?: string;
}

interface PageConfig {
  pageBlocks: BlockConfig[];
}

// Map des composants disponibles par type
const BLOCK_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  Header: HeaderVariants,
  Hero: HeroVariants,
  Features: FeaturesVariants,
  Services: ServicesVariants,
  OpeningHours: OpeningHoursVariants,
  Contact: ContactVariants,
  FooterCTA: FooterCTAVariants,
  Footer: FooterVariants,
};

// Renderer de blocs dynamique
const BlockRenderer = ({ block, index }: { block: BlockConfig; index: number }) => {
  const blockType = BLOCK_COMPONENTS[block.type];

  if (!blockType) {
    console.warn(`Block type "${block.type}" not found`);
    return null;
  }

  const Component = blockType[block.variant];

  if (!Component) {
    console.warn(`Variant "${block.variant}" not found for block type "${block.type}"`);
    return null;
  }

  return <Component key={`${block.type}-${block.variant}-${index}`} {...block.props} />;
};

const IndexTest = () => {
  const config = homepageBlocksConfig as PageConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Rendu dynamique des blocs */}
      {config.pageBlocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
    </div>
  );
};

export default IndexTest;
