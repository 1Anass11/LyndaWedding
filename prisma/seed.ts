import { PrismaClient, UserRole, InvitationStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create or update themes (Theme has no unique on name, use findFirst)
  const theme1 =
    (await prisma.theme.findFirst({ where: { name: 'Minimal Elegance' } })) ??
    (await prisma.theme.create({
      data: {
        name: 'Minimal Elegance',
        isActive: true,
        tokensJson: {
          colors: {
            bg: '#ffffff',
            surface: '#f9fafb',
            text: '#111827',
            muted: '#6b7280',
            accent: '#8b5cf6',
          },
          fonts: {
            headingFont: 'Inter, sans-serif',
            bodyFont: 'Inter, sans-serif',
          },
          radius: '8px',
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
          },
        },
      },
    }))

  const theme2 =
    (await prisma.theme.findFirst({ where: { name: 'Floral Romance' } })) ??
    (await prisma.theme.create({
      data: {
        name: 'Floral Romance',
        isActive: true,
        tokensJson: {
          colors: {
            bg: '#fef7f0',
            surface: '#fff9f5',
            text: '#2d1810',
            muted: '#8b6f5e',
            accent: '#d4a574',
          },
          fonts: {
            headingFont: 'Playfair Display, serif',
            bodyFont: 'Lora, serif',
          },
          radius: '12px',
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
          },
        },
      },
    }))

  console.log('Created themes:', theme1.name, theme2.name)

  // Simple user (OWNER) – dashboard, create invitations
  const userPassword = await bcrypt.hash('password123', 10)
  const simpleUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    create: {
      email: 'user@example.com',
      name: 'Simple User',
      password: userPassword,
      role: UserRole.OWNER,
    },
    update: { password: userPassword, name: 'Simple User', role: UserRole.OWNER },
  })

  // Admin user (ADMIN) – admin area
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    update: { password: adminPassword, name: 'Admin User', role: UserRole.ADMIN },
  })

  // Dedicated demo account for Lynda & Aymen – no password, cannot log in.
  // Invitation is owned by this account. Guests access via sharing links only.
  const demoOwner = await prisma.user.upsert({
    where: { email: 'lynda-aymen@demo.wedding' },
    create: {
      email: 'lynda-aymen@demo.wedding',
      name: 'Lynda & Aymen',
      password: null, // No login – guests access invitations via link only
      role: UserRole.OWNER,
    },
    update: { name: 'Lynda & Aymen', password: null, role: UserRole.OWNER },
  })

  console.log('Created users:', simpleUser.email, adminUser.email, demoOwner.email)
  console.log('\n--- Login (dashboard / admin) ---')
  console.log('Simple user (OWNER): user@example.com / password123')
  console.log('Admin user (ADMIN):  admin@example.com / admin123')
  console.log('---\n')

  // Create or update invitation – owned by demo account
  const invitation = await prisma.invitation.upsert({
    where: { slug: 'demo-wedding' },
    create: {
      ownerId: demoOwner.id,
      slug: 'demo-wedding',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Demo Wedding',
      locale: 'en',
      eventDate: new Date('2026-04-09T06:15:00Z'),
      themeId: theme1.id,
      contentJson: {
        hero: {
          names: ['Lynda', 'Aymen'],
          date: '09/04/2026',
          message: 'Nous avons le plaisir de vous inviter à célébrer notre jour le plus spécial avec nous.',
        },
        sections: {
          story: {
            enabled: true,
            content: 'Nous nous sommes rencontrés il y a cinq ans et avons su immédiatement que nous étions faits l\'un pour l\'autre.',
          },
          countdown: { enabled: true },
          registry: { enabled: false },
        },
        faqs: [],
        guestMessageSection: { enabled: true, label: 'Écrivez un mot' },
        accommodations: [],
      },
      settingsJson: {
        rsvpEnabled: true,
        previewEnabled: true,
        allowEdit: false,
        requireEmail: false,
        requirePhone: false,
      },
    },
    update: {
      ownerId: demoOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Demo Wedding',
      themeId: theme1.id,
      eventDate: new Date('2026-04-09T06:15:00Z'),
      contentJson: {
        hero: {
          names: ['Lynda', 'Aymen'],
          date: '09/04/2026',
          message: 'Nous avons le plaisir de vous inviter à célébrer notre jour le plus spécial avec nous.',
        },
        sections: { story: { enabled: true, content: 'Nous nous sommes rencontrés il y a cinq ans et avons su immédiatement que nous étions faits l\'un pour l\'autre.' }, countdown: { enabled: true }, registry: { enabled: false } },
        faqs: [],
        guestMessageSection: { enabled: true, label: 'Écrivez un mot' },
        accommodations: [],
      },
      settingsJson: {
        rsvpEnabled: true,
        previewEnabled: true,
        allowEdit: false,
        requireEmail: false,
        requirePhone: false,
      },
    },
  })

  console.log('Created invitation:', invitation.slug)

  // Delete existing events for this invitation, then create
  await prisma.event.deleteMany({ where: { invitationId: invitation.id } })

  const ceremony = await prisma.event.create({
    data: {
      invitationId: invitation.id,
      name: 'Cérémonie',
      startsAt: new Date('2026-04-09T06:15:00Z'),
      endsAt: new Date('2026-04-09T07:15:00Z'),
      locationName: 'Kobet Nhas',
      address: 'Kobet Nhas',
      mapLat: 40.7128,
      mapLng: -74.0060,
      notes: 'Merci d\'arriver 15 minutes à l\'avance. Tenue : semi-formelle.',
    },
  })

  const reception = await prisma.event.create({
    data: {
      invitationId: invitation.id,
      name: 'Réception',
      startsAt: new Date('2026-04-09T08:00:00Z'),
      endsAt: new Date('2026-04-09T23:00:00Z'),
      locationName: 'Kobet Nhas',
      address: 'Kobet Nhas',
      mapLat: 40.7128,
      mapLng: -74.0060,
      notes: 'Dîner et soirée dansante.',
    },
  })

  console.log('Created events:', ceremony.name, reception.name)

  // Account for Mohamed & Samar - owns all four Samar/Outiya invitations
  // (samar, samar-ar, samar-outiya, samar-outiya-ar), so logging in here shows
  // all four on the dashboard, each with its own RSVP messages page.
  const samarOwnerPassword = await bcrypt.hash('wedding10082026', 10)
  const samarOwner = await prisma.user.upsert({
    where: { email: 'wedding@samar.mohamed.com' },
    create: {
      email: 'wedding@samar.mohamed.com',
      name: 'Mohamed & Samar',
      password: samarOwnerPassword,
      role: UserRole.OWNER,
    },
    update: { name: 'Mohamed & Samar', password: samarOwnerPassword, role: UserRole.OWNER },
  })

  const samarContent = {
    hero: {
      names: ['Mohamed', 'Samar'],
      date: '10/08/2026',
      message: 'Nous avons le plaisir de vous inviter à célébrer notre mariage avec nous.',
      media: {
        coverImage: '/samar/dome/video_MS-cover.jpg',
        introVideo: '/samar/dome/video_MS.mp4',
        heroVideos: ['/samar/dome/plantilla-floral-v2-Cl-HZWE8.mp4'],
        audioEnabled: true,
        variant: 'oval',
      },
    },
    sections: {
      story: { enabled: false, content: '' },
      countdown: { enabled: true },
      registry: { enabled: false },
    },
    faqs: [],
    guestMessageSection: { enabled: false, label: 'Écrivez un mot' },
    accommodations: [],
  }

  const samarSettings = {
    rsvpEnabled: true,
    previewEnabled: true,
    allowEdit: false,
    requireEmail: false,
    requirePhone: false,
  }

  const samarInvitation = await prisma.invitation.upsert({
    where: { slug: 'samar' },
    create: {
      ownerId: samarOwner.id,
      slug: 'samar',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Mariage Mohamed & Samar',
      locale: 'fr',
      eventDate: new Date('2026-08-10T17:00:00Z'),
      themeId: theme2.id,
      contentJson: samarContent,
      settingsJson: samarSettings,
    },
    update: {
      ownerId: samarOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Mariage Mohamed & Samar',
      themeId: theme2.id,
      eventDate: new Date('2026-08-10T17:00:00Z'),
      contentJson: samarContent,
      settingsJson: samarSettings,
    },
  })

  console.log('Created invitation:', samarInvitation.slug)

  await prisma.event.deleteMany({ where: { invitationId: samarInvitation.id } })

  const samarCeremony = await prisma.event.create({
    data: {
      invitationId: samarInvitation.id,
      name: 'Mariage',
      startsAt: new Date('2026-08-10T20:00:00Z'),
      endsAt: null,
      locationName: 'Salle des fêtes Royal Palace',
      address: 'Salle des fêtes Royal Palace, Béni Khalled, Nabeul, Tunisia',
      imageUrl: '/samar/dome/royal_palace.jpg',
      notes: null,
    },
  })

  console.log('Created events:', samarCeremony.name)

  // Arabic (RTL) version of the Mohamed & Samar invitation, same design/media/colors,
  // additive alongside the French `samar` slug (does not replace it).
  const samarArContent = {
    hero: {
      names: ['محمد', 'سمر'],
      date: '10/08/2026',
      subtitle: 'نحن نتزوج',
      message: 'يسعدنا دعوتكم للاحتفال بزفافنا معنا.',
      media: {
        coverImage: '/samar/dome/video_MS-cover.jpg',
        introVideo: '/samar/dome/video_MS.mp4',
        heroVideos: ['/samar/dome/plantilla-floral-v2-Cl-HZWE8.mp4'],
        audioEnabled: true,
        variant: 'oval',
      },
    },
    sections: {
      story: { enabled: false, content: '' },
      countdown: { enabled: true },
      registry: { enabled: false },
    },
    faqs: [],
    guestMessageSection: { enabled: false, label: 'اكتبوا كلمة' },
    accommodations: [],
  }

  const samarArSettings = {
    rsvpEnabled: true,
    previewEnabled: true,
    allowEdit: false,
    requireEmail: false,
    requirePhone: false,
  }

  const samarArInvitation = await prisma.invitation.upsert({
    where: { slug: 'samar-ar' },
    create: {
      ownerId: samarOwner.id,
      slug: 'samar-ar',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'حفل زفاف محمد وسمر',
      locale: 'ar',
      eventDate: new Date('2026-08-10T20:00:00Z'),
      themeId: theme2.id,
      contentJson: samarArContent,
      settingsJson: samarArSettings,
    },
    update: {
      ownerId: samarOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'حفل زفاف محمد وسمر',
      themeId: theme2.id,
      eventDate: new Date('2026-08-10T20:00:00Z'),
      contentJson: samarArContent,
      settingsJson: samarArSettings,
    },
  })

  console.log('Created invitation:', samarArInvitation.slug)

  await prisma.event.deleteMany({ where: { invitationId: samarArInvitation.id } })

  const samarArCeremony = await prisma.event.create({
    data: {
      invitationId: samarArInvitation.id,
      name: 'حفل الزفاف',
      startsAt: new Date('2026-08-10T20:00:00Z'),
      endsAt: null,
      locationName: 'Salle des fêtes Royal Palace',
      address: 'Salle des fêtes Royal Palace, Béni Khalled, Nabeul, Tunisia',
      imageUrl: '/samar/dome/royal_palace.jpg',
      notes: null,
    },
  })

  console.log('Created events:', samarArCeremony.name)

  // Outiya (Tunisian pre-wedding day, hosted by the bride) — separate pages from the
  // wedding day itself, same design/media, own date/countdown/place. French + Arabic.
  const samarOutiyaContent = {
    hero: {
      names: ['Mohamed', 'Samar'],
      date: '07/08/2026',
      secondDate: '10/08/2026',
      subtitle: 'Invitation de mariage\net Outiya',
      message: 'Nous avons le plaisir de vous inviter à célébrer notre Outiya avec nous.',
      media: {
        coverImage: '/samar/dome/video_MS-cover.jpg',
        introVideo: '/samar/dome/video_MS.mp4',
        heroVideos: ['/samar/dome/plantilla-floral-v2-Cl-HZWE8.mp4'],
        audioEnabled: true,
        variant: 'oval',
      },
    },
    sections: {
      story: { enabled: false, content: '' },
      countdown: { enabled: true },
      registry: { enabled: false },
    },
    faqs: [],
    guestMessageSection: { enabled: false, label: 'Écrivez un mot' },
    accommodations: [],
  }

  const samarOutiyaSettings = {
    rsvpEnabled: true,
    previewEnabled: true,
    allowEdit: false,
    requireEmail: false,
    requirePhone: false,
  }

  const samarOutiyaInvitation = await prisma.invitation.upsert({
    where: { slug: 'samar-outiya' },
    create: {
      ownerId: samarOwner.id,
      slug: 'samar-outiya',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Outiya - Mohamed & Samar',
      locale: 'fr',
      eventDate: new Date('2026-08-07T20:00:00Z'),
      themeId: theme2.id,
      contentJson: samarOutiyaContent,
      settingsJson: samarOutiyaSettings,
    },
    update: {
      ownerId: samarOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'Outiya - Mohamed & Samar',
      themeId: theme2.id,
      eventDate: new Date('2026-08-07T20:00:00Z'),
      contentJson: samarOutiyaContent,
      settingsJson: samarOutiyaSettings,
    },
  })

  console.log('Created invitation:', samarOutiyaInvitation.slug)

  await prisma.event.deleteMany({ where: { invitationId: samarOutiyaInvitation.id } })

  const samarOutiyaEvent = await prisma.event.create({
    data: {
      invitationId: samarOutiyaInvitation.id,
      name: 'Outiya',
      startsAt: new Date('2026-08-07T20:00:00Z'),
      endsAt: null,
      locationName: 'Soliman Plage',
      address: null,
      mapLat: 36.73031,
      mapLng: 10.46827,
      notes: null,
    },
  })

  const samarOutiyaWedding = await prisma.event.create({
    data: {
      invitationId: samarOutiyaInvitation.id,
      name: 'Mariage',
      startsAt: new Date('2026-08-10T20:00:00Z'),
      endsAt: null,
      locationName: 'Salle des fêtes Royal Palace',
      address: 'Salle des fêtes Royal Palace, Béni Khalled, Nabeul, Tunisia',
      imageUrl: '/samar/dome/royal_palace.jpg',
      notes: null,
    },
  })

  console.log('Created events:', samarOutiyaEvent.name, samarOutiyaWedding.name)

  // Arabic (RTL) version of the Outiya page — same pattern as samar-ar.
  const samarOutiyaArContent = {
    hero: {
      names: ['محمد', 'سمر'],
      date: '07/08/2026',
      secondDate: '10/08/2026',
      subtitle: 'دعوة الزفاف\nوالوطية',
      message: 'يسعدنا دعوتكم للاحتفال بالوطية معنا.',
      media: {
        coverImage: '/samar/dome/video_MS-cover.jpg',
        introVideo: '/samar/dome/video_MS.mp4',
        heroVideos: ['/samar/dome/plantilla-floral-v2-Cl-HZWE8.mp4'],
        audioEnabled: true,
        variant: 'oval',
      },
    },
    sections: {
      story: { enabled: false, content: '' },
      countdown: { enabled: true },
      registry: { enabled: false },
    },
    faqs: [],
    guestMessageSection: { enabled: false, label: 'اكتبوا كلمة' },
    accommodations: [],
  }

  const samarOutiyaArSettings = {
    rsvpEnabled: true,
    previewEnabled: true,
    allowEdit: false,
    requireEmail: false,
    requirePhone: false,
  }

  const samarOutiyaArInvitation = await prisma.invitation.upsert({
    where: { slug: 'samar-outiya-ar' },
    create: {
      ownerId: samarOwner.id,
      slug: 'samar-outiya-ar',
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'الوطية - محمد وسمر',
      locale: 'ar',
      eventDate: new Date('2026-08-07T20:00:00Z'),
      themeId: theme2.id,
      contentJson: samarOutiyaArContent,
      settingsJson: samarOutiyaArSettings,
    },
    update: {
      ownerId: samarOwner.id,
      status: InvitationStatus.PUBLISHED,
      publishedAt: new Date(),
      title: 'الوطية - محمد وسمر',
      themeId: theme2.id,
      eventDate: new Date('2026-08-07T20:00:00Z'),
      contentJson: samarOutiyaArContent,
      settingsJson: samarOutiyaArSettings,
    },
  })

  console.log('Created invitation:', samarOutiyaArInvitation.slug)

  await prisma.event.deleteMany({ where: { invitationId: samarOutiyaArInvitation.id } })

  const samarOutiyaArEvent = await prisma.event.create({
    data: {
      invitationId: samarOutiyaArInvitation.id,
      name: 'الوطية',
      startsAt: new Date('2026-08-07T20:00:00Z'),
      endsAt: null,
      locationName: 'Soliman Plage',
      address: null,
      mapLat: 36.73031,
      mapLng: 10.46827,
      notes: null,
    },
  })

  const samarOutiyaArWedding = await prisma.event.create({
    data: {
      invitationId: samarOutiyaArInvitation.id,
      name: 'حفل الزفاف',
      startsAt: new Date('2026-08-10T20:00:00Z'),
      endsAt: null,
      locationName: 'Salle des fêtes Royal Palace',
      address: 'Salle des fêtes Royal Palace, Béni Khalled, Nabeul, Tunisia',
      imageUrl: '/samar/dome/royal_palace.jpg',
      notes: null,
    },
  })

  console.log('Created events:', samarOutiyaArEvent.name, samarOutiyaArWedding.name)

  // Sharing links for the demo invitation (no login required – guests access via link only)
  const baseUrl = process.env.APP_URL || 'http://localhost:3000'
  console.log('\n--- Sharing links for Lynda & Aymen (demo-wedding) ---')
  console.log(`By user ID: ${baseUrl}/u/${demoOwner.id}`)
  console.log(`By slug:    ${baseUrl}/i/demo-wedding`)
  console.log(`Alt:        ${baseUrl}/wedding`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('\n--- Sharing links for Mohamed & Samar (samar) ---')
  console.log(`By user ID: ${baseUrl}/u/${samarOwner.id}`)
  console.log(`By slug:    ${baseUrl}/i/samar`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('\n--- Sharing links for Mohamed & Samar, Arabic (samar-ar) ---')
  console.log(`By slug:    ${baseUrl}/i/samar-ar`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('\n--- Sharing links for Outiya (samar-outiya) ---')
  console.log(`By slug:    ${baseUrl}/i/samar-outiya`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('\n--- Sharing links for Outiya, Arabic (samar-outiya-ar) ---')
  console.log(`By slug:    ${baseUrl}/i/samar-outiya-ar`)
  console.log('--- Guests need no account. Share these links only. ---\n')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
