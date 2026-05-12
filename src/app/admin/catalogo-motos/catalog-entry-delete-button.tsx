"use client";

import { deleteMotorcycleCatalogEntry } from "@/app/admin/catalogo-motos/actions";
import { Button } from "@/components/ui/button";

export function CatalogEntryDeleteButton({ entryId }: { entryId: string }) {
  return (
    <form
      action={deleteMotorcycleCatalogEntry}
      onSubmit={(e) => {
        if (
          !confirm(
            "Remover esta entrada do catálogo? Motas que a usavam mantêm marca, modelo e ano na ficha; perde-se só a ligação ao catálogo.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="entry_id" value={entryId} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        Apagar
      </Button>
    </form>
  );
}
