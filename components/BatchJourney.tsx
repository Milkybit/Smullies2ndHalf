import Link from "next/link";
import { Icon } from "./ui";

export function BatchJourney({
  active,
}: {
  active: "batch" | "shopping" | "cooking";
}) {
  const steps = [
    ["batch", "/batch", "Samenstellen", "Gerechten & porties"],
    ["shopping", "/shopping", "Boodschappen", "Alles op één lijst"],
    ["cooking", "/cooking", "Kookdag", "Koken & verdelen"],
  ];
  return (
    <nav className="batch-journey" aria-label="Van recept naar maaltijd">
      {steps.map(([id, href, name, hint], index) => (
        <Link
          key={id}
          href={href}
          aria-current={id === active ? "step" : undefined}
        >
          <span className="journey-number">0{index + 1}</span>
          <span>
            <strong>{name}</strong>
            <small>{hint}</small>
          </span>
          <Icon name="arrow" size={17} />
        </Link>
      ))}
    </nav>
  );
}
