import Link from "next/link";
export default function NotFound() {
  return (
    <section className="card empty">
      <h1>Pagina niet gevonden</h1>
      <p>Dit adres bestaat niet in je planner.</p>
      <Link className="button primary" href="/">
        Naar Dashboard
      </Link>
    </section>
  );
}
