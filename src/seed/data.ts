/**
 * SAMPLE CONTENT — taken from the placeholder data in design-reference/*.html.
 * Every name, headline, card number and email here is a placeholder, not a real person or story.
 * Everything created from this file is marked `isSample: true`; `pnpm seed:clear` removes it.
 */

export const categories = [
  { name: 'People', description: 'The people doing meaningful work across India.' },
  { name: 'Punjab', description: 'Stories from across Punjab.' },
  { name: 'India', description: 'Stories from across the country.' },
  { name: 'Education', description: 'Schools, libraries, teachers and learners.' },
  { name: 'Business', description: 'Enterprise, cooperatives and livelihoods.' },
  { name: 'Culture', description: 'Crafts, traditions and the arts.' },
  { name: 'Innovation', description: 'Inventors, engineers and new ideas that reach people.' },
  { name: 'Community', description: 'Groups and neighbourhoods solving problems together.' },
  { name: 'Environment', description: 'Land, water, energy and climate.' },
  { name: 'Achievements', description: 'Milestones in sport, science, education and enterprise.' },
  {
    name: 'Ground Reports',
    description: 'Long-form reporting from the places where stories happen.',
  },
]

export const locations = [
  ['Ludhiana', 'Punjab'],
  ['Chandigarh', 'Chandigarh'],
  ['Amritsar', 'Punjab'],
  ['Sangrur', 'Punjab'],
  ['Bathinda', 'Punjab'],
  ['Patiala', 'Punjab'],
  ['Kochi', 'Kerala'],
  ['Alappuzha', 'Kerala'],
  ['Pune', 'Maharashtra'],
  ['Patna', 'Bihar'],
  ['Gaya', 'Bihar'],
  ['Jaipur', 'Rajasthan'],
  ['Bundi', 'Rajasthan'],
  ['Kohima', 'Nagaland'],
  ['Imphal', 'Manipur'],
  ['Bengaluru', 'Karnataka'],
  ['Dantewada', 'Chhattisgarh'],
] as const

export type SamplePerson = {
  name: string
  designation: string
  roleType: 'editor' | 'reporter' | 'photographer' | 'contributor'
  city: string
  card: string
  joined: string
  shortBio: string
  bio: string
}

export const people: SamplePerson[] = [
  {
    name: 'Rohit Bains',
    designation: 'Founding Editor',
    roleType: 'editor',
    city: 'Chandigarh',
    card: 'BOB/001',
    joined: '2023-06-01',
    shortBio: 'Sets the editorial direction and edits every story before it is published.',
    bio: 'Rohit sets the editorial direction of Beauty of Bharat and edits every story before it is published.',
  },
  {
    name: 'Harleen Kaur',
    designation: 'Punjab Correspondent',
    roleType: 'reporter',
    city: 'Ludhiana',
    card: 'BOB/004',
    joined: '2024-03-01',
    shortBio: 'Reports on education, agriculture and community life across rural Punjab.',
    bio: 'Harleen reports on education, agriculture and community life across rural Punjab. She grew up in a farming family near Ludhiana and spends most of her week in the villages she writes about.',
  },
  {
    name: 'Arjun Menon',
    designation: 'Kerala Correspondent',
    roleType: 'reporter',
    city: 'Kochi',
    card: 'BOB/007',
    joined: '2024-05-01',
    shortBio: 'Covers coastal communities, traditional crafts and climate resilience.',
    bio: 'Arjun covers coastal communities, traditional crafts and climate resilience across Kerala.',
  },
  {
    name: 'Priya Raghavan',
    designation: 'Innovation Reporter',
    roleType: 'reporter',
    city: 'Pune',
    card: 'BOB/009',
    joined: '2024-07-01',
    shortBio: 'Writes about young inventors, startups and science that reaches villages.',
    bio: 'Priya writes about young inventors, startups and science that reaches villages.',
  },
  {
    name: 'Imran Siddiqui',
    designation: 'Bihar Correspondent',
    roleType: 'reporter',
    city: 'Patna',
    card: 'BOB/011',
    joined: '2024-09-01',
    shortBio: 'Follows stories of public institutions that work — schools, libraries, clinics.',
    bio: 'Imran follows stories of public institutions that work — schools, libraries and clinics across Bihar.',
  },
  {
    name: 'Ananya Sharma',
    designation: 'Ground Reporter',
    roleType: 'reporter',
    city: 'Jaipur',
    card: 'BOB/012',
    joined: '2024-10-01',
    shortBio: 'Travels to villages and small towns for long-form ground reports.',
    bio: 'Ananya travels to villages and small towns for long-form ground reports.',
  },
  {
    name: 'Temjen Ao',
    designation: 'North-East Correspondent',
    roleType: 'reporter',
    city: 'Kohima',
    card: 'BOB/015',
    joined: '2025-01-01',
    shortBio: 'Reports on enterprise, culture and sport from the north-eastern states.',
    bio: 'Temjen reports on enterprise, culture and sport from the north-eastern states.',
  },
  {
    name: 'Meera Iyer',
    designation: 'Photo Editor',
    roleType: 'photographer',
    city: 'Bengaluru',
    card: 'BOB/003',
    joined: '2023-08-01',
    shortBio: 'Leads the photography desk and works with reporters on every visual story.',
    bio: 'Meera leads the photography desk and works with reporters on every visual story.',
  },
]

export type SampleArticle = {
  key: string
  title: string
  deck: string
  excerpt?: string
  category: string
  extraCategories?: string[]
  city: string
  author: string
  date: string
  tone: string
  featured?: boolean
}

/** Dates are IST mornings so they display on the intended day. */
export const articles: SampleArticle[] = [
  {
    key: 'courtyard',
    title: 'In a Ludhiana village, a retired teacher’s courtyard has become the evening school',
    deck: 'No fees, no uniforms, no registers. When the fields go quiet, children from nearby villages walk to her home to finish their homework — and stay to learn far more.',
    excerpt: 'No fees, no uniforms, no registers — just children who want to learn.',
    category: 'Ground Reports',
    extraCategories: ['Punjab', 'Education', 'Community'],
    city: 'Ludhiana',
    author: 'Harleen Kaur',
    date: '2026-10-08T09:00:00+05:30',
    tone: '#E7E1D5',
    featured: true,
  },
  {
    key: 'hearing-aids',
    title: 'Engineering students build low-cost hearing aids for rural clinics',
    deck: 'What began as a final-year project is now being tested in primary health centres across the district.',
    category: 'Innovation',
    city: 'Pune',
    author: 'Priya Raghavan',
    date: '2026-10-07T09:00:00+05:30',
    tone: '#DDE3DC',
  },
  {
    key: 'library',
    title: 'How a district library became the busiest room in town',
    deck: 'Students preparing for exams queue before it opens. The librarian says she has never seen anything like it.',
    category: 'Education',
    city: 'Gaya',
    author: 'Imran Siddiqui',
    date: '2026-10-06T09:00:00+05:30',
    tone: '#E6E0D4',
  },
  {
    key: 'stepwell',
    title: 'Volunteers restored an old stepwell — and the village is using it again',
    deck: 'Months of weekend work by residents brought water, and a gathering place, back to the centre of the village.',
    category: 'Community',
    city: 'Bundi',
    author: 'Ananya Sharma',
    date: '2026-10-05T09:00:00+05:30',
    tone: '#E9DFD3',
  },
  {
    key: 'weavers',
    title: 'A weavers’ cooperative finds buyers across the country',
    deck: 'Traditional patterns, a shared workshop and a simple online store have changed what weaving pays.',
    category: 'Business',
    city: 'Kohima',
    author: 'Temjen Ao',
    date: '2026-10-04T09:00:00+05:30',
    tone: '#E1E0E8',
  },
  {
    key: 'referee',
    title: 'Meet the referee bringing football to girls in the hill towns',
    deck: 'She travels every weekend with a bag of balls and a whistle, and the teams keep growing.',
    category: 'People',
    city: 'Imphal',
    author: 'Rohit Bains',
    date: '2026-10-03T09:00:00+05:30',
    tone: '#DCE2E4',
  },
  {
    key: 'robotics',
    title: 'A government school’s robotics team heads to the national finals',
    deck: 'Their robot is built partly from scrap. Their teacher says the real achievement is the confidence.',
    category: 'Achievements',
    extraCategories: ['Punjab', 'Education'],
    city: 'Amritsar',
    author: 'Harleen Kaur',
    date: '2026-10-02T09:00:00+05:30',
    tone: '#E4E2D6',
  },
  {
    key: 'stubble',
    title: 'Farmers who stopped burning stubble explain what changed their minds',
    deck: 'In one district, a handful of farmers tried something different — and their neighbours noticed.',
    category: 'Ground Reports',
    extraCategories: ['Punjab', 'Environment'],
    city: 'Sangrur',
    author: 'Harleen Kaur',
    date: '2026-10-01T09:00:00+05:30',
    tone: '#E3DED2',
  },
  {
    key: 'boatbuilder',
    title: 'A Kochi boatbuilder is teaching an old craft to a new generation',
    deck: 'Apprentices spend months learning to shape wood the way it has been done for generations.',
    category: 'Culture',
    city: 'Kochi',
    author: 'Arjun Menon',
    date: '2026-09-30T09:00:00+05:30',
    tone: '#D9E1DF',
    featured: true,
  },
  {
    key: 'flood-school',
    title: 'After the floods, a fishing village rebuilt its school first',
    deck: 'When the water went down, residents agreed on one priority before anything else.',
    category: 'Ground Reports',
    city: 'Alappuzha',
    author: 'Arjun Menon',
    date: '2026-09-29T09:00:00+05:30',
    tone: '#D9E1DF',
  },
  {
    key: 'health-worker',
    title: 'The health worker who walks to every home in her block',
    deck: 'Her rounds take her across fields and forest paths, and families know to expect her.',
    category: 'Ground Reports',
    extraCategories: ['People'],
    city: 'Dantewada',
    author: 'Ananya Sharma',
    date: '2026-09-27T09:00:00+05:30',
    tone: '#E7E1DA',
  },
  {
    key: 'solar-dairy',
    title: 'The women running a solar-powered dairy cooperative near Bathinda',
    deck: 'Solar chillers keep the milk fresh, and the cooperative’s members keep the accounts.',
    category: 'Environment',
    extraCategories: ['Punjab', 'Business'],
    city: 'Bathinda',
    author: 'Harleen Kaur',
    date: '2026-09-24T09:00:00+05:30',
    tone: '#DDE3DC',
    featured: true,
  },
  {
    key: 'phulkari',
    title: 'The family keeping Phulkari embroidery alive, one stitch at a time',
    deck: 'Three generations sit together in the afternoons, and each piece takes weeks.',
    category: 'Culture',
    extraCategories: ['Punjab'],
    city: 'Patiala',
    author: 'Harleen Kaur',
    date: '2026-09-15T09:00:00+05:30',
    tone: '#E9DFD3',
  },
]

/** Order of the design's "Most read" list. */
export const mostRead = ['courtyard', 'stepwell', 'hearing-aids', 'solar-dairy', 'library']

/** People shown in the homepage band, in the design's order. */
export const peopleBand = [
  'Rohit Bains',
  'Harleen Kaur',
  'Arjun Menon',
  'Priya Raghavan',
  'Imran Siddiqui',
]

export const PLACEHOLDER_PARAGRAPH =
  'This is sample text for the Beauty of Bharat website. It shows how a story looks on the page and will be replaced with real reporting before launch. Sample text continues here so that the layout, read time and related stories can be checked with realistic lengths.'

export const about = {
  hero: 'A free newspaper focused on uplifting stories about India, from ground zero.',
  why: [
    'Across India, people are building, teaching, healing and creating in ways that rarely reach the front page. Beauty of Bharat exists to report those stories — carefully, accurately and from the places where they happen.',
    'We are free to read, with no paywall and no subscription. Our reporters are named, carry official press cards, and are listed publicly so readers always know who is behind a story.',
  ],
  cover: [
    [
      'People doing meaningful work',
      'Teachers, doctors, farmers, artisans and volunteers making a difference where they live.',
    ],
    [
      'Communities creating change',
      'Villages, neighbourhoods and groups solving problems together.',
    ],
    [
      'Local stories, national attention',
      'Stories from small towns that deserve to be read across the country.',
    ],
    [
      'Indian achievements',
      'Milestones in sport, science, education and enterprise, big and small.',
    ],
    ['Positive developments', 'Schools, roads, clinics and projects that are working — and why.'],
    ['Overlooked stories', 'The reporting mainstream media often misses.'],
  ],
  principles: [
    [
      'Always free',
      'No paywall, no subscriptions, no paid content. Every story is open to every reader.',
    ],
    [
      'From ground zero',
      'Our reporters go to the places they write about and speak to the people involved.',
    ],
    [
      'Named and accountable',
      'Every story carries a byline, and every reporter is listed with their press card.',
    ],
    [
      'Open corrections',
      'When we get something wrong, we fix it and say so. Anyone can request a correction.',
    ],
  ],
}
