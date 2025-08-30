// pages/PublicProfileSlug.tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";

// === Типи даних, якими оперуємо на сторінці
type Service = {
  name: string;
  durationMin: number;
  price: number;
  currency?: string;
};

type Profile = {
  slug: string;
  displayName: string;
  services: Service[];
};

type PageProps = {
  profile: Profile | null;
  slug: string;
};

// === Тимчасові демо-дані (залишаться як fallback)
const DEMO: Record<string, Profile> = {
  test: {
    slug: "test",
    displayName: "Demo",
    services: [
      { name: "Consultation", durationMin: 30, price: 50, currency: "PLN" },
      { name: "Coaching", durationMin: 60, price: 120, currency: "PLN" },
    ],
  },
  oleksandrheletskyi: {
    slug: "oleksandrheletskyi",
    displayName: "Oleksandr Heletskyi",
    services: [
      { name: "Consultation", durationMin: 60, price: 100, currency: "PLN" },
      { name: "Strategy session", durationMin: 90, price: 180, currency: "PLN" },
    ],
  },
};

// === SSR: пробуємо взяти реальні дані з API, інакше — DEMO
export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const slug = String(ctx.query.slug ?? "");

  let profile: Profile | null = null;

  // 1) Якщо задано URL API у змінній середовища — пробуємо реальний бекенд
  // Напр.: PUBLIC_API_URL = https://api.sfero.app/public
  const apiBase =
    process.env.PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_API_URL ||
    "";

  if (apiBase && slug) {
    try {
      const url = `${apiBase.replace(/\/$/, "")}/profiles/${encodeURIComponent(
        slug
      )}`;
      const res = await fetch(url, {
        headers: { accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();

        // --- АДАПТЕР під твій відгук API ---
        // Зведи поля відповіді до наших типів.
        profile = {
          slug: data.slug ?? slug,
          displayName: data.name ?? data.displayName ?? slug,
          services: (Array.isArray(data.services) ? data.services : []).map(
            (s: any) => ({
              name: String(s.name ?? "Service"),
              durationMin:
                Number(s.durationMin ?? s.duration ?? s.duration_minutes) || 60,
              price: Number(s.price ?? 0),
              currency: s.currency ?? data.currency ?? "PLN",
            })
          ),
        };
      }
    } catch (_) {
      // ігноруємо — підемо у DEMO
    }
  }

  // 2) Fallback на DEMO
  if (!profile) profile = DEMO[slug] ?? null;

  return { props: { profile, slug } };
};

// === Проста сторінка з fallback'ом "не знайдено"
export default function PublicProfile({ profile, slug }: PageProps) {
  const title = profile
    ? `${profile.displayName} — Sfero`
    : `Profile not found — Sfero`;

  return (
    <main style={{ maxWidth: 860, margin: "48px auto", fontFamily: "system-ui" }}>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="index,follow" />
        {/* опц.: однаковий favicon всюди */}
        {/* <link rel="icon" href="https://sfero-public.vercel.app/favicon.ico" /> */}
      </Head>

      <h1>Public profile: {profile ? profile.slug : slug}</h1>

      {!profile ? (
        <p>Профіль не знайдено або поки не опублікований.</p>
      ) : (
        <>
          <p>Public data from SSR. Replace with real public API.</p>
          <h2>Services</h2>
          {profile.services.length === 0 ? (
            <p>Поки немає опублікованих послуг.</p>
          ) : (
            profile.services.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <b>{s.name}</b>
                <div>Duration: {s.durationMin} min</div>
                <div>
                  Price: {s.price.toFixed(2)} {s.currency ?? "PLN"}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </main>
  );
}
