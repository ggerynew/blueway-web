import type { Dictionary } from '@/lib/i18n';

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-ink-muted md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-medium text-ink">{dict.footer.company}</p>
          <p>{dict.footer.address}</p>
          <p>{dict.footer.billing}</p>
        </div>
        <div className="md:text-right">
          <p>
            <a href={`tel:${dict.footer.phone.replace(/\s/g, '')}`} className="hover:text-ink">
              {dict.footer.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${dict.footer.email}`} className="hover:text-ink">
              {dict.footer.email}
            </a>
          </p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} {dict.footer.company} {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
