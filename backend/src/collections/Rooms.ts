import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
    slug: 'rooms',
    admin: {
        useAsTitle: 'name',
    },
    access: {
        create: ({ req: { user } }) => !!user,
        read: ({ req: { user } }) => !!user, // Allow reading to find rooms by invite code
        update: ({ req: { user } }) => !!user, // Allow update so users can join (add themselves to members)
        delete: ({ req: { user } }) => {
            // Only admin can delete (simplified check, real app would check room.admin)
            // For now, allow deletion if user is logged in, but ideally restricted
            return !!user
        }
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Room Name',
        },
        {
            name: 'inviteCode',
            type: 'text',
            required: true,
            unique: true,
            label: 'Invite Code',
            admin: {
                description: 'Unique code for inviting members',
            },
        },
        {
            name: 'admin',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'Room Admin',
        },
        {
            name: 'members',
            type: 'relationship',
            relationTo: 'users',
            hasMany: true,
            label: 'Members',
        },
    ],
    hooks: {
        beforeChange: [
            async ({ data, operation }) => {
                // Auto-generate invite code on creation
                if (operation === 'create' && !data.inviteCode) {
                    data.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()
                }
                return data
            },
        ],
    },
}
