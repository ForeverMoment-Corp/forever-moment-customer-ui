import { useRef, useState } from "react";
import { Check, Loader2, MapPin, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedLocation, setVenuePincode } from "@/features/home/store/actions";
import { lookupPincode } from "@/features/experiences/store/api";

const sans = { fontFamily: "'Jost', sans-serif" } as const;

interface Location {
  id?: number;
  name: string;
}

type Status = { kind: "idle" } | { kind: "checking" } | { kind: "missing"; pincode: string } | { kind: "error" };

/**
 * "Where's the party?" pincode, set once in the header. A pincode we cover is saved (every
 * experience page then checks it automatically) and switches the header city to the pincode's city.
 */
export default function PincodeField({ locations, onSaved }: { locations: Location[]; onSaved?: () => void }) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => state.home?.venuePincode ?? null);
  const [value, setValue] = useState(saved?.pincode ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const requestId = useRef(0);

  const isSaved = !!saved && saved.pincode === value;

  const submit = async () => {
    if (value.length !== 6 || status.kind === "checking") return;
    const id = ++requestId.current;
    setStatus({ kind: "checking" });
    try {
      const area = await lookupPincode(value);
      if (id !== requestId.current) return;
      if (!area) {
        setStatus({ kind: "missing", pincode: value });
        return;
      }
      dispatch(setVenuePincode({ pincode: value, areaName: area.areaName ?? null, locationId: area.locationId ?? null }));
      // The pincode decides the city, so listings match where the party is.
      const city = locations.find((l) => l.id === area.locationId);
      if (city) dispatch(setSelectedLocation(city.name));
      setStatus({ kind: "idle" });
      onSaved?.();
    } catch {
      if (id === requestId.current) setStatus({ kind: "error" });
    }
  };

  return (
    <div style={sans}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className={`flex h-10 items-center gap-2 rounded-xl border bg-white pl-3 pr-1 transition-colors focus-within:border-gold ${
          isSaved ? "border-leaf" : status.kind === "missing" ? "border-rose" : "border-sand"
        }`}
      >
        <MapPin size={14} className="shrink-0 text-gold" />
        <input
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            requestId.current++;
            setStatus({ kind: "idle" });
          }}
          placeholder="Venue pincode"
          aria-label="Venue pincode"
          className="min-w-0 flex-1 bg-transparent text-[0.84rem] text-ink outline-none placeholder:text-umber"
        />
        {isSaved ? (
          <span className="flex items-center gap-1 px-2 text-[0.72rem] font-semibold text-leaf">
            <Check size={13} strokeWidth={3} /> Saved
          </span>
        ) : (
          <button
            type="submit"
            disabled={value.length !== 6 || status.kind === "checking"}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.74rem] font-semibold text-burgundy transition-colors hover:bg-rose-light disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {status.kind === "checking" && <Loader2 size={12} className="animate-spin" />}
            {status.kind === "checking" ? "Checking" : "Apply"}
          </button>
        )}
      </form>

      <div aria-live="polite" className="mt-1.5 min-h-[1rem] text-[0.7rem] leading-snug">
        {isSaved ? (
          <p className="flex items-center justify-between gap-2 text-umber">
            <span className="truncate">
              {saved?.areaName ? `${saved.areaName} · ` : ""}checked on every experience
            </span>
            <button
              type="button"
              onClick={() => {
                dispatch(setVenuePincode(null));
                setValue("");
              }}
              className="inline-flex shrink-0 items-center gap-0.5 font-medium text-taupe hover:text-burgundy"
            >
              <X size={11} /> Remove
            </button>
          </p>
        ) : status.kind === "missing" ? (
          <p className="text-burgundy">We don't set up at {status.pincode} yet. Try a nearby pincode.</p>
        ) : status.kind === "error" ? (
          <p className="text-umber">Couldn't check right now. Please try again.</p>
        ) : (
          <p className="text-umber">We'll check it on every experience for you.</p>
        )}
      </div>
    </div>
  );
}
