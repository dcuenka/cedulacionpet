import { toggleModule } from "@/lib/actions/clinical";

type Mod = { field: "showCedula" | "showCarnet" | "showHistoria"; label: string; desc: string };

const MODS: Mod[] = [
  { field: "showCedula", label: "Cédula de identidad animal", desc: "Tarjeta de identidad digital de la mascota." },
  { field: "showCarnet", label: "Carnet de salud", desc: "Vacunas y desparasitaciones." },
  { field: "showHistoria", label: "Historia clínica", desc: "Consultas y atenciones veterinarias." },
];

// Interruptores para activar qué módulos ve el tutor en su carnet digital.
export default function ModuleToggles({
  record,
}: {
  record: { id: string; showCedula: boolean; showCarnet: boolean; showHistoria: boolean };
}) {
  return (
    <div className="rounded-xl border-2 border-teal/30 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-navy">🧩 Módulos activos para el tutor</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Activa lo que el tutor puede ver en su enlace. Para quien ya tiene cédula,
        basta con activar el carnet o la historia.
      </p>
      <div className="mt-4 space-y-2">
        {MODS.map((m) => {
          const on = record[m.field];
          return (
            <form
              key={m.field}
              action={toggleModule}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-navy">{m.label}</p>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="field" value={m.field} />
              <input type="hidden" name="value" value={on ? "false" : "true"} />
              <button
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  on
                    ? "bg-teal text-white hover:bg-teal-600"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {on ? "Activado ✓" : "Desactivado"}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
