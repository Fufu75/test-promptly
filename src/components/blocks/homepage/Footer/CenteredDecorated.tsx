import { FooterProps } from './SplitBrand';

export const FooterCenteredDecorated = ({
  brandName,
  accentColor,
}: FooterProps) => {
  return (
    <footer
      className="border-t-2"
      style={{ borderColor: accentColor }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-border" />
            <span className="font-serif font-semibold">{brandName}</span>
            <div className="h-px w-8 bg-border" />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
