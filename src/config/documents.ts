
export const documentsConfig =
{
    barmaja: {
        id: 'first',
        name: 'Barmaja',
        description: 'Barmaja is a document management system designed to help students and teachers organize and access their academic materials efficiently.',
        files: {
            barmaja1: {
                id: 's1',
                name: "barmaja1",
                description: "This is the first barmaja document",
                type: 'static',
                src: '/documents/barmaja/1.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            },
            barmaja2: {
                id: 's2',
                name: "barmaja2",
                description: "This is the second barmaja document",
                type: 'static',
                src: '/documents/barmaja/2.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            },
            barmaja3: {
                id: 's3',
                name: "barmaja3",
                description: "This is the third barmaja document",
                type: 'static',
                src: '/documents/barmaja/3.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            }
        },
    },
    bita9ata9wim: {
        id: 'second',
        name: 'Bita9a 9wim',
        description: 'Bita9a 9wim is a digital platform that provides students with access to their academic records, including grades, attendance, and other important information.',
        files: {
            taqwim: {
                id: 'taqwim',
                name: 'بطاقة التقويم',
                type: 'interactive',
                component: 'taqwimTach'
            }
        },
    },
    planOfTheYear: {
        id: 'first',
        name: 'mokhatat',
        description: 'mokhatat is a document management system designed to help students and teachers organize and access their academic materials efficiently.',
        files: {
            mokhatat1: {
                id: 's1',
                name: "mokhatat1",
                description: "This is the first mokhatat document",
                type: 'static',
                src: '/documents/barmaja/1.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            },
        }
    }
}