import type { CollectionConfig } from 'payload'

export const Settlements: CollectionConfig = {
    slug: 'settlements',
    admin: {
        defaultColumns: ['from', 'to', 'amount', 'status', 'dateSettled'],
    },
    fields: [
        {
            name: 'from',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'From User',
        },
        {
            name: 'to',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'To User',
        },
        {
            name: 'amount',
            type: 'number',
            required: true,
            min: 0,
            label: 'Amount (₹)',
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
            ],
            defaultValue: 'pending',
            label: 'Status',
        },
        {
            name: 'dateSettled',
            type: 'date',
            required: false,
            label: 'Date Settled',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'room',
            type: 'relationship',
            relationTo: 'rooms',
            required: true,
            label: 'Room',
        },
    ],
    access: {
        read: ({ req: { user } }) => {
            // Users can only read settlements from their rooms
            if (!user) return false

            return {
                room: {
                    members: {
                        contains: user.id,
                    },
                },
            }
        },
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
}
