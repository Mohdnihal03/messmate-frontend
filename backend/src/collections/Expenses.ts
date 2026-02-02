import type { CollectionConfig } from 'payload'

export const Expenses: CollectionConfig = {
    slug: 'expenses',
    admin: {
        useAsTitle: 'description',
        defaultColumns: ['description', 'amount', 'paidBy', 'date'],
    },
    fields: [
        {
            name: 'amount',
            type: 'number',
            required: true,
            min: 0,
            label: 'Amount (₹)',
        },
        {
            name: 'description',
            type: 'textarea',
            required: true,
            label: 'Description/Notes',
        },
        {
            name: 'date',
            type: 'date',
            required: true,
            defaultValue: () => new Date().toISOString(),
            label: 'Expense Date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'paidBy',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'Paid By',
        },
        {
            name: 'membersPresent',
            type: 'relationship',
            relationTo: 'users',
            hasMany: true,
            required: true,
            label: 'Members Present',
            admin: {
                description: 'Select all members who were present for this expense',
            },
        },
        {
            name: 'room',
            type: 'relationship',
            relationTo: 'rooms',
            required: true,
            label: 'Room',
        },
        {
            name: 'category',
            type: 'select',
            required: true,
            options: [
                { label: 'Groceries', value: 'groceries' },
                { label: 'Dining', value: 'dining' },
                { label: 'Utilities', value: 'utilities' },
                { label: 'Others', value: 'others' },
            ],
            defaultValue: 'others',
            label: 'Category',
        },
        {
            name: 'billImage',
            type: 'upload',
            relationTo: 'media',
            required: false,
            label: 'Bill Image',
        },
    ],
    access: {
        read: ({ req: { user } }) => {
            // Users can only read expenses from their rooms
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
