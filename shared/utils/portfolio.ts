// Shared by the Vue app and the Nitro server (auto-imported from shared/utils).
export interface Portfolio {
  profile: Record<'name' | 'short' | 'role' | 'bio' | 'location' | 'education' | 'pec' | 'availability' | 'email' | 'phone' | 'linkedin', string> & { photo?: string }
  stats: { value: string, label: string }[]
  projects: { title: string, image?: string, status: string, done: boolean, employer: string, role: string, scale: string, description: string, tags: string[] }[]
  experience: { when: string, title: string, org: string, points: string[] }[]
  skills: { group: string, items: string[] }[]
  certs: { name: string, issuer: string }[]
}

export const DEFAULT_DATA: Portfolio = {
  profile: {
    name: 'Ali Moavia Tahir',
    short: 'A. M. Tahir',
    role: 'Civil Engineer · Fuel Station Construction · Site Engineering & QA/QC',
    bio: "PEC-registered civil engineer based in Lahore. I work as Project Engineer and Maintenance Engineer on Saudi Aramco fuel stations, from excavation and sub-base to canopy erection and finishing, and I'm looking to bring that experience to infrastructure and energy projects abroad.",
    location: 'Lahore, Pakistan',
    education: 'BSc Civil Engineering, UET Lahore, 2021–2025',
    pec: 'CIVIL 078717',
    availability: "I'm open to site engineering, QA/QC and retail engineering roles in the energy and infrastructure sector, in Pakistan and overseas.",
    email: 'alimoavia118@gmail.com',
    phone: '+92 346 5924118',
    linkedin: 'https://linkedin.com/in/Ali-Moavia-Tahir',
    photo: ''
  },
  stats: [
    { value: '~2 yrs', label: 'site and estimation experience' },
    { value: '3', label: 'fuel station projects (Aramco, Total PARCO)' },
    { value: '5', label: 'subcontractor teams coordinated' },
    { value: '125 kL', label: 'underground storage on one site' }
  ],
  projects: [
    { title: 'Saudi Aramco COCO fuel station, Peco Road, Lahore', status: 'Completed May 2026', done: true, employer: 'Eesha Developers', role: 'Project Engineer, greenfield build',
      scale: "118' × 30' steel canopy (3,540 sq ft), 4 dispenser islands, four underground tanks (125 kL in total), two-storey building (2,250 sq ft of floor area)",
      description: 'Supervised the full construction sequence: excavation, leveling, sub-base and base in the forecourt (including tuff pavers), reinforcement checks against the bar bending schedule, shuttering, concrete pours, waterproofing, canopy erection to drawing, flooring, ceiling, paint and plumbing with pressure testing. Coordinated 5 subcontractor teams, looped in electrical and mechanical engineers before slab pours, carried out QA/QC checks and supervised third-party FDT at site.',
      tags: ['Excavation', 'Reinforced concrete', 'Canopy erection', 'QA/QC', 'MEP coordination'] },
    { title: 'Saudi Aramco COCO fuel station, Johar Town, Lahore', status: 'In progress', done: false, employer: 'Eesha Developers', role: 'Project Engineer, current construction site',
      scale: "Site of about 119' × 114', steel canopy 30' × 109' with three dispenser islands, four underground tanks (150 kL in total), two-storey building (1,714 + 1,101 sq ft)",
      description: 'Construction of a Saudi Aramco fuel station with a mart, an oil change bay, offices and a portable tyre shop. I supervise site works and quality control as the project moves through the construction sequence.',
      tags: ['Site supervision', 'QA/QC', 'Underground tanks'] },
    { title: 'Aramco station maintenance', status: 'Ongoing', done: false, employer: 'Eesha Developers', role: 'Maintenance Engineer', scale: 'Existing Aramco stations, Lahore region',
      description: 'Maintenance works at existing Aramco fuel stations, planned with a site safety checklist for each type of work, such as canopy, tank and DB room work.', tags: ['Maintenance', 'HSE'] },
    { title: 'Total PARCO fuel station', status: 'Internship, 2023', done: true, employer: 'Aftab Usman Construction', role: 'Site Engineer Intern', scale: '',
      description: 'Drawing interpretation, quantity estimation, quality control and progress verification with site teams.', tags: ['Quantity estimation', 'Quality control'] },
    { title: 'Harappa heritage sites', status: 'Internship, 2025', done: true, employer: 'Tourism, Archaeology & Museums Dept, Punjab', role: 'Site Engineer Intern', scale: '',
      description: 'Inspection, documentation, drawing reviews and construction monitoring, coordinating on conservation and quality control.', tags: ['Documentation', 'Conservation'] },
    { title: 'NESPAK infrastructure works', status: 'Internship, 2024', done: true, employer: 'NESPAK, Lahore', role: 'Site Engineer Intern', scale: '',
      description: 'Supervised storm water drain works, supported basic-level asphalt works, and assisted with QA and material testing coordination.', tags: ['Drainage', 'Asphalt', 'Material testing'] }
  ],
  experience: [
    { when: 'Dec 2025 – present', title: 'Project Engineer and Maintenance Engineer, Fuel Stations', org: 'Eesha Developers, Lahore',
      points: ['Delivered the greenfield Saudi Aramco COCO station on Peco Road, Lahore.', 'Supervising construction of an Aramco station in Johar Town (150 kL underground storage, three dispenser islands).', 'Handle maintenance work at existing Aramco stations across the Lahore region.', 'Material inspection and testing, reinforcement and formwork checks, and QA/QC on every pour.', 'Coordinate subcontractors and MEP trades; supervise third-party testing.'] },
    { when: 'Oct – Dec 2025', title: 'Estimation Engineer', org: 'Estmanexx', points: ['Quantity takeoffs and cost estimates for US residential and commercial projects.', 'Read drawings and specifications to calculate material quantities.'] },
    { when: 'Jul – Sep 2025', title: 'Site Engineer Intern', org: 'Tourism, Archaeology & Museums Department, Punjab', points: [] },
    { when: 'May – Jul 2024', title: 'Site Engineer Intern', org: 'NESPAK', points: [] },
    { when: 'May – Oct 2023', title: 'Site Engineer Intern', org: 'Aftab Usman Construction', points: [] }
  ],
  skills: [
    { group: 'On site', items: ['Construction supervision', 'Reinforced concrete', 'Waterproofing', 'Excavation and sub-base', 'Canopy erection', 'MEP coordination', 'Drawing interpretation'] },
    { group: 'Quality and safety', items: ['QA/QC inspections', 'Material testing', 'BBS steel checking', 'FDT supervision', 'HSE compliance', 'Contractor and consultant coordination'] },
    { group: 'Estimation and software', items: ['Quantity takeoff', 'Cost estimation', 'AutoCAD 2D/3D', 'SAP2000', 'PlanSwift', 'Primavera P6', 'Smartsheet', 'MS Office'] }
  ],
  certs: [
    { name: 'ACI member', issuer: 'American Concrete Institute' },
    { name: 'Concrete Floor and Slab Construction', issuer: 'ACI course' },
    { name: 'Strategies for Effective Quality Control', issuer: 'ACI course' },
    { name: 'Control of Cracking in Concrete Structures', issuer: 'ACI course' },
    { name: 'Primavera P6 Essential Training', issuer: 'LinkedIn Learning' },
    { name: 'Mastering Bitumen', issuer: 'Coursera' },
    { name: 'Active Listening', issuer: 'Coursera' },
    { name: 'Temperature Variations in Tuff Tiles Made from Industrial Waste', issuer: 'Research' }
  ]
};

// Guards the PUT endpoint and imported files: right shape or rejected.
export function isValidPortfolio(d: any): d is Portfolio {
  return !!d && typeof d === 'object' && !!d.profile && typeof d.profile === 'object'
    && ['stats', 'projects', 'experience', 'skills', 'certs'].every(k => Array.isArray(d[k]))
}
