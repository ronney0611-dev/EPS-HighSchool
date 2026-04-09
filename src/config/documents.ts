
export const documentsConfig =
{
    informationCard: {
        id: 'first',
        image: '/',
        name: 'بطاقة المعلومات الشخصية',
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
    },
    jardCard: {
        id: 'first',
        name: 'بطاقة الجرد',
        image: '/',
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
    },
    timeCard: {
        id: 'first',
        name: 'استعمال الزمن',
        image: '/',
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
    },
    barmaja: {
        id: 'first',
        name: 'البرمجة السنوية',
        image: '/images/barmaja.png',
        description: 'Barmaja is a document management system designed to help students and teachers organize and access their academic materials efficiently.',
        files: {
            barmaja1: {
                id: 's1',
                name: "البرمجة السنوية الاولى ثانوي",
                description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى الثالثة ثانوي",
                type: 'static',
                src: '/documents/barmaja/1.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            },
            barmaja2: {
                id: 's2',
                name: "البرمجة السنوية ثانية ثانوي",
                description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى ثانية ثانوي",
                type: 'static',
                src: '/documents/barmaja/2.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            },
            barmaja3: {
                id: 's3',
                name: "البرمجة السنوية اولى ثانوي",
                description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى الاولى ثانوي",
                type: 'static',
                src: '/documents/barmaja/3.pdf',
                thumbnail: '/documents/barmaja/barmaja.png'
            }
        },
    },
    planOfTheYear: {
        id: 'first',
        name: 'المخطط السنوي',
        image: '/images/plan.png',
        description: 'mokhatat is a document management system designed to help students and teachers organize and access their academic materials efficiently.',
        files: {
            mokhatat1: {
                id: 's1',
                name: "المخطط السنوي-ج1",
                description: "بلمسة زر واحدة. حمل المخطط السنوي. الفصل الاول",
                type: 'static',
                src: '/documents/plan/1.pdf',
                thumbnail: '/images/plan.png'
            },
            mokhatat2: {
                id: 's2',
                name: "المخطط السنوي-ج2",
                description: "بلمسة زر واحدة. حمل المخطط السنوي لباقي الفصول",
                type: 'static',
                src: '/documents/plan/2.pdf',
                thumbnail: '/images/plan.png'
            },
        }
    },
    motaba3a: {
        id: 'second',
        name: 'بطاقة الحضور والمتابعة',
        image: '/images/7odor.png',
        description: 'Bita9a 9wim is a digital platform that provides students with access to their academic records, including grades, attendance, and other important information.',
        files: {
            taqwim: {
                id: 'taqwim',
                name: 'بطاقة الحضور والمتابعة',
                description: "بلمسة زر واحدة. حمل بطاقة الحضور والمتابعة للعام الدراسي الكامل",
                type: 'static',
                src: '/documents/barmaja/3ln.docx',
                component: 'taqwimTach',
                thumbnail: '/images/7odor.png',
            }
        },
    },
    bita9ata9wim: {
        id: 'second',
        name: 'التقويم التشخيصي',
        image: '/images/ta9wim.png',
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
    takwin: {
        id: 'second',
        name: 'التقويم التكويني',
        image: '/images/test.png',
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
    ta7sili: {
        id: 'second',
        name: 'التقويم التحصيلي',
        image: '/images/final.png',
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
}