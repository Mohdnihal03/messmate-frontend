import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // Allow anyone to create a user (signup)
    create: () => true,
    // Only logged-in users can read user data
    read: () => true,
    // Users can only update their own data
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      if (!user) return false
      // You can add admin role check here later
      return true
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'avatar',
      type: 'text',
      required: false,
      label: 'Avatar (Initial)',
      admin: {
        description: 'Single letter avatar (e.g., R, A, P)',
      },
    },
    {
      name: 'rooms',
      type: 'relationship',
      relationTo: 'rooms',
      hasMany: true,
      label: 'Rooms',
    },
  ],
}
