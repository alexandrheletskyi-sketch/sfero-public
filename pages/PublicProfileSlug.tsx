
import Head from 'next/head'
import type { GetServerSideProps } from 'next'

type Service = { id: string; title: string; durationMin: number; priceCents: number; currency: string }
type Profile = { name: string; bio?: string; services: Service[] }
type Props = { slug: string; profile: Profile | null }

export default function PublicProfile({ slug, profile }: Props) {
  const title = profile?.name ? `${profile.name} — Sfero` : `Profile ${slug} — Sfero`
  const desc = profile?.bio || 'Book services in minutes via one smart link'
  const ogUrl = `https://sfero.app/public/${encodeURIComponent(slug)}`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={ogUrl} />
      </Head>
      <main style={{fontFamily:'system-ui', padding:'48px', maxWidth:880, margin:'0 auto'}}>
        <h1>Public profile: {slug}</h1>
        {!profile && <p>Public data not found (replace mock with your API in getServerSideProps)</p>}
        {profile && (
          <section>
            <p style={{opacity:.8}}>{profile.bio}</p>
            <h2 style={{marginTop:24}}>Services</h2>
            <ul style={{display:'grid', gap:12, padding:0, listStyle:'none'}}>
              {profile.services.map(s => (
                <li key={s.id} style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
                  <div style={{fontWeight:600}}>{s.title}</div>
                  <div>Duration: {s.durationMin} min</div>
                  <div>Price: {(s.priceCents/100).toFixed(2)} {s.currency}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.query.slug || '')
  const profile: Profile = {
    name: slug.replace(/-/g,' '),
    bio: 'Demo profile from SSR. Replace with real public API.',
    services: [
      { id: 'svc1', title: 'Consultation', durationMin: 30, priceCents: 5000, currency: 'PLN' },
      { id: 'svc2', title: 'Coaching', durationMin: 60, priceCents: 12000, currency: 'PLN' }
    ]
  }
  return { props: { slug, profile } }
}
