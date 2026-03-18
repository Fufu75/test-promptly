import { FooterProps } from './SplitBrand';

export const FooterCenteredSimple = ({
  brandName,
  accentColor,
}: FooterProps) => {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-1 h-4 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}
          </p>
        </div>
      </div>
    </footer>
  );
};
