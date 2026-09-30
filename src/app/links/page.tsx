import { links } from "@/content";
import { RowGroup } from "@/components/index/RowHighlight";
import IndexRow, { RowList, RowTag } from "@/components/index/IndexRow";
import s from "./page.module.css";

export default function LinksPage() {
  return (
    <div className={`container-x ${s.page}`}>
      <header className={s.head}>
        <h1 className={s.title}>Links</h1>
        <p className={`body-lg ${s.lede}`}>
          Useful links and tools I&apos;ve built or use.
        </p>
      </header>

      <RowGroup>
        <RowList>
          {links.map((link, i) => (
            <IndexRow
              key={link.name}
              id={link.name}
              index={i + 1}
              title={link.name}
              subtitle={link.description}
              href={link.href}
              external={link.external}
              end={<RowTag>{link.external ? "external" : "internal"}</RowTag>}
            />
          ))}
        </RowList>
      </RowGroup>
    </div>
  );
}
