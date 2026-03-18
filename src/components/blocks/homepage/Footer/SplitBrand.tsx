export interface FooterProps {
  brandName: string;
  accentColor: string;
  showSocials?: boolean;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export const FooterSplitBrand = ({
  brandName,
  accentColor,
}: FooterProps) => {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg"
              style={{ backgroundColor: `${accentColor}20` }}
            />
            <span className="font-semibold">{brandName}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
